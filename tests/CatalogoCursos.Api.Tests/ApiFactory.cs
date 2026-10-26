using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace CatalogoCursos.Api.Tests;

// Sobe a aplicacao inteira em memoria com um SQLite temporario,
// para os testes nao dependerem nem alterarem o banco de desenvolvimento.
public class ApiFactory : WebApplicationFactory<Program>
{
    private readonly string _arquivoBanco = Path.Combine(Path.GetTempPath(), $"catalogo-testes-{Guid.NewGuid():N}.db");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("Database:Provider", "Sqlite");
        builder.UseSetting("ConnectionStrings:Sqlite", $"Data Source={_arquivoBanco};Pooling=False");
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing && File.Exists(_arquivoBanco))
            File.Delete(_arquivoBanco);
    }
}
