using Microsoft.Extensions.Logging;
using Shared.Config;
using TelegramBot.Methods;

namespace TelegramBot.Connection;

public sealed class ConnectionSettings(
    ILogger<ConnectionSettings> logger,
    BotHealthChecker healthChecker,
    TcpServer tcpServer,
    BotMainMethods bot)
{
    private string TokenBot => Config.ConfigLoader.Instance.Bot.Token;
    private int PortBot => ConfigLoader.Instance.Bot.Port;

    public async Task StartAsync(CancellationToken cancellationToken = default)
    {
        healthChecker.SetToken(TokenBot);

        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                logger.LogInformation("Проверка статуса активности бота...");
                bool isBotActive = await healthChecker.IsBotActiveAsync(cancellationToken);

                if (isBotActive)
                {
                    _ = Task.Run(() => bot.RunBot(TokenBot, 10), cancellationToken);
                    await tcpServer.StartAsync(PortBot, cancellationToken);
                }
                else
                {
                    logger.LogWarning("Сервер недоступен или бот неактивен. Повторная попытка через 30 секунд...");
                    await Task.Delay(TimeSpan.FromSeconds(30), cancellationToken);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Ошибка в основном цикле бота");
                await Task.Delay(TimeSpan.FromSeconds(30), cancellationToken);
            }
        }
    }
}