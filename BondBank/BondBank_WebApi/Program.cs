using BondBank_WebApi.Controllers.BondHistories;
using BondBank_WebApi.Controllers.Bonds;
using BondBank_WebApi.Controllers.CurrencyRates;
using BondBank_WebApi.Controllers.Passports;
using BondBank_WebApi.Controllers.Portfolios;
using BondBank_WebApi.Controllers.Snils;
using BondBank_WebApi.Controllers.Users;
using BondBank_WebApi.HelperMethods;
using BondBank_WebApi.HelperMethods.Validators;
using BondBank_WebApi.Services.Analysis;
using BondBank_WebApi.Services.BackgroundServices.CurrencyRates;
using BondBank_WebApi.Services.BackgroundServices.MinIO;
using BondBank_WebApi.Services.BackgroundServices.ParsersData;
using BondBank_WebApi.Services.BackgroundServices.SavingBondHistories;
using BondBank_WebApi.Services.DataContext;
using BondBank_WebApi.Services.Interfaces;
using BondBank_WebApi.Services.Keycloak;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using NLog.Extensions.Logging;
using Shared.BotHelpers;
using Shared.Connection;
using Shared.Services;
using Shared.WorkingWithFiles;
using DotNetEnv;
using Shared.Config.MinIO;
using Shared.Services.MinIO;

Env.Load();

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

// ==================== 1. НАСТРОЙКА АУТЕНТИФИКАЦИИ ====================
// Заменяем ручной AddJwtBearer на метод из библиотеки Keycloak
builder.Services.AddKeycloakWebApiAuthentication(builder.Configuration, options =>
{
    options.RequireHttpsMetadata = false; // <--- РАЗРЕШАЕМ HTTP
});

// 2. РЕГИСТРАЦИЯ ТРАНСФОРМЕРА РОЛЕЙ
builder.Services.AddTransient<IClaimsTransformation, KeycloakRolesClaimsTransformation>();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("admin"));
    options.AddPolicy("UserOnly", policy => policy.RequireRole("user"));
});

const string FrontendCorsPolicy = "FrontendCorsPolicy";

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "https://localhost:3000",
                "http://127.0.0.1:3000",
                "https://127.0.0.1:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddControllersWithViews();

// ==================== 3. НАСТРОЙКА SWAGGER (АДАПТАЦИЯ ПОД .NET 10) ====================
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BondBank API",
        Version = "v1",
        Description = "API для приложения с авторизацией через Keycloak"
    });

    c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.OAuth2,
        Flows = new OpenApiOAuthFlows
        {
            AuthorizationCode = new OpenApiOAuthFlow
            {
                AuthorizationUrl =
                    new Uri(
                        $"{builder.Configuration["Keycloak:auth-server-url"]}/realms/{builder.Configuration["Keycloak:realm"]}/protocol/openid-connect/auth"),
                TokenUrl = new Uri(
                    $"{builder.Configuration["Keycloak:auth-server-url"]}/realms/{builder.Configuration["Keycloak:realm"]}/protocol/openid-connect/token"),
                Scopes = new Dictionary<string, string>
                {
                    { "openid", "OpenID Connect scope" },
                    { "profile", "User profile" },
                    { "email", "Email address" }
                }
            }
        }
    });

    // ИСПРАВЛЕНИЕ ДЛЯ .NET 10: Используем лямбда-выражение (Func), как требует новый Microsoft.OpenApi
    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("oauth2", document)] = new List<string>()
    });
});

// ==================== 4. ИНИЦИАЛИЗАЦИЯ КОНТЕЙНЕРОВ (ВКЛЮЧЕНИЕ ЗАВИСИМОСТЕЙ) ====================
builder.Services.AddLogging();
builder.Services.AddNLog();

builder.Services.AddHttpClient<ConnectionMonitor>();
builder.Services.AddHttpClient<CsvHelper>();
builder.Services.AddHttpClient<ParserFilesBackgroundService>();

builder.Services.AddDbContext<ApplicationContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSqlConnectionString")));
builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));

