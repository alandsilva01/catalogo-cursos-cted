namespace CatalogoCursos.Api.Models;

public class Categoria
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    // Nome do arquivo SVG em wwwroot/assets/icons (ex.: icon-matematica-20px.svg)
    public string Icone { get; set; } = string.Empty;

    // Cor de fundo da etiqueta exibida nos cards (hex)
    public string Cor { get; set; } = string.Empty;

    public List<Curso> Cursos { get; set; } = new();
}
