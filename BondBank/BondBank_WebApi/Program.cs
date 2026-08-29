using BondBank_WebApi.Controllers.BondHistories;
using BondBank_WebApi.Controllers.Bonds;
using BondBank_WebApi.Controllers.CurrencyRates;
using BondBank_WebApi.Controllers.Passports;
using BondBank_WebApi.HelperMethods;
using BondBank_WebApi.Services.Analysis;
using BondBank_WebApi.Services.BackgroundServices.CurrencyRates;
using BondBank_WebApi.Services.BackgroundServices.ParsersData;
using BondBank_WebApi.Services.BackgroundServices.SavingBondHistories;
using BondBank_WebApi.Services.DataContext;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using NLog.Extensions.Logging;
using Shared.BotHelpers;
using Shared.Connection;
using Shared.Services;
using Shared.WorkingWithFiles;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "My API",
        Version = "v1",
        Description = "API для приложения"
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

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();

    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
        c.RoutePrefix = string.Empty;
        c.DisplayRequestDuration();
    });
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();
app.MapControllerRoute(
        name: "default",
        pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();