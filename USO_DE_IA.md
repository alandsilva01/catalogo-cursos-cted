# Uso de Inteligência Artificial

## Ferramenta utilizada

**Claude Code** (Anthropic): assistente de programação que roda no terminal, com acesso aos arquivos do projeto e aos comandos de build e teste.

## Objetivo do uso

A IA foi usada em todas as etapas, como apoio:

| Etapa | Para que a IA foi usada |
|---|---|
| Análise | Ler o PDF de instruções e transformá-lo em checklist; analisar as telas do Figma e os arquivos fornecidos (cores extraídas dos SVGs, fontes e imagens) |
| Back-end | Escrever o código em **C#/.NET**, linguagem que eu não dominava (minha base é PHP/Laravel), com explicações de cada conceito comparadas ao equivalente no Laravel |
| Front-end | Acelerar a escrita do HTML, do CSS e do JavaScript a partir do Figma |
| Testes | Criar e executar testes automatizados (API, navegador e acessibilidade), incluindo os testes de integração em xUnit e o workflow de CI |
| Segurança | Verificar dependências com vulnerabilidade conhecida. Foi encontrado um alerta alto no `SQLitePCLRaw` 2.1.6, que vem com o EF Core 8; a versão foi fixada em 3.0.5 e os testes foram executados de novo |
| Documentação | Estruturar o README com os itens pedidos no PDF |

## Prompts relevantes

Os pedidos abaixo estão resumidos.

**1. Escolha da stack**
> "C# e .NET eu não sei. Daria para usar o front e as páginas do meu site-starter (Laravel) e talvez um app de indicadores que eu já tenho?"

- **Aproveitado:**
  - a ideia de um **painel de indicadores**, que virou o endpoint `/api/indicadores` e a faixa de números do catálogo;
  - o conhecimento de front-end, aplicado em HTML/CSS/JS puro.
- **Descartado:**
  - reaproveitar o projeto Laravel, porque o PDF exige back-end em C#/.NET;
  - usar código de projetos de clientes, por questão de propriedade intelectual.

**2. Arquitetura**
> Pedido: montar a API em C# com os campos do PDF, explicando cada parte em comparação com o Laravel (Model, migration, seeder, controller).

- **Aproveitado:**
  - Minimal API;
  - Entity Framework Core com SQLite local e PostgreSQL na publicação;
  - DTOs separados das entidades;
  - erros no padrão Problem Details;
  - pesquisa por uma coluna normalizada (sem acento e em minúsculas), para funcionar igual nos dois bancos.
- **Descartado:**
  - *migrations* (troquei por `EnsureCreated` + scripts SQL gerados, que é mais simples para um catálogo somente leitura);
  - framework no front-end, como React (desnecessário para o escopo e fora das linguagens pedidas na vaga).

**3. Front-end a partir do Figma**
> Pedido: montar as telas seguindo os prints do Figma e os arquivos fornecidos, e criar a tela de catálogo (que não existia no protótipo) com os mesmos componentes.

- **Aproveitado:** a estrutura das páginas, o CSS com as cores e a fonte do Figma, e os estados de carregamento, vazio e erro.
- **Registrado no README:** as diferenças em relação ao Figma, com a justificativa de cada uma.

## Como o conteúdo foi validado

1. **Compilação** sem avisos nem erros (`dotnet build`).
2. **API testada por requisição real** em todos os casos:
   - lista completa;
   - pesquisa com e sem acento e com maiúsculas;
   - filtros isolados e combinados;
   - nenhum resultado;
   - parâmetro inválido (`400`) e curso inexistente (`404`);
   - soma da carga horária dos módulos igual à do curso.
3. **Testes no navegador** (Playwright):
   - fluxo completo de pesquisar, filtrar, combinar, limpar, abrir detalhes e usar a área do aluno;
   - estados simulados de API lenta (carregamento) e API fora do ar (erro + "tentar novamente");
   - três larguras de tela (375, 768 e 1366px), conferindo que não há rolagem horizontal.
4. **Acessibilidade** verificada com axe-core (WCAG 2 A/AA): 0 violações.
5. **Revisão visual** das capturas de tela, lado a lado com os prints do Figma.

## Exemplo de erro ou inadequação identificado

**1. Laço infinito no botão "Limpar filtros"**

O código gerado tratava o evento `reset` do formulário chamando `form.reset()` dentro do próprio tratador. Como `form.reset()` dispara o evento `reset` de novo, isso gera um laço infinito. O problema foi identificado na revisão do código, antes de ir para os testes.

**2. Problemas visuais encontrados na comparação com o Figma**
- **Setas trocadas:** o carrossel exibia a seta "próximo" no lugar da "anterior". Os nomes dos SVGs fornecidos são enganosos: `arrow-navigation-1.svg` é a seta para a **direita**.
- **Estrelas invisíveis:** as estrelas dos depoimentos não apareciam, porque o `star.svg` fornecido é branco e sumia sobre o card branco.
- **Quebra de palavra:** no celular, o botão da barra fixa quebrava a palavra ("Matricule-/se").

## Correção realizada

- **Limpar filtros:** os campos passaram a ser zerados um a um, sem chamar `form.reset()`, e a lista é recarregada em seguida.
- **Setas:** os arquivos foram trocados entre "anterior" e "próximo" nos dois carrosséis.
- **Estrelas:** aplicado `filter: brightness(0)` no CSS para deixá-las pretas, como no Figma.
- **Botão da barra fixa:** `white-space: nowrap` e `flex-shrink: 0`.

Depois das correções, os testes de navegador e de acessibilidade foram executados de novo, sem falhas.
