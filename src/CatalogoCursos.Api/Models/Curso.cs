namespace CatalogoCursos.Api.Models;

public enum Modalidade
{
    Ead,
    Presencial,
    Hibrido
}

public enum StatusCurso
{
    InscricoesAbertas,
    EmBreve,
    Encerrado
}

public class Curso
{
    public int Id { get; set; }
    public string NomeCompleto { get; set; } = string.Empty;
    public string NomeBreve { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    // Texto curto exibido no card; Descricao e o texto completo da pagina de detalhes
    public string Resumo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;

    public int CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }

    public Modalidade Modalidade { get; set; }
    public StatusCurso Status { get; set; }
    public int CargaHoraria { get; set; }
    public string PublicoAlvo { get; set; } = string.Empty;
    public string Certificacao { get; set; } = "SESI";
    public string ImagemUrl { get; set; } = string.Empty;
    public DateOnly? DataDisponibilizacao { get; set; }
    public bool Destaque { get; set; }

    // Nome em minusculas e sem acentos, usado na pesquisa ("matematica" encontra "Matemática")
    public string NomeBusca { get; set; } = string.Empty;

    public List<Modulo> Modulos { get; set; } = new();
}
