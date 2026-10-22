using CatalogoCursos.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CatalogoCursos.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Curso> Cursos => Set<Curso>();
    public DbSet<Modulo> Modulos => Set<Modulo>();
    public DbSet<Aula> Aulas => Set<Aula>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Categoria>(e =>
        {
            e.ToTable("categorias");
            e.Property(c => c.Nome).HasMaxLength(80).IsRequired();
            e.Property(c => c.Slug).HasMaxLength(80).IsRequired();
            e.Property(c => c.Icone).HasMaxLength(120);
            e.Property(c => c.Cor).HasMaxLength(7);
            e.HasIndex(c => c.Slug).IsUnique();
        });

        modelBuilder.Entity<Curso>(e =>
        {
            e.ToTable("cursos");
            e.Property(c => c.NomeCompleto).HasMaxLength(160).IsRequired();
            e.Property(c => c.NomeBreve).HasMaxLength(60).IsRequired();
            e.Property(c => c.Slug).HasMaxLength(160).IsRequired();
            e.Property(c => c.Resumo).HasMaxLength(300).IsRequired();
            e.Property(c => c.Descricao).IsRequired();
            e.Property(c => c.PublicoAlvo).HasMaxLength(300).IsRequired();
            e.Property(c => c.Certificacao).HasMaxLength(60);
            e.Property(c => c.ImagemUrl).HasMaxLength(255);
            e.Property(c => c.NomeBusca).HasMaxLength(240).IsRequired();

            // Enums gravados como texto: o banco fica legivel ("Ead", "EmBreve") em vez de 0, 1, 2
            e.Property(c => c.Modalidade).HasConversion<string>().HasMaxLength(20);
            e.Property(c => c.Status).HasConversion<string>().HasMaxLength(20);

            e.HasIndex(c => c.Slug).IsUnique();
            e.HasIndex(c => c.Status);
            e.HasIndex(c => c.Modalidade);

            e.HasOne(c => c.Categoria)
                .WithMany(c => c.Cursos)
                .HasForeignKey(c => c.CategoriaId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Modulo>(e =>
        {
            e.ToTable("modulos");
            e.Property(m => m.Titulo).HasMaxLength(160).IsRequired();
            e.HasOne(m => m.Curso)
                .WithMany(c => c.Modulos)
                .HasForeignKey(m => m.CursoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Aula>(e =>
        {
            e.ToTable("aulas");
            e.Property(a => a.Titulo).HasMaxLength(160).IsRequired();
            e.Property(a => a.Tipo).HasConversion<string>().HasMaxLength(20);
            e.HasOne(a => a.Modulo)
                .WithMany(m => m.Aulas)
                .HasForeignKey(a => a.ModuloId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
