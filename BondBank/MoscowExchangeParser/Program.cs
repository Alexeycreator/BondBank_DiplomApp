using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MoscowExchangeParser;
using MoscowExchangeParser.Models;
using NLog.Extensions.Logging;
using Shared.BotHelpers;
using Shared.Connection;
using Shared.Services;
using Shared.Services.Interfaces;
using Shared.WorkingWithFiles;

var services = new ServiceCollection();

// Логирование
services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddNLog();
});

// HTTP клиенты
services.AddHttpClient();
services.AddHttpClient<ConnectionMonitor>();

// Сервисы
services.AddSingleton<InternetChecker>();
services.AddSingleton<BotService>();
services.AddSingleton<ConnectionMonitor>();
services.AddSingleton<CsvService>();

// Сам парсер
services.AddSingleton<BondParser>();
services.AddSingleton<IBondProvider<Bond>, BondParser>();

var sp = services.BuildServiceProvider();

// Получаем и запускаем парсер
var parser = sp.GetRequiredService<BondParser>();
await parser.GetBondsAsync();