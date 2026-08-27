using System.Net.Sockets;
using System.Text;
using Microsoft.Extensions.Logging;
using Shared.Config;

namespace Shared.BotHelpers;

/// <summary>
/// Отвечает за 'общение' с ботом в Telegram
/// </summary>
/// <param name="logger">Зависимость в классе, для использования логирования</param>
public sealed class BotService(ILogger<BotService> logger)
{
    /// <summary>
    /// Уведомляет бота о статусе работы
    /// </summary>
    /// <param name="botAddress">Ip-адрес бота</param>
    /// <param name="botPort">Port бота</param>
    /// <param name="command">Команда, которая отправляется боту (например: Info, Error и т.д.) Эти команды описаны в 'enum' классе BotCommand.cs</param>
    /// <param name="message">Сообщение от приложения о состоянии работы, которое бот отправит пользователю</param>
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

    /// <summary>
    /// Отвечает за уведомление о начале работы парсера
    /// </summary>
    /// <param name="processName">Название парсера, который был запущен</param>
    public async Task UsageTaskBotAsync(string processName)
    {
        await SendCommandToBotAsync(ConfigLoader.Instance.BotTelegram.IpAddress, ConfigLoader.Instance.BotTelegram.Port,
            BotCommand.ExecuteProgram, $"{processName}");
    }
}