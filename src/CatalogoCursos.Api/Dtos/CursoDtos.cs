namespace CatalogoCursos.Api.Dtos;

// Formatos devolvidos pela API. Separados das entidades para nao expor campos internos (ex.: NomeBusca).

public record CategoriaDto(int Id, string Nome, string Slug, string Icone, string Cor);

public record OpcaoDto(string Valor, string Rotulo);

public record CursoResumoDto(
    int Id,
    string Slug,
    string NomeCompleto,
    string NomeBreve,
    string Resumo,
    CategoriaDto Categoria,
    OpcaoDto Modalidade,
    OpcaoDto Status,
    int CargaHoraria,
    string PublicoAlvo,
    string ImagemUrl,
    DateOnly? DataDisponibilizacao,
    bool Destaque);

public record AulaDto(int Ordem, string Titulo, string Descricao, OpcaoDto Tipo, int DuracaoMinutos);

public record ModuloDto(int Ordem, string Titulo, string Descricao, int CargaHorariaMinutos, IReadOnlyList<AulaDto> Aulas);

public record CursoDetalheDto(
    int Id,
    string Slug,
    string NomeCompleto,
    string NomeBreve,
    string Resumo,
    string Descricao,
    CategoriaDto Categoria,
    OpcaoDto Modalidade,
    OpcaoDto Status,
    int CargaHoraria,
    string PublicoAlvo,
    string Certificacao,
    string ImagemUrl,
    DateOnly? DataDisponibilizacao,
    IReadOnlyList<ModuloDto> Modulos);

public record ListaCursosDto(int Total, IReadOnlyList<CursoResumoDto> Itens);

public record FiltroCategoriaDto(string Valor, string Rotulo, string Icone, string Cor, int Quantidade);

public record FiltroOpcaoDto(string Valor, string Rotulo, int Quantidade);

public record FiltrosDto(
    IReadOnlyList<FiltroCategoriaDto> Categorias,
    IReadOnlyList<FiltroOpcaoDto> Modalidades,
    IReadOnlyList<FiltroOpcaoDto> Status);

public record IndicadoresDto(
    int TotalCursos,
    int TotalCategorias,
    int CargaHorariaTotal,
    int InscricoesAbertas,
    IReadOnlyList<FiltroOpcaoDto> PorCategoria,
    IReadOnlyList<FiltroOpcaoDto> PorModalidade,
    IReadOnlyList<FiltroOpcaoDto> PorStatus);
