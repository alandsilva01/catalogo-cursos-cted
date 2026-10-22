using CatalogoCursos.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CatalogoCursos.Api.Data;

// Dados ficticios do catalogo. Roda apenas quando o banco esta vazio.
public static class SeedData
{
    public static async Task PopularAsync(AppDbContext db, CancellationToken ct = default)
    {
        if (await db.Cursos.AnyAsync(ct))
            return;

        var matematica = new Categoria { Nome = "Matemática", Slug = "matematica", Icone = "icon-matematica-20px.svg", Cor = "#FCD19C" };
        var ciencias = new Categoria { Nome = "Ciências da Natureza", Slug = "ciencias-da-natureza", Icone = "icon-ciencias-natureza-20px.svg", Cor = "#E5D4FF" };
        var linguagens = new Categoria { Nome = "Linguagens", Slug = "linguagens", Icone = "icon-linguagens-20px.svg", Cor = "#CDE8FF" };
        var sustentabilidade = new Categoria { Nome = "Sustentabilidade", Slug = "sustentabilidade", Icone = "icon-sustentabilidade-20px.svg", Cor = "#CFF2D6" };

        db.Categorias.AddRange(matematica, ciencias, linguagens, sustentabilidade);

        var cursos = new List<Curso>
        {
            NovoCurso(
                nome: "Matemática para a Precisão: Medidas e Escalas na Metalurgia",
                breve: "Matemática para a Precisão",
                categoria: matematica, modalidade: Modalidade.Ead, status: StatusCurso.InscricoesAbertas,
                carga: 40, inicio: new DateOnly(2026, 11, 9), destaque: true,
                resumo: "Aplicação de grandezas, proporções e escalas em processos de corte, furação e usinagem.",
                descricao: "Explore nosso curso de Matemática para a Precisão: Medidas e Escalas na Metalurgia, perfeito para quem deseja se destacar nesse campo! Este programa abrangente foi desenvolvido para capacitar profissionais com as habilidades e conhecimentos fundamentais para garantir medições precisas e eficientes no ambiente metalúrgico.",
                publico: "Operadores de máquinas, técnicos em metalurgia e estudantes de cursos técnicos industriais.",
                modulos:
                [
                    ("Grandezas e unidades de medida", ["Sistema Internacional de Unidades", "Conversão de unidades no chão de fábrica", "Exercícios de fixação"]),
                    ("Instrumentos de medição", ["Paquímetro: leitura e cuidados", "Micrômetro e relógio comparador", "Atividade prática guiada"]),
                    ("Proporções e escalas", ["Razão e proporção aplicadas", "Leitura de escalas em desenho técnico", "Avaliação do módulo"]),
                    ("Tolerâncias e ajustes", ["Tolerância dimensional", "Ajustes e acabamento", "Avaliação final"])
                ]),

            NovoCurso(
                nome: "Geometria e Modelagem no Design Têxtil",
                breve: "Geometria no Design Têxtil",
                categoria: matematica, modalidade: Modalidade.Hibrido, status: StatusCurso.InscricoesAbertas,
                carga: 60, inicio: new DateOnly(2026, 11, 23), destaque: true,
                resumo: "Explora formas geométricas, simetria e padrões matemáticos presentes em tecidos e estampas.",
                descricao: "Entenda como a geometria está presente na criação de tecidos e estampas. O curso combina conceitos de simetria, proporção e padrões repetitivos com exemplos reais da indústria têxtil, preparando o aluno para modelar e otimizar o aproveitamento de materiais.",
                publico: "Profissionais e estudantes de design, moda e produção têxtil.",
                modulos:
                [
                    ("Formas e simetria", ["Figuras planas e simetria", "Padrões de repetição", "Exercícios de fixação"]),
                    ("Modelagem e encaixe", ["Moldes e áreas", "Aproveitamento de tecido", "Atividade prática"]),
                    ("Estampas e padrões", ["Malhas geométricas", "Criação de padrão próprio", "Avaliação final"])
                ]),

            NovoCurso(
                nome: "Estatística e Controle de Qualidade na Produção",
                breve: "Estatística na Produção",
                categoria: matematica, modalidade: Modalidade.Ead, status: StatusCurso.EmBreve,
                carga: 30, inicio: new DateOnly(2027, 2, 1), destaque: true,
                resumo: "Leitura e interpretação de dados de controle de qualidade e produtividade.",
                descricao: "Aprenda a coletar, organizar e interpretar dados da linha de produção. O curso apresenta os principais indicadores de qualidade, gráficos de controle e técnicas estatísticas básicas para apoiar a tomada de decisão no ambiente industrial.",
                publico: "Supervisores de produção, analistas de qualidade e técnicos industriais.",
                modulos:
                [
                    ("Fundamentos de estatística", ["Média, mediana e moda", "Dispersão e desvio padrão", "Exercícios de fixação"]),
                    ("Ferramentas da qualidade", ["Gráfico de Pareto", "Diagrama de Ishikawa", "Atividade prática"]),
                    ("Controle estatístico de processo", ["Cartas de controle", "Capacidade do processo", "Avaliação final"])
                ]),

            NovoCurso(
                nome: "Física do Movimento e da Energia na Metalurgia",
                breve: "Física na Metalurgia",
                categoria: ciencias, modalidade: Modalidade.Presencial, status: StatusCurso.InscricoesAbertas,
                carga: 80, inicio: new DateOnly(2026, 12, 7), destaque: true,
                resumo: "Estudo de forças, atrito, calor e energia em máquinas, fornos e prensas.",
                descricao: "Conheça os princípios físicos que explicam o funcionamento de máquinas, fornos e prensas. Com aulas práticas em laboratório, o curso aborda forças, atrito, transferência de calor e eficiência energética aplicados à metalurgia.",
                publico: "Técnicos de manutenção, operadores de máquinas e estudantes do ensino médio técnico.",
                modulos:
                [
                    ("Forças e movimento", ["Leis de Newton na prática", "Atrito e desgaste", "Exercícios de fixação"]),
                    ("Calor e temperatura", ["Dilatação térmica", "Tratamentos térmicos", "Atividade em laboratório"]),
                    ("Energia e potência", ["Trabalho e potência de máquinas", "Eficiência energética", "Avaliação do módulo"]),
                    ("Segurança e aplicações", ["Riscos físicos no ambiente industrial", "Estudo de caso", "Avaliação final"])
                ]),

            NovoCurso(
                nome: "Química dos Materiais e Acabamentos Sustentáveis",
                breve: "Química dos Materiais",
                categoria: ciencias, modalidade: Modalidade.Ead, status: StatusCurso.Encerrado,
                carga: 45, inicio: new DateOnly(2026, 3, 2), destaque: true,
                resumo: "Estudo das reações químicas envolvidas em tratamentos de superfície e acabamentos.",
                descricao: "Entenda as reações químicas presentes em processos de galvanização, pintura e tratamento de superfícies, com foco na redução de resíduos e no uso de alternativas menos poluentes.",
                publico: "Profissionais de acabamento industrial, laboratório e meio ambiente.",
                modulos:
                [
                    ("Estrutura dos materiais", ["Ligações químicas", "Metais e ligas", "Exercícios de fixação"]),
                    ("Corrosão e proteção", ["Processos de corrosão", "Galvanização e pintura", "Atividade prática"]),
                    ("Acabamentos sustentáveis", ["Tintas à base de água", "Tratamento de efluentes", "Avaliação final"])
                ]),

            NovoCurso(
                nome: "Comunicação Assertiva no Ambiente Industrial",
                breve: "Comunicação Assertiva",
                categoria: linguagens, modalidade: Modalidade.Ead, status: StatusCurso.InscricoesAbertas,
                carga: 20, inicio: null, destaque: false,
                resumo: "Técnicas de comunicação clara e respeitosa para equipes de produção e liderança.",
                descricao: "Desenvolva uma comunicação objetiva e empática no dia a dia da fábrica. O curso trabalha escuta ativa, feedback, comunicação em situações de conflito e passagem de turno, com exemplos reais do ambiente industrial. Disponível para início imediato.",
                publico: "Líderes de equipe, supervisores e colaboradores de qualquer área.",
                modulos:
                [
                    ("Fundamentos da comunicação", ["Comunicação verbal e não verbal", "Escuta ativa", "Exercícios de fixação"]),
                    ("Feedback e conflitos", ["Como dar e receber feedback", "Mediação de conflitos", "Avaliação final"])
                ]),

            NovoCurso(
                nome: "Leitura e Interpretação de Normas Técnicas",
                breve: "Normas Técnicas",
                categoria: linguagens, modalidade: Modalidade.Hibrido, status: StatusCurso.EmBreve,
                carga: 24, inicio: new DateOnly(2027, 3, 8), destaque: false,
                resumo: "Como ler, interpretar e aplicar normas técnicas e procedimentos operacionais.",
                descricao: "Aprenda a interpretar normas técnicas, manuais e procedimentos operacionais padrão. O curso apresenta a estrutura das normas, vocabulário técnico e estratégias de leitura para aplicar corretamente as orientações no trabalho.",
                publico: "Técnicos, inspetores de qualidade e profissionais que lidam com documentação técnica.",
                modulos:
                [
                    ("Estrutura das normas", ["O que é uma norma técnica", "Organização e vocabulário", "Exercícios de fixação"]),
                    ("Leitura aplicada", ["Procedimentos operacionais padrão", "Estudo de caso", "Avaliação final"])
                ]),

            NovoCurso(
                nome: "Gestão de Resíduos e Economia Circular na Indústria",
                breve: "Economia Circular",
                categoria: sustentabilidade, modalidade: Modalidade.Presencial, status: StatusCurso.Encerrado,
                carga: 36, inicio: new DateOnly(2026, 5, 4), destaque: false,
                resumo: "Práticas de redução, reaproveitamento e destinação correta de resíduos industriais.",
                descricao: "Conheça os princípios da economia circular e as práticas de gestão de resíduos aplicadas à indústria, da classificação à destinação final, com foco em redução de custos e impacto ambiental.",
                publico: "Gestores ambientais, técnicos de produção e profissionais de sustentabilidade.",
                modulos:
                [
                    ("Resíduos industriais", ["Classificação de resíduos", "Legislação aplicada", "Exercícios de fixação"]),
                    ("Economia circular", ["Reduzir, reutilizar e reciclar", "Simbiose industrial", "Atividade prática"]),
                    ("Plano de gestão", ["Indicadores ambientais", "Elaboração do plano", "Avaliação final"])
                ])
        };

        db.Cursos.AddRange(cursos);
        await db.SaveChangesAsync(ct);
    }

