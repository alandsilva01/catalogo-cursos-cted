# Catálogo de Cursos — CTED

Aplicação web para consulta do catálogo de cursos do Centro de Tecnologias e Educação Digital (CTED): listagem, pesquisa, filtros e detalhes de cada curso.

> Documentação completa em construção.

## Executar localmente

Requisito: [.NET SDK 8](https://dotnet.microsoft.com/download/dotnet/8.0).

```bash
cd src/CatalogoCursos.Api
dotnet run --urls http://localhost:5080
```

O banco SQLite é criado e populado automaticamente em `App_Data/catalogo.db` na primeira execução.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/cursos?busca=&categoria=&modalidade=&status=&destaque=` | Lista cursos com pesquisa e filtros combináveis |
| GET | `/api/cursos/{id}` | Detalhes do curso, com módulos e aulas |
| GET | `/api/filtros` | Opções de filtro com a quantidade de cursos em cada uma |
| GET | `/api/indicadores` | Indicadores do catálogo |
| GET | `/health` | Verificação de saúde |
