using System.Net.NetworkInformation;

namespace Shared.Connection;

public sealed class InternetConnection
{
    public static bool CheckingInternetConnection()
    {
        try
        {
            using var ping = new Ping();
            var reply = ping.Send("8.8.8.8", 3000);
            return reply.Status == IPStatus.Success;
        }
        catch (Exception ex)
        {
            //loggerInternetConnection.Error($"{ex.Message}");
            return false;
        }
    }
}