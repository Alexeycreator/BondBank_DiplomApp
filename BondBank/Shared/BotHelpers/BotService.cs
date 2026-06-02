using System.Diagnostics;
using System.Net.Sockets;
using System.Text;

namespace Shared.BotHelpers;

public sealed class BotWorker
{
    private const string BotAddress = "127.0.0.1";
    private const int BotPort = 8888;

    public async Task SendCommandToBotAsync(string? botAddress, int botPort, Enum command, string parameters = "")
    {
        string fullCommand = $"{command}|{parameters}";
        //loggerWorkingWithBot.Info($"Отправляю команду: {fullCommand}");

        try
        {
            using (var client = new TcpClient())
            {
                if (botAddress != null)
                {
                    await client.ConnectAsync(botAddress, botPort);
                    //loggerWorkingWithBot.Info("Подключение к боту успешно");

                    using (var stream = client.GetStream())
                    {
                        byte[] data = Encoding.UTF8.GetBytes(fullCommand);
                        await stream.WriteAsync(data, 0, data.Length);
                        //loggerWorkingWithBot.Info("Команда отправлена");
                        byte[] buffer = new byte[4096];

                        using (var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5)))
                        {
                            try
                            {
                                int bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length, cts.Token);
                                string response = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                                //loggerWorkingWithBot.Info($"Ответ от бота: {response}");
                            }
                            catch (OperationCanceledException)
                            {
                                //loggerWorkingWithBot.Warn("Таймаут ожидания ответа");
                            }
                        }
                    }
                }
                else
                {
                    //loggerWorkingWithBot.Warn($"Адрес бота неверный или пустой: {botAddress}");
                }
            }
        }
        catch (SocketException ex)
        {
            //loggerWorkingWithBot.Error($"Бот не запущен или недоступен: {ex.Message}");
        }
        catch (Exception ex)
        {
            //loggerWorkingWithBot.Error($"{ex.Message}");
        }
    }

    public async Task UsageTaskBotAsync()
    {
        await SendCommandToBotAsync(BotAddress, BotPort, BotCommand.ExecuteProgram,
            $"{Process.GetCurrentProcess().ProcessName}");
    }
}