using System.Net;
using System.Net.Sockets;
using Microsoft.Extensions.Logging;

namespace TelegramBot.Connection;

public sealed class TcpServer(
    ILogger<TcpServer> logger,
    CommandHandler commandHandler)
{
    public async Task StartAsync(int port, CancellationToken cancellationToken = default)
    {
        using var tcpListener = new TcpListener(IPAddress.Any, port);
        tcpListener.Start();
        logger.LogInformation("TCP сервер запущен на порту: {Port}. Ожидание команд...", port);

        while (!cancellationToken.IsCancellationRequested)
        {
            var client = await tcpListener.AcceptTcpClientAsync(cancellationToken);
            _ = HandleClientAsync(client, cancellationToken);
        }
    }

    private async Task HandleClientAsync(TcpClient client, CancellationToken cancellationToken)
    {
        using (client)
        await using (var stream = client.GetStream())
        {
            try
            {
                byte[] buffer = new byte[4096];
                int bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length, cancellationToken);
                string command = System.Text.Encoding.UTF8.GetString(buffer, 0, bytesRead);

                logger.LogInformation("Получена команда: {Command}", command);

                string? result = await commandHandler.HandleAsync(command, cancellationToken);

                byte[] response = System.Text.Encoding.UTF8.GetBytes(result ?? "Сообщения отправлены");
                await stream.WriteAsync(response, 0, response.Length, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Ошибка при обработке команды");
            }
        }
    }
}