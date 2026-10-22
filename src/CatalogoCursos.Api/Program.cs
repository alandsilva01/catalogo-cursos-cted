using CatalogoCursos.Api.Data;
using CatalogoCursos.Api.Endpoints;

if (args.Contains("--gerar-sql"))
{
    var pasta = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "database"));
    BancoDeDados.GerarScripts(pasta);
    Console.WriteLine($"Scripts gerados em {pasta}");
    return;
}

var builder = WebApplication.CreateBuilder(args);

// Plataformas como o Render informam a porta pela variavel PORT
var porta = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(porta))
    builder.WebHost.UseUrls($"http://0.0.0.0:{porta}");

builder.Services.AddBancoDeDados(builder.Configuration);
builder.Services.AddProblemDetails();

var origens = builder.Configuration.GetSection("Cors:Origens").Get<string[]>() ?? [];
if (origens.Length > 0)
{
    // So necessario se o front-end for publicado em outro dominio
    builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.WithOrigins(origens).WithMethods("GET")));
}

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    await next();
});

if (origens.Length > 0)
    app.UseCors();

// Front-end estatico (wwwroot): index.html, cursos.html, curso.html...
app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // Imagens, fontes e icones mudam pouco: cache de 7 dias. HTML, CSS e JS sempre revalidam.
        if (ctx.Context.Request.Path.StartsWithSegments("/assets"))
            ctx.Context.Response.Headers.CacheControl = "public, max-age=604800";
        else
            ctx.Context.Response.Headers.CacheControl = "no-cache";
    }
});

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapCursosEndpoints();

await BancoDeDados.PrepararAsync(app.Services);

app.Run();
