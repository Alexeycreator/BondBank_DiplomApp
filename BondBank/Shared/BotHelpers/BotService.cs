using System.Net.Sockets;
using System.Text;
using Microsoft.Extensions.Logging;
using Shared.Config;

namespace Shared.BotHelpers;

/// <summary>
/// Отвечает за 'общение' с ботом в Telegram и Vk
/// </summary>
/// <param name="logger">Зависимость в классе, для использования логирования</param>
public sealed class BotService(ILogger<BotService> logger)
{
    /// <summary>
    /// Отвечает за уведомление о начале работы парсера
    /// </summary>
    /// <param name="processName">Название парсера, который был запущен</param>
    public async Task UsageTaskBotAsync(string processName)
    {
        await SendCommandToAllBotsAsync(BotCommand.ExecuteProgram, $"{processName}");
    }
    
    /// <summary>
    /// Данный метод взаимодействует со всеми ботами параллельно, отправляя им указания для работы
    /// </summary>
    /// <param name="command">Команда для бота</param>
    /// <param name="message">Сообщение для пользователя</param>
    public async Task SendCommandToAllBotsAsync(Enum command, string message = "")
    {
        var serviceConfig = ConfigLoader.Instance;
        var botTasks = new List<Task>();

        if (!string.IsNullOrEmpty(serviceConfig.BotVk.IpAddress) && serviceConfig.BotVk.Port > 0)
        {
            logger.LogInformation($"Отправляю сообщение боту в Telegram...");
            botTasks.Add(SafeSendAsync(serviceConfig.BotVk.IpAddress, serviceConfig.BotVk.Port, command,
                message));
        }

        if (!string.IsNullOrEmpty(serviceConfig.BotTelegram.IpAddress) && serviceConfig.BotTelegram.Port > 0)
        {
            logger.LogInformation($"Отправляю сообщение боту в Vk...");
            botTasks.Add(SafeSendAsync(serviceConfig.BotTelegram.IpAddress, serviceConfig.BotTelegram.Port,
                command, message));
        }

        await Task.WhenAll(botTasks);
    }

    /// <summary>
    /// Данный метод вспомогательный и служит для корректной параллельной работы потоков ботов
    /// </summary>
    /// <param name="botAddress">Ip адрес бота</param>
    /// <param name="botPort">Port бота</param>
    /// <param name="command">Команда бота</param>
    /// <param name="message">Сообщение для пользователя</param>
    private async Task SafeSendAsync(string? botAddress, int botPort, Enum command, string message)
    {
        try
        {
            await SendCommandToBotAsync(botAddress, botPort, command, message);
        }
        catch (ArgumentOutOfRangeException ex)
        {
            logger.LogError($"Port не может быть меньше или равен нулю! {ex.Message}");
        }
        catch (TaskCanceledException ex)
        {
            logger.LogWarning($"Задача была отменена принудительно: {ex.Message}");
        }
        catch (TimeoutException ex)
        {
            logger.LogWarning($"Превышен таймаут ожидания: {ex.Message}");
        }
        catch (InvalidOperationException ex)
        {
            logger.LogError($"Некорректное состояние при отправке: {ex.Message}");
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка: {ex.Message}");
        }
    }

    /// <summary>
    /// Уведомляет бота о статусе работы
    /// </summary>
    /// <param name="botAddress">Ip-адрес бота</param>
    /// <param name="botPort">Port бота</param>
    /// <param name="command">Команда, которая отправляется боту (например: Info, Error и т.д.) Эти команды описаны в 'enum' классе BotCommand.cs</param>
    /// <param name="message">Сообщение от приложения о состоянии работы, которое бот отправит пользователю</param>
    private async Task SendCommandToBotAsync(string? botAddress, int botPort, Enum command, string message = "")
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
}