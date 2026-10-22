import { api } from "./api.js";
import {
  ativarCarrossel,
  avisoErro,
  avisoVazio,
  esc,
  etiquetaCategoria,
  formatarData,
  formatarMinutos,
  icones,
  plural,
  seloStatus,
} from "./componentes.js";

const main = document.getElementById("conteudo");
const barra = document.getElementById("barra-matricula");

// Depoimentos e dúvidas frequentes são conteúdo institucional fixo (não fazem parte do modelo de dados do PDF)
const depoimentos = [
  { texto: "A experiência do curso foi incrível! As aulas foram muito bem estruturadas e o cronograma foi cuidadosamente planejado, facilitando muito o aprendizado.", nome: "Lucas Pereira", cargo: "Analista na Empresa X" },
  { texto: "Concluir o curso foi uma jornada enriquecedora. As aulas eram dinâmicas e o horário foi organizado para maximizar nosso tempo de estudo.", nome: "Mariana Costa", cargo: "Gestora na Empresa X" },
  { texto: "O curso superou minhas expectativas! As aulas eram bem elaboradas e o planejamento do horário ajudou a manter o foco e a produtividade.", nome: "Thiago Almeida", cargo: "Técnico na Empresa X" },
  { texto: "Finalizar o curso foi uma experiência motivadora. As aulas foram muito bem preparadas e o cronograma foi ideal para o aprendizado.", nome: "Fernanda Silva", cargo: "Analista na Empresa X" },
  { texto: "A conclusão do curso foi uma etapa gratificante. As aulas eram bem organizadas e o horário foi pensado para facilitar o aprendizado.", nome: "Gabriel Santos", cargo: "Analista na Empresa X" },
];

const diferenciais = [
  { icone: "01-certificacao-bege.svg", titulo: "Certificação SESI", texto: "Cursos com a melhor certificação do mercado industrial reconhecidos pelo SESI." },
  { icone: "02-professores-bege.svg", titulo: "Professores especialistas", texto: "Contamos com professores reconhecidos por sua excelência no mercado." },
  { icone: "03-suporte-bege.svg", titulo: "Suporte contínuo", texto: "Você não está sozinho! Acompanhamento online durante todo o curso." },
  { icone: "04-flexibilidade-bege.svg", titulo: "Flexibilidade", texto: "Turmas presenciais e online com horários que se adaptam à sua rotina." },
];

function botaoMatricula(curso, classe = "botao--escuro") {
  if (curso.status.valor === "InscricoesAbertas") {
    return `<a class="botao ${classe}" href="/ava.html?id=${encodeURIComponent(curso.id)}">Matricule-se ${icones.seta}</a>`;
  }
  const texto = curso.status.valor === "EmBreve" ? "Inscrições em breve" : "Inscrições encerradas";
  return `<button class="botao ${classe}" type="button" disabled>${texto}</button>`;
}

function itemAcordeao(id, titulo, conteudo) {
  return `<div class="acordeao__item">
      <h3 class="acordeao__titulo">
        <button class="acordeao__botao" type="button" aria-expanded="false" aria-controls="painel-${id}" id="botao-${id}">
          ${esc(titulo)}
          <img src="/assets/icons/add_2.svg" alt="" width="24" height="24">
        </button>
      </h3>
      <div class="acordeao__painel" id="painel-${id}" role="region" aria-labelledby="botao-${id}" hidden>
        ${conteudo}
      </div>
    </div>`;
}

function conteudoModulos(curso) {
  if (!curso.modulos.length) return `<p>Os módulos deste curso serão publicados em breve.</p>`;
  return `<ol class="lista-modulos">
      ${curso.modulos
        .map(
          (m) => `<li>
            <div class="modulo__cabecalho">
              <h4 class="modulo__titulo">${m.ordem}. ${esc(m.titulo)}</h4>
              <span class="modulo__duracao">${plural(m.aulas.length, "aula", "aulas")} · ${esc(formatarMinutos(m.cargaHorariaMinutos))}</span>
            </div>
            <ul class="modulo__aulas">
              ${m.aulas.map((a) => `<li>${esc(a.titulo)} <span>(${esc(a.tipo.rotulo)})</span></li>`).join("")}
            </ul>
          </li>`
        )
        .join("")}
    </ol>`;
}

