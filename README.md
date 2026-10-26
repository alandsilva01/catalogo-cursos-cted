# Catálogo de Cursos — CTED

Aplicação web para consulta do catálogo de cursos do **Centro de Tecnologias e Educação Digital (CTED)**. O usuário consulta, pesquisa e filtra cursos, vê os detalhes de cada oferta e acessa uma área do aluno com módulos e aulas.

- **Aplicação publicada:** https://catalogo-cursos-cted-9u7l.onrender.com (plano gratuito: o primeiro acesso após um período parado pode levar cerca de 1 minuto)
- **Repositório:** https://github.com/alandsilva01/catalogo-cursos-cted
- **Pacote de publicação (ZIP):** https://github.com/alandsilva01/catalogo-cursos-cted/releases/latest

---

## 1. Objetivo da aplicação

Disponibilizar um catálogo de cursos com:

- listagem dos cursos consumida de uma API;
- pesquisa pelo nome (sem diferenciar maiúsculas e acentos);
- filtros por categoria, modalidade e status, combináveis entre si e com a pesquisa;
- quantidade de resultados, botão para limpar os filtros e filtros preservados na URL;
- página de detalhes com módulos e aulas;
- estados de carregamento, nenhum resultado e erro;
- interface responsiva e acessível, baseada no protótipo do Figma.

## 2. Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Back-end / API | C# 12, **ASP.NET Core 8** (Minimal API) |
| Acesso a dados | **Entity Framework Core 8** |
| Banco de dados | **PostgreSQL** (publicação) e **SQLite** (execução local), ambos de código aberto |
| Front-end | **HTML5, CSS3 e JavaScript** (ES Modules), sem framework |
| Fonte e ícones | Open Sans (licença OFL) e SVGs fornecidos com o protótipo |
| Publicação | Docker, Render (plano gratuito) e Neon (PostgreSQL gratuito) |
| Testes | Playwright e axe-core (acessibilidade) |

## 3. Arquitetura da solução

```
Navegador (HTML/CSS/JS)
      │  fetch JSON
      ▼
ASP.NET Core 8 ── serve os arquivos estáticos (wwwroot) e a API (/api/*)
      │  Entity Framework Core (LINQ)
      ▼
PostgreSQL (publicação)  |  SQLite (local)
```

- **Uma única aplicação** serve o front-end e a API no mesmo domínio: um só deploy e nenhuma configuração de CORS.
- **Endpoints** agrupados em `Endpoints/CursosEndpoints.cs`. As respostas usam **DTOs** (`Dtos/`), separados das entidades do banco, para não expor campos internos.
- **Banco escolhido por configuração** (`Database:Provider`): SQLite para rodar sem instalar nada e PostgreSQL na publicação. O código da aplicação é o mesmo nos dois casos.
- **Criação e carga do banco automáticas:** na primeira execução, as tabelas são criadas e populadas com dados fictícios (`Data/SeedData.cs`).
- **Erros padronizados** no formato *Problem Details* (RFC 9457): `400` para parâmetros inválidos e `404` para curso inexistente.
- **Segurança:** a API é somente leitura (apenas `GET`), valida os parâmetros e envia cabeçalhos `X-Content-Type-Options`, `X-Frame-Options` e `Referrer-Policy`. No front-end, todo dado vindo da API é escapado antes de entrar no HTML (`esc()` em `js/componentes.js`).

## 4. Estrutura das pastas

```
catalogo-cursos-cted/
├── src/CatalogoCursos.Api/
│   ├── Program.cs              # configuração da aplicação e pipeline HTTP
│   ├── appsettings.json        # banco padrão (SQLite) e logs
│   ├── Models/                 # entidades: Categoria, Curso, Modulo, Aula
│   ├── Data/
│   │   ├── AppDbContext.cs     # mapeamento das tabelas (EF Core)
│   │   ├── BancoDeDados.cs     # escolha do banco, criação e geração de scripts
│   │   ├── SeedData.cs         # dados fictícios
│   │   └── TextoBusca.cs       # normalização de texto para a pesquisa
│   ├── Dtos/                   # formatos de resposta da API e rótulos em português
│   ├── Endpoints/              # rotas /api/*
│   └── wwwroot/                # front-end
│       ├── index.html          # landing page
│       ├── cursos.html         # catálogo com pesquisa e filtros
│       ├── curso.html          # detalhes do curso
│       ├── ava.html            # área do aluno
│       ├── css/estilos.css
│       ├── js/                 # api.js, componentes.js, layout.js e um script por página
│       └── assets/             # fontes, ícones e imagens (WebP)
├── database/                   # scripts SQL de criação (PostgreSQL e SQLite)
├── Dockerfile
├── docker-compose.yml          # aplicação + PostgreSQL local
├── render.yaml                 # blueprint de publicação no Render
├── README.md
└── USO_DE_IA.md
```

