// Cliente da API do catálogo. Todas as páginas usam estas funções.

const TEMPO_LIMITE_MS = 10000;

export class ErroApi extends Error {
  constructor(mensagem, status = 0) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
  }
}

async function buscarJson(caminho, { signal } = {}) {
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  // Permite que a página cancele a requisição (ex.: usuário digitou de novo na busca)
  if (signal) {
    if (signal.aborted) controle.abort();
    else signal.addEventListener("abort", () => controle.abort(), { once: true });
  }

  try {
    const resposta = await fetch(caminho, {
      signal: controle.signal,
      headers: { Accept: "application/json" },
    });

    if (!resposta.ok) {
      let detalhe = null;
      try {
        detalhe = await resposta.json();
      } catch {
        /* resposta sem corpo JSON */
      }
      throw new ErroApi(detalhe?.title || `Erro ${resposta.status} ao consultar o servidor.`, resposta.status);
    }

    return await resposta.json();
  } catch (erro) {
    if (erro instanceof ErroApi) throw erro;
    if (signal?.aborted) throw erro; // cancelado pela página: quem chamou ignora
    if (controle.signal.aborted) throw new ErroApi("O servidor demorou demais para responder.");
    throw new ErroApi("Não foi possível conectar ao servidor. Verifique sua conexão.");
  } finally {
    clearTimeout(timer);
  }
}

let destaquesCache = null;

export const api = {
  listarCursos(filtros = {}, opcoes) {
    const params = new URLSearchParams();
    for (const [chave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && String(valor).trim() !== "") {
        params.set(chave, String(valor).trim());
      }
    }
    const consulta = params.toString();
    return buscarJson(`/api/cursos${consulta ? `?${consulta}` : ""}`, opcoes);
  },

  obterCurso(id, opcoes) {
    return buscarJson(`/api/cursos/${encodeURIComponent(id)}`, opcoes);
  },

  filtros(opcoes) {
    return buscarJson("/api/filtros", opcoes);
  },

  indicadores(opcoes) {
    return buscarJson("/api/indicadores", opcoes);
  },

  // Usado pelo carrossel da home e pelo rodapé: uma única requisição por página
  destaques() {
    destaquesCache ??= this.listarCursos({ destaque: true }).catch((erro) => {
      destaquesCache = null;
      throw erro;
    });
    return destaquesCache;
  },
};
