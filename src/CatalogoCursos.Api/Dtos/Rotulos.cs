using CatalogoCursos.Api.Models;

namespace CatalogoCursos.Api.Dtos;

// Converte valores de enum em texto para a interface e de volta (query string -> enum)
public static class Rotulos
{
    public static OpcaoDto Para(Modalidade m) => new(m.ToString(), m switch
    {
        Modalidade.Ead => "EAD",
        Modalidade.Presencial => "Presencial",
        Modalidade.Hibrido => "Híbrido",
        _ => m.ToString()
    });

    public static OpcaoDto Para(StatusCurso s) => new(s.ToString(), s switch
    {
        StatusCurso.InscricoesAbertas => "Inscrições abertas",
        StatusCurso.EmBreve => "Em breve",
        StatusCurso.Encerrado => "Encerrado",
        _ => s.ToString()
    });

    public static OpcaoDto Para(TipoAula t) => new(t.ToString(), t switch
    {
        TipoAula.Video => "Videoaula",
        TipoAula.Leitura => "Leitura",
        TipoAula.Atividade => "Atividade",
        TipoAula.Avaliacao => "Avaliação",
        _ => t.ToString()
    });

    // Aceita "Ead", "ead" etc. Recusa numeros ("0") para nao depender da ordem do enum.
    public static bool TentarLer<TEnum>(string? valor, out TEnum resultado) where TEnum : struct, Enum
    {
        resultado = default;
        return !string.IsNullOrWhiteSpace(valor)
            && !char.IsDigit(valor.Trim()[0])
            && Enum.TryParse(valor.Trim(), ignoreCase: true, out resultado)
            && Enum.IsDefined(resultado);
    }
}
