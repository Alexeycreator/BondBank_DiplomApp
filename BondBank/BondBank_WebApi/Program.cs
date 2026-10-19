using BondBank_WebApi.Controllers.BondHistories;
using BondBank_WebApi.Controllers.Bonds;
using BondBank_WebApi.Controllers.CurrencyRates;
using BondBank_WebApi.Controllers.Passports;
using BondBank_WebApi.Controllers.Portfolios;
using BondBank_WebApi.Controllers.Snils;
using BondBank_WebApi.Controllers.Users;
using BondBank_WebApi.HelperMethods;
using BondBank_WebApi.Services.Analysis;
using BondBank_WebApi.Services.BackgroundServices.CurrencyRates;
using BondBank_WebApi.Services.BackgroundServices.ParsersData;
using BondBank_WebApi.Services.BackgroundServices.SavingBondHistories;
using BondBank_WebApi.Services.DataContext;
using BondBank_WebApi.Services.Interfaces;
using BondBank_WebApi.Services.Keycloak;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using NLog.Extensions.Logging;
using Shared.BotHelpers;
using Shared.Connection;
using Shared.Services;
using Shared.WorkingWithFiles;
using DotNetEnv;

Env.Load();

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

// ==================== 1. НАСТРОЙКА АУТЕНТИФИКАЦИИ ====================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Keycloak:Authority"];
        options.Audience = builder.Configuration["Keycloak:Audience"];
        options.RequireHttpsMetadata = false; // Для локальной разработки
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// 2. РЕГИСТРАЦИЯ ТРАНСФОРМЕРА РОЛЕЙ (чтобы роли из realm_access попали в ClaimTypes.Role)
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
                "https://localhost:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Add services to the container.
builder.Services.AddControllersWithViews();

// ==================== 3. НАСТРОЙКА SWAGGER ====================
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BondBank API",
        Version = "v1",
        Description = "API для приложения с авторизацией через Keycloak"
    });

    // Используем AuthorizationCode Flow вместо Password, так как он лучше работает с Keycloak 26 и PKCE
    c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.OAuth2,
        Flows = new OpenApiOAuthFlows
        {
            AuthorizationCode = new OpenApiOAuthFlow
            {
                // URL для авторизации (куда перекинет пользователя)
                AuthorizationUrl =
                    new Uri($"{builder.Configuration["Keycloak:Authority"]}/protocol/openid-connect/auth"),
                // URL для получения токена
                TokenUrl = new Uri($"{builder.Configuration["Keycloak:Authority"]}/protocol/openid-connect/token"),
                Scopes = new Dictionary<string, string>
                {
                    { "openid", "OpenID Connect scope" },
                    { "profile", "User profile" },
                    { "email", "Email address" }
                }
            }
        }
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "oauth2"
                }
            },
            new[] { "openid" }
        }
    });
});

builder.Services.AddLogging();
builder.Services.AddNLog();

builder.Services.AddHttpClient<ConnectionMonitor>();
builder.Services.AddHttpClient<CsvHelper>();

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

// Регистрация HttpClient для KeycloakUserSyncService
builder.Services.AddHttpClient<KeycloakUserSyncService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();

    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BondBank API V1");
        c.RoutePrefix = string.Empty;
        c.DisplayRequestDuration();
        c.OAuthClientId(builder.Configuration["Keycloak:ClientId"]);
        // Убрали ClientSecret для публичного клиента
        c.OAuthRealm("bondbank");
        c.OAuthAppName("BondBank Swagger");
        c.OAuthScopeSeparator(" ");
        c.OAuthUsePkce(); // Обязательно для Authorization Code Flow
    });
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication(); // Обязательно перед UseAuthorization
app.UseAuthorization();

// Middleware для синхронизации пользователя
app.Use(async (context, next) =>
{
    var keycloakUserId = context.User.FindFirst("sub")?.Value;
    var email = context.User.FindFirst("email")?.Value;
    var name = context.User.FindFirst("name")?.Value;

    if (!string.IsNullOrEmpty(keycloakUserId) && !string.IsNullOrEmpty(email))
    {
        var usersService = context.RequestServices.GetRequiredService<IUsersControllerService>();
        await usersService.EnsureUserExistsAsync(keycloakUserId, email, name ?? string.Empty);
    }

    await next();
});

app.MapStaticAssets();
app.MapControllerRoute(
        name: "default",
        pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();