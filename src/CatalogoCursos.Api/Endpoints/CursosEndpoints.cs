using CatalogoCursos.Api.Data;
using CatalogoCursos.Api.Dtos;
using CatalogoCursos.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CatalogoCursos.Api.Endpoints;

public static class CursosEndpoints
{
    private const int TamanhoMaximoBusca = 100;

    public static void MapCursosEndpoints(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api").WithTags("Catálogo");

        api.MapGet("/cursos", ListarCursos)
            .WithSummary("Lista os cursos")
            .WithDescription("Filtros opcionais e combináveis: busca (nome, sem diferenciar acento e maiúsculas), categoria (slug), modalidade (Ead, Presencial, Hibrido), status (InscricoesAbertas, EmBreve, Encerrado) e destaque.")
            .Produces<ListaCursosDto>()
            .ProducesValidationProblem();

        api.MapGet("/cursos/{id:int}", ObterCurso)
            .WithSummary("Detalhes de um curso, com módulos e aulas")
            .Produces<CursoDetalheDto>()
            .ProducesProblem(StatusCodes.Status404NotFound);

        api.MapGet("/filtros", ListarFiltros)
            .WithSummary("Opções de categoria, modalidade e status, com a quantidade de cursos em cada uma")
            .Produces<FiltrosDto>();

        api.MapGet("/indicadores", ObterIndicadores)
            .WithSummary("Totais e distribuição do catálogo")
            .Produces<IndicadoresDto>();
    }

    // GET /api/cursos?busca=&categoria=&modalidade=&status=&destaque=
    private static async Task<IResult> ListarCursos(
        AppDbContext db,
        string? busca,
        string? categoria,
        string? modalidade,
        string? status,
        bool? destaque,
        CancellationToken ct)
    {
        var erros = new Dictionary<string, string[]>();

        if (busca?.Length > TamanhoMaximoBusca)
            erros["busca"] = [$"A pesquisa aceita no máximo {TamanhoMaximoBusca} caracteres."];

        Modalidade? modalidadeFiltro = null;
        if (!string.IsNullOrWhiteSpace(modalidade))
        {
            if (Rotulos.TentarLer<Modalidade>(modalidade, out var m)) modalidadeFiltro = m;
            else erros["modalidade"] = [$"Modalidade inválida. Use: {string.Join(", ", Enum.GetNames<Modalidade>())}."];
        }

        StatusCurso? statusFiltro = null;
        if (!string.IsNullOrWhiteSpace(status))
        {
            if (Rotulos.TentarLer<StatusCurso>(status, out var s)) statusFiltro = s;
            else erros["status"] = [$"Status inválido. Use: {string.Join(", ", Enum.GetNames<StatusCurso>())}."];
        }

        if (erros.Count > 0)
            return Results.ValidationProblem(erros, title: "Parâmetros de consulta inválidos.");

        // Cada filtro so entra na consulta se foi informado; todos se combinam (E logico)
        var consulta = db.Cursos.AsNoTracking().Include(c => c.Categoria).AsQueryable();

        var termo = TextoBusca.Normalizar(busca);
        if (termo.Length > 0)
            consulta = consulta.Where(c => c.NomeBusca.Contains(termo));

        if (!string.IsNullOrWhiteSpace(categoria))
        {
            var slugCategoria = categoria.Trim().ToLowerInvariant();
            consulta = consulta.Where(c => c.Categoria!.Slug == slugCategoria);
        }

        if (modalidadeFiltro is not null)
            consulta = consulta.Where(c => c.Modalidade == modalidadeFiltro);

        if (statusFiltro is not null)
            consulta = consulta.Where(c => c.Status == statusFiltro);

        if (destaque is not null)
            consulta = consulta.Where(c => c.Destaque == destaque);

        var cursos = await consulta
            .OrderBy(c => c.Status == StatusCurso.InscricoesAbertas ? 0 : c.Status == StatusCurso.EmBreve ? 1 : 2)
            .ThenBy(c => c.NomeCompleto)
            .ToListAsync(ct);

        var itens = cursos.Select(ParaResumo).ToList();
        return Results.Ok(new ListaCursosDto(itens.Count, itens));
    }

