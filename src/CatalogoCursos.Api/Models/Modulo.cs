namespace CatalogoCursos.Api.Models;

public enum TipoAula
{
    Video,
    Leitura,
    Atividade,
    Avaliacao
}

public class Modulo
{
    public int Id { get; set; }
    public int CursoId { get; set; }
    public Curso? Curso { get; set; }
    public int Ordem { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public List<Aula> Aulas { get; set; } = new();
}

public class Aula
{
    public int Id { get; set; }
    public int ModuloId { get; set; }
    public Modulo? Modulo { get; set; }
    public int Ordem { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public TipoAula Tipo { get; set; }
    public int DuracaoMinutos { get; set; }
}
