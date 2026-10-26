using System.Net;
using System.Net.Http.Json;
using CatalogoCursos.Api.Dtos;

namespace CatalogoCursos.Api.Tests;

// Testes de ponta a ponta: requisicao HTTP -> endpoint -> EF Core -> SQLite com os dados ficticios.
public class CursosEndpointsTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Lista_todos_os_cursos_do_catalogo()
    {
        var lista = await _client.GetFromJsonAsync<ListaCursosDto>("/api/cursos");

        Assert.NotNull(lista);
        Assert.Equal(8, lista.Total);
        Assert.Equal(lista.Total, lista.Itens.Count);
    }

    [Theory]
    [InlineData("matematica")]
    [InlineData("MATEMÁTICA")]
    [InlineData("  Matemática  ")]
    public async Task Pesquisa_ignora_acento_maiusculas_e_espacos(string termo)
    {
        var lista = await _client.GetFromJsonAsync<ListaCursosDto>($"/api/cursos?busca={Uri.EscapeDataString(termo)}");

        Assert.NotNull(lista);
        Assert.NotEmpty(lista.Itens);
        Assert.All(lista.Itens, c => Assert.Contains("Matemática", c.NomeCompleto));
    }

    [Fact]
    public async Task Combina_pesquisa_e_filtros()
    {
        var lista = await _client.GetFromJsonAsync<ListaCursosDto>("/api/cursos?categoria=matematica&status=InscricoesAbertas");

        Assert.NotNull(lista);
        Assert.NotEmpty(lista.Itens);
        Assert.All(lista.Itens, c =>
        {
            Assert.Equal("matematica", c.Categoria.Slug);
            Assert.Equal("InscricoesAbertas", c.Status.Valor);
        });
    }

    [Fact]
    public async Task Retorna_lista_vazia_quando_nada_e_encontrado()
    {
        var lista = await _client.GetFromJsonAsync<ListaCursosDto>("/api/cursos?busca=termo-que-nao-existe");

        Assert.NotNull(lista);
        Assert.Equal(0, lista.Total);
        Assert.Empty(lista.Itens);
    }

    [Theory]
    [InlineData("/api/cursos?status=xyz")]
    [InlineData("/api/cursos?modalidade=0")]
    public async Task Recusa_parametro_invalido_com_400(string url)
    {
        var resposta = await _client.GetAsync(url);

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
        Assert.Equal("application/problem+json", resposta.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Recusa_pesquisa_acima_do_limite()
    {
        var resposta = await _client.GetAsync($"/api/cursos?busca={new string('a', 101)}");

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
    }

    [Fact]
    public async Task Detalhe_traz_modulos_com_carga_horaria_igual_a_do_curso()
    {
        var curso = await _client.GetFromJsonAsync<CursoDetalheDto>("/api/cursos/1");

        Assert.NotNull(curso);
        Assert.NotEmpty(curso.Modulos);
        Assert.Equal(curso.CargaHoraria * 60, curso.Modulos.Sum(m => m.CargaHorariaMinutos));
    }

    [Fact]
    public async Task Curso_inexistente_retorna_404()
    {
        var resposta = await _client.GetAsync("/api/cursos/999");

        Assert.Equal(HttpStatusCode.NotFound, resposta.StatusCode);
    }

    [Fact]
    public async Task Envia_cabecalhos_de_seguranca()
    {
        var resposta = await _client.GetAsync("/api/cursos");

        Assert.Equal("nosniff", resposta.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.Equal("DENY", resposta.Headers.GetValues("X-Frame-Options").Single());
    }

    [Fact]
    public async Task Api_nao_aceita_escrita()
    {
        var resposta = await _client.PostAsJsonAsync("/api/cursos", new { nomeCompleto = "Teste" });

        Assert.Equal(HttpStatusCode.MethodNotAllowed, resposta.StatusCode);
    }
}
