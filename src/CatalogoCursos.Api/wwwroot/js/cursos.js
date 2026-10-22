import { api } from "./api.js";
import { avisoErro, avisoVazio, cardCurso, esc, esqueletos, plural } from "./componentes.js";

const form = document.getElementById("filtros");
const campos = {
  busca: document.getElementById("busca"),
  categoria: document.getElementById("categoria"),
  modalidade: document.getElementById("modalidade"),
  status: document.getElementById("status"),
};
const lista = document.getElementById("resultados");
const estado = document.getElementById("resultados-estado");
const contagem = document.getElementById("resultados-contagem");
const filtrosAtivos = document.getElementById("filtros-ativos");

let requisicaoAtual = null;
let temporizadorBusca = null;

// ---------- Estado na URL (permite compartilhar e voltar com os filtros aplicados) ----------
function lerFiltros() {
  return {
    busca: campos.busca.value.trim(),
    categoria: campos.categoria.value,
    modalidade: campos.modalidade.value,
    status: campos.status.value,
  };
}

function gravarNaUrl(filtros) {
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(filtros)) if (valor) params.set(chave, valor);
  const consulta = params.toString();
  history.replaceState(null, "", consulta ? `?${consulta}` : location.pathname);
}

function aplicarDaUrl() {
  const params = new URLSearchParams(location.search);
  for (const [chave, campo] of Object.entries(campos)) {
    const valor = params.get(chave) ?? "";
    // Em <select>, só aceita valores que existem nas opções
    if (campo.tagName === "SELECT" && valor && ![...campo.options].some((o) => o.value === valor)) continue;
    campo.value = valor;
  }
}

function descreverFiltros(filtros) {
  const partes = [];
  if (filtros.busca) partes.push(`“${filtros.busca}”`);
  for (const chave of ["categoria", "modalidade", "status"]) {
    if (filtros[chave]) partes.push(campos[chave].selectedOptions[0].textContent.replace(/\s\(\d+\)$/, ""));
  }
  return partes.length ? `Filtrando por: ${partes.join(" · ")}` : "";
}

// ---------- Carregamento dos resultados ----------
async function carregarCursos() {
  const filtros = lerFiltros();
  gravarNaUrl(filtros);

  requisicaoAtual?.abort();
  const controle = new AbortController();
  requisicaoAtual = controle;

  lista.setAttribute("aria-busy", "true");
  lista.innerHTML = esqueletos(4);
  estado.innerHTML = "";
  contagem.textContent = "Carregando cursos…";
  filtrosAtivos.textContent = descreverFiltros(filtros);

  try {
    const { total, itens } = await api.listarCursos(filtros, { signal: controle.signal });

    contagem.textContent = `${plural(total, "curso encontrado", "cursos encontrados")}`;

    if (total === 0) {
      lista.innerHTML = "";
      estado.innerHTML = avisoVazio({
        titulo: "Nenhum curso encontrado",
        texto: "Não encontramos cursos com esses critérios. Tente outro termo ou remova algum filtro.",
        acao: `<button class="botao botao--escuro" type="button" data-limpar>Limpar filtros</button>`,
      });
      return;
    }

    lista.innerHTML = itens.map((c) => `<li>${cardCurso(c, { detalhado: true })}</li>`).join("");
  } catch (erro) {
    if (controle.signal.aborted) return; // substituída por uma busca mais nova

    lista.innerHTML = "";
    contagem.textContent = "Erro ao carregar os cursos";
    estado.innerHTML = avisoErro({
      texto: erro.status === 400 ? "Algum filtro informado é inválido. Limpe os filtros e tente de novo." : erro.message,
      acao: `<button class="botao botao--escuro" type="button" data-tentar>Tentar novamente</button>`,
    });
  } finally {
    if (requisicaoAtual === controle) lista.setAttribute("aria-busy", "false");
  }
}

function limparFiltros() {
  // Zera campo a campo: chamar form.reset() aqui dispararia o evento "reset" de novo
  clearTimeout(temporizadorBusca);
  for (const campo of Object.values(campos)) campo.value = "";
  carregarCursos();
  campos.busca.focus();
}

// ---------- Opções dos filtros e indicadores ----------
function preencherSelect(select, opcoes) {
  select.insertAdjacentHTML(
    "beforeend",
    opcoes.map((o) => `<option value="${esc(o.valor)}">${esc(o.rotulo)} (${o.quantidade})</option>`).join("")
  );
}

async function carregarFiltros() {
  try {
    const { categorias, modalidades, status } = await api.filtros();
    preencherSelect(campos.categoria, categorias);
    preencherSelect(campos.modalidade, modalidades);
    preencherSelect(campos.status, status);
  } catch {
    // Sem as opções, a pesquisa por nome continua funcionando; os selects ficam só com "Todas"
    for (const chave of ["categoria", "modalidade", "status"]) campos[chave].disabled = true;
  }
}

async function carregarIndicadores() {
  const ul = document.getElementById("indicadores");
  try {
    const dados = await api.indicadores();
    const valores = [dados.totalCursos, dados.totalCategorias, `${dados.cargaHorariaTotal}h`, dados.inscricoesAbertas];
    ul.querySelectorAll(".indicador__numero").forEach((el, i) => (el.textContent = valores[i]));
  } catch {
    ul.hidden = true; // indicadores são complementares: se falharem, a página segue sem eles
  } finally {
    ul.setAttribute("aria-busy", "false");
  }
}

// ---------- Eventos ----------
campos.busca.addEventListener("input", () => {
  clearTimeout(temporizadorBusca);
  temporizadorBusca = setTimeout(carregarCursos, 300);
});

for (const chave of ["categoria", "modalidade", "status"]) {
  campos[chave].addEventListener("change", carregarCursos);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearTimeout(temporizadorBusca);
  carregarCursos();
});

form.addEventListener("reset", (e) => {
  e.preventDefault();
  limparFiltros();
});

estado.addEventListener("click", (e) => {
  if (e.target.closest("[data-limpar]")) limparFiltros();
  if (e.target.closest("[data-tentar]")) carregarCursos();
});

// ---------- Início ----------
carregarIndicadores();
await carregarFiltros();
aplicarDaUrl();
carregarCursos();
