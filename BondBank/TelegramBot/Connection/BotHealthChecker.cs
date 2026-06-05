using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace TelegramBot.Connection;

public sealed class BotHealthChecker(
    ILogger<BotHealthChecker> logger,
    HttpClient httpClient)
{
    private string? token;

    public void SetToken(string token) => this.token = token;

    public async Task<bool> IsBotActiveAsync(CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(token))
            return false;

        var url = $"https://api.telegram.org/bot{token}/getMe";

        try
        {
            using var httpResponse = await httpClient.GetAsync(url, cancellationToken);
            if (httpResponse.IsSuccessStatusCode)
            {
                var jsonResponse = await httpResponse.Content.ReadAsStringAsync(cancellationToken);
                if (!string.IsNullOrEmpty(jsonResponse))
                {
                    using JsonDocument doc = JsonDocument.Parse(jsonResponse);
                    return doc.RootElement.GetProperty("ok").GetBoolean();
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка при проверке статуса бота");
        }

        return false;
    }

    public async Task<string> GetStatusAsync(CancellationToken cancellationToken = default)
    {
        var isActive = await IsBotActiveAsync(cancellationToken);
        return $"Статус бота: {isActive}";
    }
}