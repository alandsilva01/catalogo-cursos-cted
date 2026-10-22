// Área do aluno (AVA): navegação por módulos e aulas vindos da API.
// Não há login nesta versão: o progresso fica salvo no navegador (localStorage).

import { api } from "./api.js";
import { avisoErro, avisoVazio, esc, icones } from "./componentes.js";

const raiz = document.getElementById("ava");
const CHAVE_ULTIMO = "ava:ultimo-curso";

const armazenamento = {
  ler(chave, padrao) {
    try {
      const valor = localStorage.getItem(chave);
      return valor === null ? padrao : JSON.parse(valor);
    } catch {
      return padrao;
    }
  },
  gravar(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      /* navegação privada ou armazenamento bloqueado: o progresso só não é lembrado */
    }
  },
};

const chaveAula = (m, a) => `${m.ordem}.${a.ordem}`;

function textoPorTipo(tipo) {
  switch (tipo) {
    case "Video":
      return "Assista à videoaula com atenção e anote os pontos principais. Você pode pausar e rever os trechos sempre que precisar.";
    case "Leitura":
      return "Faça a leitura do material com calma, destacando termos técnicos e exemplos. Ele será a base das próximas atividades.";
    case "Atividade":
      return "Coloque em prática o que aprendeu. As atividades não valem nota, mas ajudam a fixar o conteúdo antes da avaliação.";
    case "Avaliacao":
      return "Responda às questões da avaliação. É preciso concluí-la para avançar e para receber o certificado ao final do curso.";
    default:
      return "";
  }
}

