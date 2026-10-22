import { api } from "./api.js";
import { abrirDialogo, ativarCarrossel, avisoErro, cardCurso, esqueletos } from "./componentes.js";

const lista = document.getElementById("destaques-lista");
const estado = document.getElementById("destaques-estado");

async function carregarDestaques() {
  lista.innerHTML = esqueletos(4);
  lista.setAttribute("aria-busy", "true");
  estado.innerHTML = "";

  try {
    const { itens } = await api.destaques();
    lista.innerHTML = itens.map((c) => `<li>${cardCurso(c)}</li>`).join("");
    ativarCarrossel(document.getElementById("carrossel-destaques"));
  } catch (erro) {
    lista.innerHTML = "";
    estado.innerHTML = avisoErro({
      texto: erro.message,
      acao: `<button class="botao botao--escuro" type="button" id="tentar-destaques">Tentar novamente</button>`,
    });
    document.getElementById("tentar-destaques").addEventListener("click", carregarDestaques);
  } finally {
    lista.setAttribute("aria-busy", "false");
  }
}

document.getElementById("botao-video").addEventListener("click", () =>
  abrirDialogo({
    titulo: "Vídeo de apresentação",
    texto: "O vídeo institucional não foi disponibilizado nos materiais do protótipo. Nesta versão, a área exibe apenas a imagem de capa.",
  })
);

carregarDestaques();
