using System.Net.Sockets;
using System.Text;
using Microsoft.Extensions.Logging;
using Shared.Config;

namespace Shared.BotHelpers;

public sealed class BotService(ILogger<BotService> logger)
{
    public async Task SendCommandToBotAsync(string? botAddress, int botPort, Enum command, string message = "")
    {
        string fullCommand = $"{command}|{message}";
        logger.LogInformation($"Отправляю команду: {fullCommand}");

        try
        {
            using (var client = new TcpClient())
            {
                if (botAddress != null)
                {
                    await client.ConnectAsync(botAddress, botPort);
                    logger.LogInformation("Подключение к боту успешно");

                    using (var stream = client.GetStream())
                    {
                        byte[] data = Encoding.UTF8.GetBytes(fullCommand);
                        await stream.WriteAsync(data, 0, data.Length);
                        logger.LogInformation("Команда отправлена");
                        byte[] buffer = new byte[4096];

                        using (var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5)))
                        {
                            try
                            {
                                int bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length, cts.Token);
                                string response = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                                logger.LogInformation($"Ответ от бота: {response}");
                            }
                            catch (OperationCanceledException)
                            {
                                logger.LogWarning("Таймаут ожидания ответа");
                            }
                        }
                    }
                }
                else
                {
                    logger.LogWarning($"Адрес бота неверный или пустой: {botAddress}");
                }
            }
        }
        catch (SocketException ex)
        {
            logger.LogError($"Бот не запущен или недоступен: {ex.Message}");
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка: {ex.Message}");
        }
    }

    public async Task UsageTaskBotAsync(string processName)
    {
        await SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress, ConfigLoader.Instance.Bot.Port,
            BotCommand.ExecuteProgram, $"{processName}");
    }
}