function iniciar(curso) {
  const aulas = curso.modulos.flatMap((m) => m.aulas.map((a) => ({ modulo: m, aula: a, chave: chaveAula(m, a) })));
  const chaveProgresso = `ava:progresso:${curso.id}`;
  const concluidas = new Set(armazenamento.ler(chaveProgresso, []));
  armazenamento.gravar(CHAVE_ULTIMO, curso.id);

  if (aulas.length === 0) {
    raiz.innerHTML = `<div class="container secao">${avisoVazio({
      titulo: "Conteúdo em preparação",
      texto: "As aulas deste curso ainda não foram publicadas.",
      acao: `<a class="botao botao--escuro" href="/curso.html?id=${encodeURIComponent(curso.id)}">Voltar ao curso</a>`,
    })}</div>`;
    return;
  }

  // Aula aberta: a do endereço (#1.2), senão a primeira não concluída
  let atual = aulas.findIndex((x) => `#${x.chave}` === location.hash);
  if (atual < 0) atual = Math.max(0, aulas.findIndex((x) => !concluidas.has(x.chave)));

  document.title = `${curso.nomeBreve} — Área do aluno`;

  raiz.innerHTML = `
    <div class="ava__menu-mobile">
      <span>${esc(curso.nomeBreve)}</span>
      <button class="botao botao--contorno-claro" type="button" id="alternar-lateral" aria-expanded="false" aria-controls="lateral">Conteúdo do curso</button>
    </div>
    <div class="ava">
      <aside class="ava__lateral" id="lateral" aria-label="Conteúdo do curso" hidden>
        <div class="ava__topo">
          <a class="ava__voltar" href="/curso.html?id=${encodeURIComponent(curso.id)}" aria-label="Voltar para a página do curso">${icones.voltar}</a>
          <span class="sobretitulo">Certificação</span>
          <p class="ava__curso">${esc(curso.nomeCompleto)}</p>
          <div class="ava__progresso">
            <progress id="progresso" max="${aulas.length}" value="0" aria-label="Progresso no curso"></progress>
            <span id="progresso-texto">0%</span>
          </div>
        </div>
        <div class="ava__busca" role="search">
          <label class="visualmente-oculto" for="busca-aula">Pesquisar aulas</label>
          <input class="campo__controle" type="search" id="busca-aula" placeholder="Pesquisar aulas" autocomplete="off">
        </div>
        <nav aria-label="Módulos e aulas">
          <ol class="ava__modulos" id="modulos"></ol>
        </nav>
      </aside>
      <main class="ava__conteudo" id="conteudo" tabindex="-1">
        <article class="ava__artigo" id="artigo" aria-live="polite"></article>
      </main>
    </div>`;

  const lateral = document.getElementById("lateral");
  const listaModulos = document.getElementById("modulos");
  const artigo = document.getElementById("artigo");
  const busca = document.getElementById("busca-aula");
  const alternar = document.getElementById("alternar-lateral");
  const desktop = window.matchMedia("(min-width: 960px)");

  const sincronizarLateral = () => {
    lateral.hidden = !desktop.matches && alternar.getAttribute("aria-expanded") !== "true";
  };
  desktop.addEventListener("change", sincronizarLateral);
  alternar.addEventListener("click", () => {
    const abrir = alternar.getAttribute("aria-expanded") !== "true";
    alternar.setAttribute("aria-expanded", String(abrir));
    sincronizarLateral();
  });
  sincronizarLateral();

  function atualizarProgresso() {
    const feitas = aulas.filter((x) => concluidas.has(x.chave)).length;
    const pct = Math.round((feitas / aulas.length) * 100);
    document.getElementById("progresso").value = feitas;
    document.getElementById("progresso-texto").textContent = `${pct}%`;
  }

  function renderizarLista() {
    const termo = busca.value.trim().toLocaleLowerCase("pt-BR");
    const moduloAtual = aulas[atual].modulo.ordem;

    listaModulos.innerHTML = curso.modulos
      .map((m) => {
        const itens = m.aulas.filter((a) => !termo || a.titulo.toLocaleLowerCase("pt-BR").includes(termo));
        if (termo && itens.length === 0) return "";
        const aberto = termo || m.ordem === moduloAtual;
        return `<li class="ava__modulo">
            <button class="ava__modulo-botao" type="button" aria-expanded="${aberto}" aria-controls="aulas-${m.ordem}">
              ${m.ordem}. ${esc(m.titulo)}
            </button>
            <ol class="ava__aulas" id="aulas-${m.ordem}" ${aberto ? "" : "hidden"}>
              ${itens
                .map((a) => {
                  const chave = chaveAula(m, a);
                  const eAtual = aulas[atual].chave === chave;
                  const icone = concluidas.has(chave) ? icones.concluida : eAtual ? icones.atual : icones.pendente;
                  const situacao = concluidas.has(chave) ? "concluída" : "não concluída";
                  return `<li><button class="ava__aula" type="button" data-chave="${chave}" ${eAtual ? 'aria-current="true"' : ""}>
                      ${icone}<span>${m.ordem}.${a.ordem} ${esc(a.titulo)}<span class="visualmente-oculto"> (${situacao})</span></span>
                    </button></li>`;
                })
                .join("")}
            </ol>
          </li>`;
      })
      .join("") || `<li class="ava__busca">Nenhuma aula encontrada.</li>`;
  }

  function renderizarAula({ focar = false } = {}) {
    const { modulo, aula, chave } = aulas[atual];
    const feita = concluidas.has(chave);
    history.replaceState(null, "", `?id=${encodeURIComponent(curso.id)}#${chave}`);

    artigo.innerHTML = `
      <div class="ava__banner">
        <img src="/assets/img/banner-ava.webp" alt="" width="1600" height="890">
        <img class="ava__banner-logo" src="/assets/img/logo-sesi.svg" alt="" width="58" height="17">
      </div>
      <span class="sobretitulo ava__meta">Módulo ${modulo.ordem} · ${esc(aula.tipo.rotulo)} · ${aula.duracaoMinutos} min</span>
      <h1 class="secao__titulo">${modulo.ordem}.${aula.ordem} ${esc(aula.titulo)}</h1>
      <p>${esc(modulo.descricao)}</p>
      <p>${esc(aula.descricao)} ${esc(textoPorTipo(aula.tipo.valor))}</p>
      <h2>Boas práticas</h2>
      <p>Crie um espaço de estudo livre de distrações e reserve horários fixos para as aulas e atividades. Interaja com colegas e instrutores nos fóruns: isso enriquece o aprendizado e ajuda a esclarecer dúvidas.</p>
      <p>Revise o conteúdo regularmente e aplique o que aprendeu em situações práticas do seu dia a dia de trabalho sempre que possível.</p>
      <div class="ava__acoes">
        <button class="botao botao--contorno" type="button" data-navegar="-1" ${atual === 0 ? "disabled" : ""}>Aula anterior</button>
        <button class="botao ${feita ? "botao--contorno" : "botao--escuro"}" type="button" id="concluir" aria-pressed="${feita}">
          ${feita ? "Aula concluída ✓" : "Marcar como concluída"}
        </button>
        <button class="botao botao--escuro" type="button" data-navegar="1" ${atual === aulas.length - 1 ? "disabled" : ""}>Próxima aula ${icones.seta}</button>
      </div>`;

    renderizarLista();
    atualizarProgresso();
    if (focar) document.getElementById("conteudo").focus();
  }

  function irPara(indice) {
    atual = Math.min(Math.max(indice, 0), aulas.length - 1);
    if (!desktop.matches) {
      alternar.setAttribute("aria-expanded", "false");
      sincronizarLateral();
    }
    renderizarAula({ focar: true });
    window.scrollTo({ top: 0 });
  }

  listaModulos.addEventListener("click", (e) => {
    const aula = e.target.closest("[data-chave]");
    if (aula) {
      irPara(aulas.findIndex((x) => x.chave === aula.dataset.chave));
      return;
    }
    const modulo = e.target.closest(".ava__modulo-botao");
    if (modulo) {
      const aberto = modulo.getAttribute("aria-expanded") === "true";
      modulo.setAttribute("aria-expanded", String(!aberto));
      document.getElementById(modulo.getAttribute("aria-controls")).hidden = aberto;
    }
  });

  artigo.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-navegar]");
    if (nav) irPara(atual + Number(nav.dataset.navegar));

    if (e.target.closest("#concluir")) {
      const { chave } = aulas[atual];
      if (concluidas.has(chave)) concluidas.delete(chave);
      else concluidas.add(chave);
      armazenamento.gravar(chaveProgresso, [...concluidas]);
      renderizarAula();
      document.getElementById("concluir").focus();
    }
  });

  busca.addEventListener("input", renderizarLista);

  renderizarAula();
}

