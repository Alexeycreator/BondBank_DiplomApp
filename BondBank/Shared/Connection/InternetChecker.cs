using System.Net.NetworkInformation;
using Microsoft.Extensions.Logging;

namespace Shared.Connection;

/// <summary>
/// Предназначен для проверки интернет соединения
/// </summary>
/// <param name="logger">Зависимость в классе, для использования логирования</param>
public sealed class InternetChecker(ILogger<InternetChecker> logger)
{
    public bool CheckingInternetConnection()
    {
        try
        {
            using var ping = new Ping();
            var reply = ping.Send("8.8.8.8", 3000);
            return reply.Status == IPStatus.Success;
        }
        catch (Exception ex)
        {
            logger.LogError("{ExMessage}", ex.Message);
            return false;
        }
    }
}