builder.Services.AddSingleton<ConnectionMonitor>();
builder.Services.AddSingleton<BotService>();
builder.Services.AddSingleton<InternetChecker>();
builder.Services.AddSingleton<CsvService>();
builder.Services.AddSingleton<CsvHelper>();

builder.Services.AddScoped<CurrencyRatesParser>();
builder.Services.AddScoped<CurrencyRatesPushInDataBase>();
builder.Services.AddHostedService<CurrencyRatesBackgroundService>();

builder.Services.AddScoped<ProcessingData>();
builder.Services.AddScoped<PushingInDataBase>();
builder.Services.AddHostedService<ParserDataBackgroundService>();

builder.Services.AddScoped<IBondControllerService, BondControllerService>();

builder.Services.AddScoped<BondDataVerification>();
builder.Services.AddScoped<BondHistoriesService>();
builder.Services.AddHostedService<SavedBondHistoriesBackgroundService>();

builder.Services.AddSingleton<BondsHistoryDictionary>();
builder.Services.AddScoped<AnalysisData>();

builder.Services.AddScoped<ICurrencyRatesControllerService, CurrencyRatesControllerService>();
builder.Services.AddScoped<IBondHistoriesControllerService, BondHistoriesControllerService>();
builder.Services.AddScoped<IPassportsControllerService, PassportsControllerService>();
builder.Services.AddScoped<ISnilsControllerService, SnilsControllerService>();
builder.Services.AddScoped<IPortfoliosControllerService, PortfoliosControllerService>();
builder.Services.AddScoped<IUsersControllerService, UsersControllerService>();

builder.Services.AddHttpClient<KeycloakUserSyncService>();

builder.Services.AddSingleton<BondValidator>();

var minioConfig = new MinioConfig
{
    Endpoint = Environment.GetEnvironmentVariable("MINIO_ENDPOINT") ?? "http://localhost:9000",
    AccessKey = Environment.GetEnvironmentVariable("MINIO_ACCESS_KEY") ?? "admin_mio",
    SecretKey = Environment.GetEnvironmentVariable("MINIO_SECRET_KEY") ?? "admin_mio",
    BucketName = Environment.GetEnvironmentVariable("MINIO_BUCKET_NAME") ?? "bondbank-files"
};

builder.Services.AddSingleton(minioConfig);
builder.Services.AddSingleton<MinioStorageService>();

builder.Services.AddHostedService<ParserFilesBackgroundService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();

    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BondBank API V1");
        c.RoutePrefix = string.Empty;
        c.DisplayRequestDuration();
        c.OAuthClientId(builder.Configuration["Keycloak:resource"]);
        c.OAuthRealm(builder.Configuration["Keycloak:realm"]);
        c.OAuthAppName("BondBank Swagger");
        c.OAuthScopeSeparator(" ");
        c.OAuthUsePkce();
    });
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

//app.UseHttpsRedirection(); // Оставляем закомментированным, раз работаем по HTTP
app.UseRouting();

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();

// Middleware для синхронизации (оставляем после аутентификации)
app.Use(async (HttpContext context, RequestDelegate next) =>
{
    if (context.User.Identity?.IsAuthenticated == true)
    {
        var keycloakUserId = context.User.FindFirst("sub")?.Value
                             ?? context.User
                                 .FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
                                 ?.Value;

        var email = context.User.FindFirst("email")?.Value
                    ?? context.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")
                        ?.Value;

        var secondName = context.User.FindFirst("family_name")?.Value ??
                         context.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname")
                             ?.Value
                         ?? "";
        var firstName = context.User.FindFirst("given_name")?.Value
                        ?? context.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname")
                            ?.Value
                        ?? "";

        if (!string.IsNullOrEmpty(keycloakUserId) && !string.IsNullOrEmpty(email))
        {
            try
            {
                var usersService = context.RequestServices.GetRequiredService<IUsersControllerService>();
                await usersService.EnsureUserExistsAsync(keycloakUserId, email, secondName, firstName);
            }
            catch (Exception ex)
            {
                var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogError(ex, "Ошибка при синхронизации пользователя из Keycloak в БД");
            }
        }
    }

    await next(context);
});

app.UseAuthorization();

app.MapStaticAssets();
app.MapControllerRoute(
        name: "default",
        pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();