async function carregar() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id") ?? armazenamento.ler(CHAVE_ULTIMO, null);

  if (!id || !/^\d+$/.test(String(id))) {
    raiz.innerHTML = `<div class="container secao">${avisoVazio({
      titulo: "Você ainda não iniciou nenhum curso",
      texto: "Escolha um curso com inscrições abertas no catálogo e clique em Matricule-se para acessar as aulas.",
      acao: `<a class="botao botao--escuro" href="/cursos.html?status=InscricoesAbertas">Ver cursos com inscrições abertas</a>`,
    })}</div>`;
    raiz.setAttribute("aria-busy", "false");
    return;
  }

  try {
    iniciar(await api.obterCurso(id));
  } catch (erro) {
    const naoExiste = erro.status === 404;
    if (naoExiste) armazenamento.gravar(CHAVE_ULTIMO, null);
    raiz.innerHTML = `<div class="container secao">${
      naoExiste
        ? avisoVazio({
            titulo: "Curso não encontrado",
            texto: "Este curso não existe ou foi removido do catálogo.",
            acao: `<a class="botao botao--escuro" href="/cursos.html">Ver catálogo</a>`,
          })
        : avisoErro({
            texto: erro.message,
            acao: `<button class="botao botao--escuro" type="button" id="tentar">Tentar novamente</button>`,
          })
    }</div>`;
    document.getElementById("tentar")?.addEventListener("click", carregar);
  } finally {
    raiz.setAttribute("aria-busy", "false");
  }
}

carregar();