function conteudoAulas(curso) {
  const aulas = curso.modulos.flatMap((m) => m.aulas);
  const contar = (tipo) => aulas.filter((a) => a.tipo.valor === tipo).length;
  const ambiente = curso.modalidade.valor === "Presencial"
    ? "As aulas acontecem presencialmente, com materiais de apoio disponíveis na Área do aluno."
    : "As aulas ficam disponíveis na Área do aluno, onde você acompanha seu progresso e realiza as avaliações.";

  return `<p>${esc(ambiente)} Ao final de cada módulo há uma avaliação para consolidar o aprendizado.</p>
    <ul class="resumo-aulas">
      <li><strong>${contar("Video")}</strong> videoaulas</li>
      <li><strong>${contar("Leitura")}</strong> leituras</li>
      <li><strong>${contar("Atividade")}</strong> atividades</li>
      <li><strong>${contar("Avaliacao")}</strong> avaliações</li>
    </ul>`;
}

function conteudoDuvidas(curso) {
  return `<dl class="faq">
      <dt>Recebo certificado?</dt>
      <dd>Sim. Ao concluir todas as atividades e avaliações, você recebe a certificação ${esc(curso.certificacao)}.</dd>
      <dt>Preciso de conhecimento prévio?</dt>
      <dd>Não. O curso parte dos fundamentos e é indicado para: ${esc(curso.publicoAlvo.charAt(0).toLowerCase() + curso.publicoAlvo.slice(1))}</dd>
      <dt>Como funciona a modalidade ${esc(curso.modalidade.rotulo)}?</dt>
      <dd>${
        curso.modalidade.valor === "Ead"
          ? "Todo o conteúdo é online e você estuda no seu ritmo, dentro do prazo da turma."
          : curso.modalidade.valor === "Hibrido"
            ? "Parte das aulas é online e parte acontece presencialmente, em encontros práticos."
            : "As aulas acontecem presencialmente, em laboratórios e salas da unidade."
      }</dd>
    </dl>`;
}

function renderizar(curso) {
  document.title = `${curso.nomeCompleto} — SESI+Indústria`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", curso.resumo);

  const inicio = curso.dataDisponibilizacao ? formatarData(curso.dataDisponibilizacao) : "Imediato";

  main.innerHTML = `
    <section class="detalhe-hero" id="detalhe-hero" aria-labelledby="curso-titulo">
      <div class="container">
        <nav class="trilha" aria-label="Você está em">
          <ol>
            <li><a href="/">Início</a></li>
            <li><a href="/cursos.html">Cursos</a></li>
            <li aria-current="page">${esc(curso.nomeBreve)}</li>
          </ol>
        </nav>
        <div class="detalhe-hero__grade">
          <div>
            <div class="detalhe-hero__selos">
              ${etiquetaCategoria(curso.categoria)}
              ${seloStatus(curso.status)}
            </div>
            <h1 class="detalhe-hero__titulo" id="curso-titulo">${esc(curso.nomeCompleto)}</h1>
            <ul class="detalhe-hero__info">
              <li>${icones.calendario}<span>Início do curso: <strong>${esc(inicio)}</strong></span></li>
              <li><img src="/assets/icons/01-certificacao-bege.svg" alt=""><span>Certificação: <strong>${esc(curso.certificacao)}</strong></span></li>
              <li>${icones.monitor}<span>Modalidade: <strong>${esc(curso.modalidade.rotulo)}</strong></span></li>
              <li>${icones.relogio}<span>Carga horária: <strong>${esc(curso.cargaHoraria)} horas</strong></span></li>
            </ul>
            ${botaoMatricula(curso)}
          </div>
          <div class="detalhe-hero__midia">
            <img src="${esc(curso.imagemUrl)}" alt="" width="640" height="720">
          </div>
        </div>
      </div>
    </section>

    <section class="container" aria-label="Diferenciais">
      <ul class="diferenciais diferenciais--bege diferenciais--4 diferenciais--sem-margem">
        ${diferenciais
          .map(
            (d) => `<li>
              <span class="diferencial__icone"><img src="/assets/icons/${d.icone}" alt="" width="28" height="28"></span>
              <h2 class="diferencial__titulo">${d.titulo}</h2>
              <p class="diferencial__texto">${d.texto}</p>
            </li>`
          )
          .join("")}
      </ul>
    </section>

    <section class="secao" aria-labelledby="sobre-titulo">
      <div class="container sobre">
        <div>
          <h2 class="secao__titulo" id="sobre-titulo">Sobre o curso</h2>
          <p class="sobre__texto">${esc(curso.descricao)}</p>
          <div class="sobre__publico">
            <h3>Público-alvo</h3>
            <p>${esc(curso.publicoAlvo)}</p>
          </div>
        </div>
        <div class="acordeao">
          ${itemAcordeao("modulos", "Módulos", conteudoModulos(curso))}
          ${itemAcordeao("aulas", "Aulas online e avaliações", conteudoAulas(curso))}
          ${itemAcordeao("duvidas", "Dúvidas frequentes", conteudoDuvidas(curso))}
        </div>
      </div>
    </section>

    <section class="secao depoimentos" aria-labelledby="depoimentos-titulo">
      <div class="container carrossel" id="carrossel-depoimentos">
        <span class="sobretitulo">Depoimentos</span>
        <h2 class="secao__titulo" id="depoimentos-titulo">Quem fez recomenda</h2>
        <ul class="carrossel__trilho carrossel__trilho--espaco" tabindex="0" aria-label="Depoimentos — role para ver mais">
          ${depoimentos
            .map(
              (d) => `<li>
                <figure class="depoimento">
                  <blockquote>“${d.texto}”</blockquote>
                  <figcaption class="depoimento__autor">
                    <strong>${d.nome}</strong><span>${d.cargo}</span>
                    <span class="estrelas" role="img" aria-label="Avaliação: 5 de 5 estrelas">
                      ${'<img src="/assets/icons/star.svg" alt="" width="18" height="18">'.repeat(5)}
                    </span>
                  </figcaption>
                </figure>
              </li>`
            )
            .join("")}
        </ul>
        <div class="carrossel__rodape carrossel__rodape--direita">
          <div class="carrossel__setas">
            <button class="botao botao--icone" type="button" data-anterior aria-label="Depoimentos anteriores">
              <img src="/assets/icons/arrow-navigation.svg" alt="" width="28" height="28">
            </button>
            <button class="botao botao--icone" type="button" data-proximo aria-label="Próximos depoimentos">
              <img src="/assets/icons/arrow-navigation-1.svg" alt="" width="28" height="28">
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="fale-conosco" aria-labelledby="fale-titulo">
      <div class="container">
        <span class="sobretitulo">Precisa de ajuda para decidir?</span>
        <h2 class="secao__titulo" id="fale-titulo">Fale com a gente</h2>
        <a class="botao botao--claro" href="mailto:contato@sesindustria.com.br?subject=${encodeURIComponent(`Dúvida sobre o curso ${curso.nomeBreve}`)}">
          Mandar uma mensagem ${icones.seta}
        </a>
      </div>
    </section>`;

  main.querySelectorAll(".acordeao__botao").forEach((botao) => {
    botao.addEventListener("click", () => {
      const aberto = botao.getAttribute("aria-expanded") === "true";
      botao.setAttribute("aria-expanded", String(!aberto));
      botao.querySelector("img").src = `/assets/icons/${aberto ? "add_2" : "remove"}.svg`;
      document.getElementById(botao.getAttribute("aria-controls")).hidden = aberto;
    });
  });

  ativarCarrossel(document.getElementById("carrossel-depoimentos"));
  montarBarraFixa(curso);
}

