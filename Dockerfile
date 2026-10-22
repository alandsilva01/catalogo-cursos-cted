# Etapa 1: compilar e publicar
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/CatalogoCursos.Api/CatalogoCursos.Api.csproj src/CatalogoCursos.Api/
RUN dotnet restore src/CatalogoCursos.Api/CatalogoCursos.Api.csproj

COPY src/ src/
RUN dotnet publish src/CatalogoCursos.Api/CatalogoCursos.Api.csproj -c Release -o /app --no-restore

# Etapa 2: imagem final apenas com o runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .

ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

# Usuario sem privilegios (ja existe na imagem oficial)
RUN mkdir -p /app/App_Data && chown -R app:app /app/App_Data
USER app

ENTRYPOINT ["dotnet", "CatalogoCursos.Api.dll"]