## 5. Instruções para execução

### Opção A — .NET SDK (mais simples, usa SQLite)

Requisito: [.NET SDK 8](https://dotnet.microsoft.com/download/dotnet/8.0).

```bash
cd src/CatalogoCursos.Api
dotnet run --urls http://localhost:5080
```

Acesse **http://localhost:5080**. O banco `App_Data/catalogo.db` é criado e populado na primeira execução.

### Opção B — Docker (usa PostgreSQL)

```bash
docker compose up --build
```

Acesse **http://localhost:8080**.

### Opção C — pacote publicado (ZIP)

Requisito: [ASP.NET Core Runtime 8](https://dotnet.microsoft.com/download/dotnet/8.0). O ZIP está na página de [releases](https://github.com/alandsilva01/catalogo-cursos-cted/releases/latest).

```bash
# descompacte catalogo-cursos-cted-publicacao.zip e, dentro da pasta:
dotnet CatalogoCursos.Api.dll --urls http://localhost:5080
```

## 6. Configuração do banco

| Configuração | Valor | Uso |
|---|---|---|
| `Database:Provider` | `Sqlite` (padrão) ou `Postgres` | Escolhe o banco |
| `ConnectionStrings:Sqlite` | `Data Source=App_Data/catalogo.db` | Arquivo SQLite |
| `ConnectionStrings:Postgres` | `Host=...;Database=...;Username=...;Password=...` | Conexão PostgreSQL |
| `DATABASE_URL` | `postgresql://usuario:senha@host/banco` | Alternativa no formato URL (Neon e Render), com SSL |

Em variáveis de ambiente, use `__` no lugar de `:`. Por exemplo, `Database__Provider=Postgres`.

- **Criação:** automática na inicialização (`EnsureCreated`), seguida da carga dos dados fictícios caso o banco esteja vazio.
- **Scripts SQL:** `database/schema-postgres.sql` e `database/schema-sqlite.sql`. Para regerá-los:
  ```bash
  cd src/CatalogoCursos.Api
  dotnet run -- --gerar-sql
  ```
- **Recriar os dados locais:** apague `src/CatalogoCursos.Api/App_Data/catalogo.db` e execute de novo.

## 7. Endpoints

Base: `/api`. Todas as respostas são JSON.

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/cursos` | Lista os cursos. Parâmetros opcionais e combináveis: `busca`, `categoria` (slug), `modalidade` (`Ead`, `Presencial`, `Hibrido`), `status` (`InscricoesAbertas`, `EmBreve`, `Encerrado`) e `destaque` (`true`/`false`) |
| GET | `/api/cursos/{id}` | Detalhes do curso, com módulos e aulas. Retorna `404` se não existir |
| GET | `/api/filtros` | Opções de categoria, modalidade e status, com a quantidade de cursos em cada uma |
| GET | `/api/indicadores` | Totais do catálogo: cursos, categorias, carga horária e distribuição por categoria, modalidade e status |
| GET | `/health` | Verificação de saúde, usada pelo Render |

Exemplos:

```http
GET /api/cursos?busca=metalurgia&modalidade=Ead
```
```json
{
  "total": 1,
  "itens": [
    {
      "id": 1,
      "slug": "matematica-para-a-precisao",
      "nomeCompleto": "Matemática para a Precisão: Medidas e Escalas na Metalurgia",
      "nomeBreve": "Matemática para a Precisão",
      "resumo": "Aplicação de grandezas, proporções e escalas em processos de corte, furação e usinagem.",
      "categoria": { "id": 1, "nome": "Matemática", "slug": "matematica", "icone": "icon-matematica-20px.svg", "cor": "#FCD19C" },
      "modalidade": { "valor": "Ead", "rotulo": "EAD" },
      "status": { "valor": "InscricoesAbertas", "rotulo": "Inscrições abertas" },
      "cargaHoraria": 40,
      "publicoAlvo": "Operadores de máquinas, técnicos em metalurgia e estudantes de cursos técnicos industriais.",
      "imagemUrl": "/assets/img/cursos/matematica-para-a-precisao.webp",
      "dataDisponibilizacao": "2026-11-09",
      "destaque": true
    }
  ]
}
```

```http
GET /api/cursos?status=xyz
```
```json
{
  "title": "Parâmetros de consulta inválidos.",
  "status": 400,
  "errors": { "status": ["Status inválido. Use: InscricoesAbertas, EmBreve, Encerrado."] }
}
```

## 8. Modelo de dados

```
categorias 1 ── N cursos 1 ── N modulos 1 ── N aulas
```

| Tabela | Campos principais |
|---|---|
| **categorias** | `Id`, `Nome`, `Slug` (único), `Icone`, `Cor` |
| **cursos** | `Id`, `NomeCompleto`, `NomeBreve`, `Slug` (único), `Resumo`, `Descricao`, `CategoriaId` (FK), `Modalidade`, `Status`, `CargaHoraria`, `PublicoAlvo`, `Certificacao`, `ImagemUrl`, `DataDisponibilizacao` (opcional), `Destaque`, `NomeBusca` |
| **modulos** | `Id`, `CursoId` (FK), `Ordem`, `Titulo`, `Descricao` |
| **aulas** | `Id`, `ModuloId` (FK), `Ordem`, `Titulo`, `Descricao`, `Tipo` (`Video`, `Leitura`, `Atividade`, `Avaliacao`), `DuracaoMinutos` |

- `Modalidade`, `Status` e `Tipo` são *enums* gravados como **texto**, o que deixa o banco legível e evita depender da ordem do enum.
- `NomeBusca` guarda o nome em minúsculas e sem acentos, para que a pesquisa funcione igual no SQLite e no PostgreSQL ("matematica" encontra "Matemática").
- Há índices em `Slug`, `Status` e `Modalidade`.

**Dados fictícios:** 8 cursos, 4 categorias (Matemática, Ciências da Natureza, Linguagens e Sustentabilidade), 3 modalidades (EAD, Presencial e Híbrido) e 3 status (Inscrições abertas, Em breve e Encerrado). Os cursos têm cargas horárias de 20h a 80h, de 2 a 4 módulos, aulas de tipos variados e públicos-alvo diferentes.

## 9. Estratégia de responsividade

- **Mobile-first:** os estilos base são para celular, com dois pontos de quebra: **640px** (tablet) e **960px** (desktop).
- **Grades fluidas:** os cards ficam em 1, 2 ou 4 colunas; os filtros, em 1, 2 ou 5 colunas; o rodapé, em 1, 2 ou 4 colunas.
- **Tipografia fluida** com `clamp()` nos títulos.
- **Carrosséis** com `scroll-snap`: arrasto no toque e setas no desktop.
- **Menu** em botão "hambúrguer" abaixo de 960px; a lateral do AVA vira um painel que abre e fecha.
- **Imagens em WebP**, com versão menor do banner para celular e `loading="lazy"` nos cards. As imagens originais, de 3 a 4 MB, ficaram com 8 a 105 KB.
- **Validado** em 375px, 768px e 1366px, sem rolagem horizontal em nenhuma página.

## 10. Decisões de acessibilidade

- **Estrutura:** HTML semântico (`header`, `nav`, `main`, `footer`, `section` com títulos), hierarquia de títulos correta e trilha de navegação.
- **Teclado:** link "Pular para o conteúdo"; tudo é operável pelo teclado, com foco visível em todos os elementos interativos.
- **Formulários:** campos com `label` visível e `role="search"` no formulário de filtros.
- **Leitores de tela:**
  - contagem de resultados anunciada com `aria-live`, e `aria-busy` durante o carregamento;
  - acordeão com `button` + `aria-expanded` + `aria-controls`;
  - menu com `aria-expanded`;
  - imagens decorativas com `alt=""` e ícones SVG com `aria-hidden`;
  - estrelas dos depoimentos com rótulo "5 de 5 estrelas".
- **Barra fixa "Matricule-se":** fica `inert` quando está fora da tela, para não receber foco escondida.
- **Contraste** AA, inclusive o texto branco sobre o vermelho do hero.
- **Movimento:** `prefers-reduced-motion` desliga animações e rolagem suave.
- **Verificação automática** com **axe-core** (WCAG 2 A/AA): 0 violações nas 4 páginas.

## 11. Processo de publicação

1. **Banco:** criar um projeto gratuito no [Neon](https://neon.tech) e copiar a *connection string* (`postgresql://...`) da conexão direta (sem *connection pooling*).
2. **Aplicação:** no [Render](https://render.com), criar um **Web Service** a partir do repositório do GitHub (runtime Docker, plano Free). O arquivo `render.yaml` já descreve o serviço.
3. **Variáveis de ambiente no Render:**
   - `Database__Provider` = `Postgres`
   - `DATABASE_URL` = connection string do Neon
4. **Deploy:** a cada `git push` na `main`, o Render recompila a imagem (`Dockerfile` multi-stage: SDK → runtime) e reinicia. Na primeira subida, as tabelas são criadas e populadas automaticamente.
5. **Verificação:** o endpoint `/health` é usado como *health check*.

**Ambiente publicado:** Render (Web Service Docker, plano Free) + Neon (PostgreSQL, plano Free, região AWS US East). Nenhum serviço pago foi contratado.

**Pacote de publicação (ZIP):** gerado com `dotnet publish -c Release`, contém a aplicação compilada, o `wwwroot` e as dependências. Está disponível na página de [releases](https://github.com/alandsilva01/catalogo-cursos-cted/releases/latest). Para rodar, siga a opção C da seção 5.

## 12. Limitações conhecidas e itens não concluídos

- **Sem autenticação:** a área do aluno é demonstrativa, e o progresso das aulas fica salvo no navegador (`localStorage`), não no servidor.
- **Matrícula:** o botão "Matricule-se" leva à área do aluno do curso; não há cadastro nem pagamento, que estão fora do escopo do teste.
- **Criação do banco com `EnsureCreated`** em vez de *migrations*: adequado para um catálogo somente leitura, mas uma mudança no modelo exige recriar o banco.
- **Plano gratuito do Render:** o serviço "dorme" após um período sem acesso, e a primeira requisição pode levar cerca de 1 minuto.
- **Docker:** a imagem é compilada e executada pelo Render a cada deploy. O `docker-compose.yml` (aplicação + PostgreSQL local) não foi executado no ambiente de desenvolvimento, que não tinha Docker instalado.
- **Integração com Moodle** (diferencial opcional): não implementada.
- **Formulários de contato:** "Fale com a gente" e "Fale conosco" abrem o e-mail do usuário (`mailto:`).

### Diferenças em relação ao Figma (e justificativas)

| Diferença | Justificativa |
|---|---|
| **Página de catálogo** (`cursos.html`) criada | O protótipo não tinha a tela de listagem com pesquisa e filtros, exigida no PDF. Ela foi montada com os componentes do Figma (cards, etiquetas, botões, cores e tipografia). |
| **Faixa de indicadores** no catálogo | Mostra os números do catálogo vindos da API (`/api/indicadores`). Os números de "Impacto transformador" da landing são institucionais e continuam fixos, como no Figma. |
| **Card do catálogo** mostra status, modalidade, carga horária e início | Quem filtra por esses critérios precisa vê-los no resultado. Nos cards do carrossel da landing, o layout é o do Figma. |
| **Detalhes** mostram modalidade, carga horária, status e público-alvo | O PDF exige esses campos. O Figma mostrava apenas início e certificação. |
| **Imagem do curso** no lugar do vídeo, na página de detalhes | Não foi fornecido vídeo. Na landing, o botão de *play* abre um aviso. |
| **Fotos dos cursos** | O pacote trouxe só 3 fotos (hero, vídeo e AVA). Elas foram reaproveitadas com recortes diferentes para os 8 cursos. |
| **Rodapé** sem os links "Blog", "Termos de uso", "Política de privacidade" e "Trabalhe conosco" | São páginas que não existem. Foram removidas para não deixar links quebrados. "Cursos populares" vem da API. |
| **Estrela** dos depoimentos | O SVG fornecido é branco e ficava invisível no card branco. Foi escurecida via CSS, como aparece no Figma. |
