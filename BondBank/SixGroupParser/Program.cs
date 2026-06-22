using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NLog.Extensions.Logging;
using Shared.BotHelpers;
using Shared.Connection;
using Shared.Services;
using Shared.Services.Interfaces;
using Shared.WorkingWithFiles;
using SixGroupParser;
using SixGroupParser.HelperMethods;
using SixGroupParser.Models;

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
services.AddSingleton<CsvHelper>();

// Сам парсер
services.AddSingleton<BondParser>();
services.AddSingleton<IBondProvider<BondModel>, BondParser>();

var sp = services.BuildServiceProvider();

// Получаем и запускаем парсер
var parser = sp.GetRequiredService<BondParser>();
await parser.GetBondsAsync();