    // GET /api/cursos/5
    private static async Task<IResult> ObterCurso(int id, AppDbContext db, CancellationToken ct)
    {
        var curso = await db.Cursos
            .AsNoTracking()
            .Include(c => c.Categoria)
            .Include(c => c.Modulos).ThenInclude(m => m.Aulas)
            .AsSplitQuery()
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (curso is null)
            return Results.Problem(statusCode: StatusCodes.Status404NotFound, title: "Curso não encontrado.");

        var modulos = curso.Modulos
            .OrderBy(m => m.Ordem)
            .Select(m => new ModuloDto(
                m.Ordem,
                m.Titulo,
                m.Descricao,
                m.Aulas.Sum(a => a.DuracaoMinutos),
                m.Aulas.OrderBy(a => a.Ordem)
                    .Select(a => new AulaDto(a.Ordem, a.Titulo, a.Descricao, Rotulos.Para(a.Tipo), a.DuracaoMinutos))
                    .ToList()))
            .ToList();

        return Results.Ok(new CursoDetalheDto(
            curso.Id,
            curso.Slug,
            curso.NomeCompleto,
            curso.NomeBreve,
            curso.Resumo,
            curso.Descricao,
            ParaCategoria(curso.Categoria!),
            Rotulos.Para(curso.Modalidade),
            Rotulos.Para(curso.Status),
            curso.CargaHoraria,
            curso.PublicoAlvo,
            curso.Certificacao,
            curso.ImagemUrl,
            curso.DataDisponibilizacao,
            modulos));
    }

    // GET /api/filtros -> opcoes para montar os filtros da tela, com a quantidade de cursos em cada uma
    private static async Task<IResult> ListarFiltros(AppDbContext db, CancellationToken ct)
    {
        var categorias = await db.Categorias
            .AsNoTracking()
            .OrderBy(c => c.Nome)
            .Select(c => new FiltroCategoriaDto(c.Slug, c.Nome, c.Icone, c.Cor, c.Cursos.Count))
            .ToListAsync(ct);

        var cursos = await db.Cursos.AsNoTracking()
            .Select(c => new { c.Modalidade, c.Status })
            .ToListAsync(ct);

        var modalidades = Enum.GetValues<Modalidade>()
            .Select(m => new FiltroOpcaoDto(m.ToString(), Rotulos.Para(m).Rotulo, cursos.Count(c => c.Modalidade == m)))
            .ToList();

        var status = Enum.GetValues<StatusCurso>()
            .Select(s => new FiltroOpcaoDto(s.ToString(), Rotulos.Para(s).Rotulo, cursos.Count(c => c.Status == s)))
            .ToList();

        return Results.Ok(new FiltrosDto(categorias, modalidades, status));
    }

    // GET /api/indicadores -> numeros do catalogo para o painel da pagina de cursos
    private static async Task<IResult> ObterIndicadores(AppDbContext db, CancellationToken ct)
    {
        var cursos = await db.Cursos.AsNoTracking()
            .Select(c => new { c.CargaHoraria, c.Modalidade, c.Status, Categoria = c.Categoria!.Nome })
            .ToListAsync(ct);

        var porCategoria = cursos
            .GroupBy(c => c.Categoria)
            .OrderByDescending(g => g.Count()).ThenBy(g => g.Key)
            .Select(g => new FiltroOpcaoDto(g.Key, g.Key, g.Count()))
            .ToList();

        var porModalidade = Enum.GetValues<Modalidade>()
            .Select(m => new FiltroOpcaoDto(m.ToString(), Rotulos.Para(m).Rotulo, cursos.Count(c => c.Modalidade == m)))
            .ToList();

        var porStatus = Enum.GetValues<StatusCurso>()
            .Select(s => new FiltroOpcaoDto(s.ToString(), Rotulos.Para(s).Rotulo, cursos.Count(c => c.Status == s)))
            .ToList();

        return Results.Ok(new IndicadoresDto(
            TotalCursos: cursos.Count,
            TotalCategorias: porCategoria.Count,
            CargaHorariaTotal: cursos.Sum(c => c.CargaHoraria),
            InscricoesAbertas: cursos.Count(c => c.Status == StatusCurso.InscricoesAbertas),
            porCategoria,
            porModalidade,
            porStatus));
    }

    private static CategoriaDto ParaCategoria(Categoria c) => new(c.Id, c.Nome, c.Slug, c.Icone, c.Cor);

    private static CursoResumoDto ParaResumo(Curso c) => new(
        c.Id,
        c.Slug,
        c.NomeCompleto,
        c.NomeBreve,
        c.Resumo,
        ParaCategoria(c.Categoria!),
        Rotulos.Para(c.Modalidade),
        Rotulos.Para(c.Status),
        c.CargaHoraria,
        c.PublicoAlvo,
        c.ImagemUrl,
        c.DataDisponibilizacao,
        c.Destaque);
}