// Barra "Matricule-se" fixa no rodapé: aparece quando o topo da página sai da tela
function montarBarraFixa(curso) {
  barra.innerHTML = `<div class="container">
      <div class="barra-matricula__conteudo">
        <p class="barra-matricula__nome">${esc(curso.nomeCompleto)}</p>
        ${botaoMatricula(curso, "botao--claro")}
      </div>
    </div>`;
  barra.hidden = false;
  document.body.classList.add("com-barra-fixa");

  const hero = document.getElementById("detalhe-hero");
  const observador = new IntersectionObserver(([entrada]) => {
    const visivel = !entrada.isIntersecting;
    barra.classList.toggle("visivel", visivel);
    barra.inert = !visivel; // fora da tela: não recebe foco do teclado
  });
  barra.inert = true;
  observador.observe(hero);
}

function renderizarFalha(conteudo) {
  main.innerHTML = `<div class="container secao">${conteudo}</div>`;
}

async function carregar() {
  const id = new URLSearchParams(location.search).get("id");

  if (!id || !/^\d+$/.test(id)) {
    renderizarFalha(
      avisoVazio({
        titulo: "Curso não informado",
        texto: "Escolha um curso no catálogo para ver os detalhes.",
        acao: `<a class="botao botao--escuro" href="/cursos.html">Ver catálogo</a>`,
      })
    );
    return;
  }

  try {
    renderizar(await api.obterCurso(id));
  } catch (erro) {
    if (erro.status === 404) {
      document.title = "Curso não encontrado — SESI+Indústria";
      renderizarFalha(
        avisoVazio({
          titulo: "Curso não encontrado",
          texto: "O curso que você procura não existe ou foi removido do catálogo.",
          acao: `<a class="botao botao--escuro" href="/cursos.html">Ver catálogo</a>`,
        })
      );
    } else {
      renderizarFalha(
        avisoErro({
          texto: erro.message,
          acao: `<button class="botao botao--escuro" type="button" id="tentar">Tentar novamente</button>`,
        })
      );
      document.getElementById("tentar").addEventListener("click", carregar);
    }
  } finally {
    main.setAttribute("aria-busy", "false");
  }
}

carregar();