    private static Curso NovoCurso(
        string nome, string breve, Categoria categoria, Modalidade modalidade, StatusCurso status,
        int carga, DateOnly? inicio, bool destaque, string resumo, string descricao, string publico,
        (string Titulo, string[] Aulas)[] modulos)
    {
        var slug = TextoBusca.Normalizar(breve).Replace(' ', '-').Replace(":", "");

        var curso = new Curso
        {
            NomeCompleto = nome,
            NomeBreve = breve,
            Slug = slug,
            Resumo = resumo,
            Descricao = descricao,
            Categoria = categoria,
            Modalidade = modalidade,
            Status = status,
            CargaHoraria = carga,
            PublicoAlvo = publico,
            ImagemUrl = $"/assets/img/cursos/{slug}.webp",
            DataDisponibilizacao = inicio,
            Destaque = destaque,
            NomeBusca = TextoBusca.Normalizar($"{nome} {breve}")
        };

        // Distribui a carga horaria entre as aulas para que a soma bata com o total do curso
        var totalAulas = modulos.Sum(m => m.Aulas.Length);
        var minutosPorAula = carga * 60 / totalAulas;

        for (var i = 0; i < modulos.Length; i++)
        {
            var (titulo, aulas) = modulos[i];
            var modulo = new Modulo
            {
                Ordem = i + 1,
                Titulo = titulo,
                Descricao = $"Neste módulo você estuda {titulo.ToLowerInvariant()} com exemplos do ambiente industrial."
            };

            for (var j = 0; j < aulas.Length; j++)
            {
                modulo.Aulas.Add(new Aula
                {
                    Ordem = j + 1,
                    Titulo = aulas[j],
                    Descricao = $"Aula sobre {aulas[j].ToLowerInvariant()}.",
                    Tipo = DefinirTipo(aulas[j]),
                    DuracaoMinutos = minutosPorAula
                });
            }

            curso.Modulos.Add(modulo);
        }

        return curso;
    }

    private static TipoAula DefinirTipo(string titulo) => titulo switch
    {
        _ when titulo.StartsWith("Avaliação") => TipoAula.Avaliacao,
        _ when titulo.StartsWith("Exercícios") || titulo.StartsWith("Atividade") || titulo.StartsWith("Estudo de caso") => TipoAula.Atividade,
        _ when titulo.StartsWith("Leitura") || titulo.StartsWith("O que é") => TipoAula.Leitura,
        _ => TipoAula.Video
    };
}
