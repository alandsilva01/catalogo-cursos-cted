// Cabeçalho e rodapé comuns a todas as páginas.
// Uso no HTML: <header id="cabecalho" data-variante="hero|padrao" data-pagina="inicio|cursos|sobre"></header>
//              <footer id="rodape"></footer>

import { api } from "./api.js";
import { esc } from "./componentes.js";

const links = [
  { pagina: "inicio", rotulo: "Início", href: "/" },
  { pagina: "cursos", rotulo: "Cursos", href: "/cursos.html" },
  { pagina: "sobre", rotulo: "Sobre", href: "/#sobre" },
];

function montarCabecalho() {
  const cabecalho = document.getElementById("cabecalho");
  if (!cabecalho) return;

  const sobreHero = cabecalho.dataset.variante === "hero";
  const paginaAtual = cabecalho.dataset.pagina;
  const logo = sobreHero ? "logo-sesi-industria-white.svg" : "logo-sesi-industria-primary.svg";

  cabecalho.className = `cabecalho${sobreHero ? " cabecalho--sobre-hero" : ""}`;
  cabecalho.innerHTML = `
    <div class="container cabecalho__barra">
      <a class="cabecalho__logo" href="/" aria-label="SESI+Indústria — página inicial">
        <img src="/assets/img/${logo}" alt="" width="172" height="20">
      </a>
      <button class="botao botao--icone cabecalho__menu-botao" type="button"
              aria-expanded="false" aria-controls="menu-principal" aria-label="Abrir menu">
        <span aria-hidden="true"></span>
      </button>
      <nav class="cabecalho__nav" id="menu-principal" aria-label="Menu principal">
        <ul class="cabecalho__lista">
          ${links
            .map(
              (l) => `<li><a class="cabecalho__link" href="${l.href}"${
                l.pagina === paginaAtual ? ' aria-current="page"' : ""
              }>${l.rotulo}</a></li>`
            )
            .join("")}
          <li><a class="botao ${sobreHero ? "botao--contorno-claro" : "botao--contorno"}" href="/ava.html">Área do aluno</a></li>
        </ul>
      </nav>
    </div>`;

  const botao = cabecalho.querySelector(".cabecalho__menu-botao");
  const nav = cabecalho.querySelector(".cabecalho__nav");

  const fechar = () => {
    nav.classList.remove("aberto");
    botao.setAttribute("aria-expanded", "false");
    botao.setAttribute("aria-label", "Abrir menu");
  };

  botao.addEventListener("click", () => {
    const abrir = !nav.classList.contains("aberto");
    nav.classList.toggle("aberto", abrir);
    botao.setAttribute("aria-expanded", String(abrir));
    botao.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("aberto")) {
      fechar();
      botao.focus();
    }
  });
}

function montarRodape() {
  const rodape = document.getElementById("rodape");
  if (!rodape) return;

  rodape.className = "rodape";
  rodape.innerHTML = `
    <div class="container">
      <div class="rodape__grade">
        <div class="rodape__contato">
          <img class="rodape__logo" src="/assets/img/logo-sesi-industria-white.svg" alt="SESI+Indústria" width="186" height="22">
          <p><a href="mailto:contato@sesindustria.com.br">contato@sesindustria.com.br</a></p>
          <p>Av. Paulista, 1313</p>
        </div>
        <nav aria-labelledby="rodape-nav">
          <h2 class="rodape__titulo" id="rodape-nav">Navegação</h2>
          <ul class="rodape__lista">
            <li><a href="/">Início</a></li>
            <li><a href="/#sobre">Certificação</a></li>
            <li><a href="/cursos.html">Cursos</a></li>
            <li><a href="/#sobre">Sobre</a></li>
            <li><a href="/ava.html">Área do aluno</a></li>
          </ul>
        </nav>
        <nav aria-labelledby="rodape-populares">
          <h2 class="rodape__titulo" id="rodape-populares">Cursos populares</h2>
          <ul class="rodape__lista" id="rodape-cursos">
            <li><a href="/cursos.html">Ver todos os cursos</a></li>
          </ul>
        </nav>
        <nav aria-labelledby="rodape-suporte">
          <h2 class="rodape__titulo" id="rodape-suporte">Suporte</h2>
          <ul class="rodape__lista">
            <li><a href="mailto:contato@sesindustria.com.br?subject=Fale%20conosco">Fale conosco</a></li>
            <li><a href="mailto:contato@sesindustria.com.br?subject=Central%20de%20ajuda">Central de ajuda</a></li>
          </ul>
        </nav>
      </div>
      <div class="rodape__base">
        <p class="rodape__direitos">
          <img src="/assets/img/logo-sesi.svg" alt="SESI" width="56" height="16">
          Todos os direitos reservados.
        </p>
        <ul class="rodape__redes">
          <li><a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (abre em nova aba)"><img src="/assets/icons/icon-linkedIn-24px.svg" alt="" width="24" height="24"></a></li>
          <li><a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram (abre em nova aba)"><img src="/assets/icons/icon-instagram-24px.svg" alt="" width="24" height="24"></a></li>
          <li><a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook (abre em nova aba)"><img src="/assets/icons/icon-facebook-24px.svg" alt="" width="24" height="24"></a></li>
        </ul>
      </div>
    </div>`;

  // Cursos populares vêm da API; se falhar, fica só o link "Ver todos os cursos"
  api
    .destaques()
    .then(({ itens }) => {
      const lista = document.getElementById("rodape-cursos");
      lista.innerHTML =
        itens
          .slice(0, 5)
          .map((c) => `<li><a href="/curso.html?id=${encodeURIComponent(c.id)}">${esc(c.nomeBreve)}</a></li>`)
          .join("") + `<li><a href="/cursos.html">Ver todos os cursos</a></li>`;
    })
    .catch(() => {});
}

montarCabecalho();
montarRodape();
