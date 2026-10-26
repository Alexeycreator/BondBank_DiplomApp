using DotNetEnv;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NLog.Extensions.Logging;
using VKBot.Config;
using VKBot.Connection;
using VKBot.Services;
using VkNet;
using VkNet.Exception;
using VkNet.Model;

Env.Load();
var configuration = new ConfigurationBuilder()
    .AddEnvironmentVariables()
    .Build();

var services = new ServiceCollection();

services.AddSingleton<IConfiguration>(configuration);

services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddNLog();
});

services.AddSingleton<MethodsBot>();
services.AddSingleton<BotHealthChecker>();
services.AddSingleton<ConnectionSettings>();
services.AddSingleton<TcpServer>();
services.AddSingleton<CommandHandler>();

services.AddSingleton<VkApi>(provider =>
{
    var logger = provider.GetRequiredService<ILogger<VkApi>>();
    var accessToken = ConfigLoader.Instance.Bot.AccessToken;

    try
    {
        logger.LogInformation($"Авторизация бота...");
        var vkApi = new VkApi();
        vkApi.Authorize(new ApiAuthParams()
        {
            AccessToken = accessToken
        });
        logger.LogInformation($"VkApi успешно авторизован");
        return vkApi;
    }
    catch (AccessTokenInvalidException ex)
    {
        logger.LogError(
            "Вы либо забыли авторизоваться, либо закончился срок действия ключа авторизации: {ExMessage}", ex.Message);
        throw;
    }
    catch (VkApiException ex)
    {
        logger.LogError("Неизвестная ошибка авторизации: {ExMessage}", ex.Message);
        throw;
    }
    catch (Exception ex)
    {
        logger.LogError("Неизвестная ошибка авторизации бота: {ExMessage}", ex.Message);
        throw;
    }
});

var sp = services.BuildServiceProvider();

var connectionSettings = sp.GetRequiredService<ConnectionSettings>();
await connectionSettings.StartAsync();

Console.WriteLine("Запущен бот..." + Environment.NewLine + "Для остановки бота нажмите любую клавишу...");
Console.ReadKey();