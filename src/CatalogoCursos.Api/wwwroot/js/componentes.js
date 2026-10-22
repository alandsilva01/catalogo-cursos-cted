// Componentes e utilitários de interface reaproveitados pelas páginas.

// Escapa texto antes de inserir em HTML: nenhum dado da API entra na página sem passar aqui
export function esc(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// "2026-11-09" -> "09/11/2026" (sem usar Date, para não sofrer com fuso horário)
export function formatarData(dataIso) {
  if (!dataIso) return "";
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function formatarHoras(horas) {
  return `${horas}h`;
}

export function formatarMinutos(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h && m) return `${h}h${String(m).padStart(2, "0")}`;
  return h ? `${h}h` : `${m} min`;
}

export function plural(qtd, singular, pluralTexto) {
  return `${qtd} ${qtd === 1 ? singular : pluralTexto}`;
}

export const icones = {
  seta: `<svg class="botao__seta" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  voltar: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>`,
  busca: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
  calendario: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>`,
  relogio: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`,
  monitor: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>`,
  info: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/></svg>`,
  lupaVazia: `<svg class="aviso__icone" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="21" cy="21" r="13"/><path d="m31 31 10 10M16 21h10"/></svg>`,
  alerta: `<svg class="aviso__icone" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6 3 42h42L24 6Z"/><path d="M24 19v11M24 36h.01"/></svg>`,
  play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5-12-7.5Z" fill="currentColor"/></svg>`,
  concluida: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="m7.5 12 3 3 6-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  atual: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9.5"/><path d="M10 8.5v7l5.5-3.5-5.5-3.5Z" fill="currentColor"/></svg>`,
  pendente: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9.5"/></svg>`,
};

export function etiquetaCategoria(categoria) {
  // A API devolve a cor da categoria; aplicada só como fundo da etiqueta (texto sempre escuro)
  return `<span class="etiqueta" style="background:${esc(categoria.cor)}">
      <img src="/assets/icons/${esc(categoria.icone)}" alt="" width="16" height="16">${esc(categoria.nome ?? categoria.rotulo)}
    </span>`;
}

export function seloStatus(status) {
  return `<span class="status status--${esc(status.valor)}">${esc(status.rotulo)}</span>`;
}

// Card de curso. "detalhado" mostra status, modalidade e carga horária (usado no catálogo)
export function cardCurso(curso, { detalhado = false, nivelTitulo = 3 } = {}) {
  const h = `h${nivelTitulo}`;
  const meta = detalhado
    ? `<ul class="card__meta">
        <li>${esc(curso.modalidade.rotulo)}</li>
        <li>${esc(formatarHoras(curso.cargaHoraria))}</li>
        ${curso.dataDisponibilizacao ? `<li>Início ${esc(formatarData(curso.dataDisponibilizacao))}</li>` : "<li>Início imediato</li>"}
      </ul>`
    : "";

  return `<article class="card">
      <img class="card__imagem" src="${esc(curso.imagemUrl)}" alt="" width="640" height="720" loading="lazy" decoding="async">
      <div class="card__topo">
        ${etiquetaCategoria(curso.categoria)}
        ${detalhado ? seloStatus(curso.status) : ""}
      </div>
      <${h} class="card__titulo"><a href="/curso.html?id=${encodeURIComponent(curso.id)}">${esc(curso.nomeCompleto)}</a></${h}>
      <p class="card__resumo">${esc(curso.resumo)}</p>
      ${meta}
    </article>`;
}

export function esqueletos(qtd) {
  return Array.from({ length: qtd }, () => `<li class="esqueleto" aria-hidden="true"></li>`).join("");
}

export function avisoVazio({ titulo, texto, acao = "" }) {
  return `<div class="aviso">
      ${icones.lupaVazia}
      <h3 class="aviso__titulo">${esc(titulo)}</h3>
      <p class="aviso__texto">${esc(texto)}</p>
      ${acao}
    </div>`;
}

export function avisoErro({ titulo = "Não foi possível carregar", texto, acao = "" }) {
  return `<div class="aviso aviso--erro" role="alert">
      ${icones.alerta}
      <h3 class="aviso__titulo">${esc(titulo)}</h3>
      <p class="aviso__texto">${esc(texto)}</p>
      ${acao}
    </div>`;
}

// Carrossel: setas rolam um card por vez; a trilha também rola por toque, mouse e teclado
export function ativarCarrossel(raiz) {
  const trilho = raiz.querySelector(".carrossel__trilho");
  const anterior = raiz.querySelector("[data-anterior]");
  const proximo = raiz.querySelector("[data-proximo]");
  if (!trilho || !anterior || !proximo) return;

  const passo = () => {
    const item = trilho.querySelector("li");
    const gap = parseFloat(getComputedStyle(trilho).columnGap) || 16;
    return item ? item.getBoundingClientRect().width + gap : trilho.clientWidth;
  };

  const atualizar = () => {
    anterior.disabled = trilho.scrollLeft <= 4;
    proximo.disabled = trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 4;
  };

  anterior.addEventListener("click", () => trilho.scrollBy({ left: -passo(), behavior: "smooth" }));
  proximo.addEventListener("click", () => trilho.scrollBy({ left: passo(), behavior: "smooth" }));
  trilho.addEventListener("scroll", atualizar, { passive: true });
  window.addEventListener("resize", atualizar);
  atualizar();
}

// Diálogo simples reaproveitado (ex.: vídeo de apresentação indisponível)
export function abrirDialogo({ titulo, texto }) {
  let dialogo = document.getElementById("dialogo-geral");
  if (!dialogo) {
    dialogo = document.createElement("dialog");
    dialogo.id = "dialogo-geral";
    dialogo.setAttribute("aria-labelledby", "dialogo-geral-titulo");
    document.body.append(dialogo);
  }
  dialogo.innerHTML = `<h2 id="dialogo-geral-titulo">${esc(titulo)}</h2>
    <p>${esc(texto)}</p>
    <form method="dialog"><button class="botao botao--escuro" autofocus>Fechar</button></form>`;
  dialogo.showModal();
}
