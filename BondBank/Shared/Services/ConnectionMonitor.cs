using System.Diagnostics;
using System.Net;
using Microsoft.Extensions.Logging;
using Shared.BotHelpers;
using Shared.Config;
using Shared.Connection;

namespace Shared.Services;

public class ConnectionMonitor(
    HttpClient httpClient,
    ILogger<ConnectionMonitor> logger,
    BotService botService,
    InternetChecker internetChecker)
{
    private HttpStatusCode statusCode;
    private string respBondsHtml = string.Empty;
    private readonly TimeSpan delayMonitoring = TimeSpan.FromMinutes(10);
    private readonly TimeSpan delayMonitoringTry = TimeSpan.FromSeconds(30);

    public string ResponseBondsContent()
    {
        return respBondsHtml;
    }

    public async Task<bool> ConnectionToDataAsync(string urlWebService)
    {
        bool hasInternet = internetChecker.CheckingInternetConnection();
        if (!hasInternet)
        {
            await StartMonitoringAsync(false, urlWebService);
            return false;
        }

        try
        {
            logger.LogInformation($"Подключение к данным по адресу: {urlWebService}");
            var requestMessage = new HttpRequestMessage(HttpMethod.Get, urlWebService);

            var response = await httpClient.SendAsync(requestMessage);

            if (response.IsSuccessStatusCode)
            {
                logger.LogInformation($"Подключение установлено. {response.StatusCode}");
                statusCode = HttpStatusCode.OK;

                var content = await response.Content.ReadAsStringAsync();

                if (string.IsNullOrEmpty(content))
                {
                    throw new ArgumentException($"HTML ответ не может быть пустым, {nameof(content)}");
                }

                respBondsHtml = content;
                return true;
            }

            statusCode = response.StatusCode;
            throw new HttpRequestException(
                $"Не удалось подключиться к {urlWebService}. StatusCode: {response.StatusCode}");
        }
        catch (HttpRequestException ex)
        {
            logger.LogWarning($"{ex.Message} - запуск мониторинга подключения");
            await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress, ConfigLoader.Instance.Bot.Port,
                BotCommand.Error, $"{ex.Message}");
            await StartMonitoringAsync(true, urlWebService);
            return false;
        }
        catch (ArgumentException ex)
        {
            logger.LogError(ex.Message);
            await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress, ConfigLoader.Instance.Bot.Port,
                BotCommand.Error, $"{ex.Message}");
            return false;
        }
        catch (Exception ex)
        {
            logger.LogError(ex.Message);
            await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress, ConfigLoader.Instance.Bot.Port,
                BotCommand.Error,
                $"Неизвестная ошибка: {ex.Message}");
            return false;
        }
    }

    private async Task StartMonitoringAsync(bool connect, string urlWebService)
    {
        const int MaxChecks = 10;
        int checkCount = 0;
        bool isConnected = connect;
        while (ShouldContinue(isConnected, checkCount, MaxChecks))
        {
            checkCount++;

            bool hasConnection = connect
                ? await CheckUrlConnectionAsync(urlWebService)
                : internetChecker.CheckingInternetConnection();

            if (hasConnection)
            {
                await OnConnectionRestoredAsync(urlWebService);
                return;
            }

            if (checkCount >= MaxChecks)
            {
                await OnMaxAttemptsReachedAsync();
                return;
            }

            await WaitBeforeNextAttemptAsync(connect, checkCount);
            isConnected = hasConnection;
        }
    }

    private bool ShouldContinue(bool isConnected, int checkCount, int maxChecks)
    {
        return isConnected
            ? checkCount < maxChecks
            : !isConnected && checkCount < maxChecks;
    }

    private async Task<bool> CheckUrlConnectionAsync(string url)
    {
        try
        {
            var response = await httpClient.GetAsync(url);
            statusCode = response.StatusCode;
            return response.IsSuccessStatusCode;
        }
        catch
        {
            statusCode = HttpStatusCode.ServiceUnavailable;
            return false;
        }
    }

    private async Task OnConnectionRestoredAsync(string urlWebService)
    {
        logger.LogInformation("Подключение восстановлено!");
        await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress, ConfigLoader.Instance.Bot.Port,
            BotCommand.Info, $"Подключение восстановлено!");
        await ConnectionToDataAsync(urlWebService);
    }

    private async Task OnMaxAttemptsReachedAsync()
    {
        var processName = Process.GetCurrentProcess().ProcessName;
        logger.LogError($"Количество попыток равно максимуму. Парсер {processName} будет перезапущен");
        await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress, ConfigLoader.Instance.Bot.Port,
            BotCommand.Info,
            $"Количество попыток равно максимуму. " + Environment.NewLine + $"Парсер {processName} будет перезапущен.");
        await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress, ConfigLoader.Instance.Bot.Port,
            BotCommand.Restart, $"{processName}");
        Environment.Exit(0);
    }

    private async Task WaitBeforeNextAttemptAsync(bool connect, int checkCount)
    {
        var delay = connect ? delayMonitoring : delayMonitoringTry;
        var nextAttemptMsg =
            $"Нет подключения, следующая проверка через {delay.TotalSeconds} секунд... (попытка {checkCount + 1})";

        logger.LogWarning(nextAttemptMsg);
        await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress, ConfigLoader.Instance.Bot.Port,
            BotCommand.Info, $"{nextAttemptMsg}");
        await Task.Delay(delay);
    }
}