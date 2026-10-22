using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace CatalogoCursos.Api.Data;

public static class BancoDeDados
{
    // Escolhe o banco pela configuracao:
    //   Database:Provider = "Sqlite"   -> arquivo local, sem instalar nada (padrao para rodar na maquina)
    //   Database:Provider = "Postgres" -> PostgreSQL (usado na publicacao)
    public static IServiceCollection AddBancoDeDados(this IServiceCollection services, IConfiguration config)
    {
        var provider = config["Database:Provider"] ?? "Sqlite";

        if (provider.Equals("Postgres", StringComparison.OrdinalIgnoreCase))
        {
            var conexao = ConexaoPostgres(config)
                ?? throw new InvalidOperationException(
                    "Informe ConnectionStrings:Postgres ou a variável DATABASE_URL para usar o PostgreSQL.");

            services.AddDbContext<AppDbContext>(o => o.UseNpgsql(conexao));
        }
        else
        {
            var conexao = config.GetConnectionString("Sqlite") ?? "Data Source=App_Data/catalogo.db";
            CriarPastaDoArquivo(conexao);
            services.AddDbContext<AppDbContext>(o => o.UseSqlite(conexao));
        }

        return services;
    }

    public static async Task PrepararAsync(IServiceProvider services, CancellationToken ct = default)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.EnsureCreatedAsync(ct);
        await SeedData.PopularAsync(db, ct);
    }

    // dotnet run -- --gerar-sql : grava os scripts de criacao das tabelas em database/
    public static void GerarScripts(string pasta)
    {
        Directory.CreateDirectory(pasta);

        var postgres = new DbContextOptionsBuilder<AppDbContext>().UseNpgsql().Options;
        var sqlite = new DbContextOptionsBuilder<AppDbContext>().UseSqlite("Data Source=:memory:").Options;

        using (var db = new AppDbContext(postgres))
            File.WriteAllText(Path.Combine(pasta, "schema-postgres.sql"), db.Database.GenerateCreateScript());

        using (var db = new AppDbContext(sqlite))
            File.WriteAllText(Path.Combine(pasta, "schema-sqlite.sql"), db.Database.GenerateCreateScript());
    }

    private static string? ConexaoPostgres(IConfiguration config)
    {
        var conexao = config.GetConnectionString("Postgres");
        if (!string.IsNullOrWhiteSpace(conexao))
            return conexao;

        // Provedores como Neon e Render entregam a conexao no formato URL: postgresql://usuario:senha@host/banco
        var url = config["DATABASE_URL"];
        return string.IsNullOrWhiteSpace(url) ? null : ConverterUrl(url);
    }

    private static string ConverterUrl(string url)
    {
        var uri = new Uri(url);
        var credenciais = uri.UserInfo.Split(':', 2);

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.IsDefaultPort || uri.Port <= 0 ? 5432 : uri.Port,
            Database = uri.AbsolutePath.TrimStart('/'),
            Username = Uri.UnescapeDataString(credenciais[0]),
            Password = credenciais.Length > 1 ? Uri.UnescapeDataString(credenciais[1]) : null,
            SslMode = SslMode.Require
        };

        return builder.ConnectionString;
    }

    private static void CriarPastaDoArquivo(string conexaoSqlite)
    {
        var arquivo = new Microsoft.Data.Sqlite.SqliteConnectionStringBuilder(conexaoSqlite).DataSource;
        var pasta = Path.GetDirectoryName(Path.GetFullPath(arquivo));
        if (!string.IsNullOrEmpty(pasta))
            Directory.CreateDirectory(pasta);
    }
}
