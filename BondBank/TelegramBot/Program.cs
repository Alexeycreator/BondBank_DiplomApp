using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NLog.Extensions.Logging;
using TelegramBot.Connection;
using TelegramBot.Methods;
using TelegramBot.Services;

var services = new ServiceCollection();

// Логирование
services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddNLog();
});

// HTTP клиенты
services.AddHttpClient();
services.AddHttpClient<BotHealthChecker>();

// Сервисы
services.AddSingleton<BotMainMethods>();
services.AddSingleton<BotHealthChecker>();
services.AddSingleton<ParserRestarter>();
services.AddSingleton<CommandHandler>();
services.AddSingleton<TcpServer>();
services.AddSingleton<ConnectionSettings>();

var sp = services.BuildServiceProvider();

var connectionSettings = sp.GetRequiredService<ConnectionSettings>();
await connectionSettings.StartAsync();

Console.WriteLine("Запущен бот..." + Environment.NewLine + "Для остановки бота нажмите любую клавишу...");
Console.ReadKey();