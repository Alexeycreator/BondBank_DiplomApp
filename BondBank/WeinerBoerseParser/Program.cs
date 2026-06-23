using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NLog.Extensions.Logging;
using Shared.BotHelpers;
using Shared.Connection;
using Shared.Services;
using Shared.Services.Interfaces;
using Shared.WorkingWithFiles;
using WeinerBoerseParser;
using WeinerBoerseParser.HelperMethods;
using WeinerBoerseParser.Models;

var services = new ServiceCollection();

services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddNLog();
});

services.AddHttpClient();
services.AddHttpClient<ConnectionMonitor>();
services.AddHttpClient<CsvService>();

services.AddSingleton<InternetChecker>();
services.AddSingleton<BotService>();
services.AddSingleton<ConnectionMonitor>();
services.AddSingleton<CsvHelper>();

services.AddSingleton<BondParser>();
services.AddSingleton<IBondProvider<BondModel>, BondParser>();

var sp = services.BuildServiceProvider();

var parser = sp.GetRequiredService<BondParser>();
await parser.GetBondsAsync();