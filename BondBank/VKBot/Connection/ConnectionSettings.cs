using Microsoft.Extensions.Logging;
using VKBot.Services;
using VkNet;
using Shared.Config;

namespace VKBot.Connection;

public sealed class ConnectionSettings(
    ILogger<ConnectionSettings> logger,
    BotHealthChecker healthChecker,
    VkApi vkApi,
    MethodsBot methodsBot,
    TcpServer tcpServer)
{
    private string AccessToken => Config.ConfigLoader.Instance.Bot.AccessToken;
    private long AdminId => Config.ConfigLoader.Instance.Bot.AdminId;
    private ulong GroupId => Config.ConfigLoader.Instance.Bot.GroupId;
    private int PortBot => ConfigLoader.Instance.BotVk.Port;

    public async Task StartAsync(CancellationToken cancellationToken = default)
    {
        SetConstructorBotHealthChecker(AccessToken, AdminId, GroupId);

        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                logger.LogInformation($"Проверка статуса активности бота...");
                bool isActiveBot = await healthChecker.IsBotActiveAsync(vkApi, cancellationToken);

                if (isActiveBot)
                {
                    SetConstructorMethodsBot(GroupId);
                    _ = Task.Run(methodsBot.RunAsync, cancellationToken);
                    await tcpServer.StartAsync(PortBot, cancellationToken);
                }
                else
                {
                    logger.LogWarning("Сервер недоступен или бот неактивен. Повторная попытка через 10 минут...");
                    await Task.Delay(TimeSpan.FromMinutes(10), cancellationToken);
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"Неизвестная ошибка в месте запуска бота: {ex.Message}");
                await Task.Delay(TimeSpan.FromMinutes(30), cancellationToken);
            }
        }
    }

    private void SetConstructorBotHealthChecker(string accessToken, long adminId, ulong groupId)
    {
        healthChecker.SetAccessToken(accessToken);
        healthChecker.SetAdminId(adminId);
        healthChecker.SetGroupId(groupId);
    }

    private void SetConstructorMethodsBot(ulong groupId)
    {
        methodsBot.SetGroupId(groupId);
    }
}