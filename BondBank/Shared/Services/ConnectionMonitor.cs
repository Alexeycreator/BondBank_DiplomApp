using System.Diagnostics;
using System.Net;
using Microsoft.Extensions.Logging;
using Shared.BotHelpers;
using Shared.Config;
using Shared.Connection;

namespace Shared.Services;

/// <summary>
/// Предназначен для проверки соединения с ресурсом
/// </summary>
/// <param name="httpClient">Зависимость для создания своего объекта 'HttpClient'</param>
/// <param name="logger">Зависимость для логирования</param>
/// <param name="botService">Зависимость для объекта бота</param>
/// <param name="internetChecker">Зависимость для проверки интернет соединения</param>
public class ConnectionMonitor(
    HttpClient httpClient,
    ILogger<ConnectionMonitor> logger,
    BotService botService,
    InternetChecker internetChecker)
{
    private HttpStatusCode statusCode;
    private string responseHtml = string.Empty;
    private readonly TimeSpan delayMonitoring = TimeSpan.FromMinutes(10);
    private readonly TimeSpan delayMonitoringTry = TimeSpan.FromSeconds(30);

    /// <summary>
    /// Возвращает html контент
    /// </summary>
    /// <returns>Возвращает html контент (если он не заполнен, то вернется пустая строка)</returns>
    public string ResponseContent()
    {
        return responseHtml;
    }

    /// <summary>
    /// Предназначен для подключения к веб-ресурсу для парсинга данных
    /// </summary>
    /// <param name="urlWebService">'url' веб-ресурса биржи</param>
    /// <returns>'true' - если контент заполнен, 'false' - если не получилось сформировать контент или вылезло исключение</returns>
    /// <exception cref="ArgumentException">Исключение, если контент пустой</exception>
    /// <exception cref="HttpRequestException">Исключение, если не удалось подключиться к ресурсу</exception>
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

                responseHtml = content;
                return true;
            }

            statusCode = response.StatusCode;
            throw new HttpRequestException(
                $"Не удалось подключиться к {urlWebService}. StatusCode: {response.StatusCode}");
        }
        catch (HttpRequestException ex)
        {
            logger.LogWarning($"{ex.Message} - запуск мониторинга подключения");
            await botService.SendCommandToBotAsync(ConfigLoader.Instance.BotTelegram.IpAddress, ConfigLoader.Instance.BotTelegram.Port,
                BotCommand.Error, $"{ex.Message}");
            await StartMonitoringAsync(true, urlWebService);
            return false;
        }
        catch (ArgumentException ex)
        {
            logger.LogError(ex.Message);
            await botService.SendCommandToBotAsync(ConfigLoader.Instance.BotTelegram.IpAddress, ConfigLoader.Instance.BotTelegram.Port,
                BotCommand.Error, $"{ex.Message}");
            return false;
        }
        catch (Exception ex)
        {
            logger.LogError(ex.Message);
            await botService.SendCommandToBotAsync(ConfigLoader.Instance.BotTelegram.IpAddress, ConfigLoader.Instance.BotTelegram.Port,
                BotCommand.Error,
                $"Неизвестная ошибка: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Начало мониторинга повторных подключений к ресурсу
    /// </summary>
    /// <param name="connect">Состояние подключения, удалось ли вообще подключиться к ресурсу</param>
    /// <param name="urlWebService">'url' веб-ресурса</param>
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

    /// <summary>
    /// Проверяет количество итераций
    /// </summary>
    /// <param name="isConnected">Подключение есть или нет</param>
    /// <param name="checkCount">Номер попытки</param>
    /// <param name="maxChecks">Максимальное количество попыток</param>
    /// <returns>Возвращает состояние подключения</returns>
    private bool ShouldContinue(bool isConnected, int checkCount, int maxChecks)
    {
        return isConnected
            ? checkCount < maxChecks
            : !isConnected && checkCount < maxChecks;
    }

    /// <summary>
    /// Проверяет возможность подключения к веб-ресурсу
    /// </summary>
    /// <param name="url">'url' веб-ресурса</param>
    /// <returns>Возвращает true или false при попытке подключения</returns>
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
        await botService.SendCommandToBotAsync(ConfigLoader.Instance.BotTelegram.IpAddress, ConfigLoader.Instance.BotTelegram.Port,
            BotCommand.Info, $"Подключение восстановлено!");
        await ConnectionToDataAsync(urlWebService);
    }

    private async Task OnMaxAttemptsReachedAsync()
    {
        var processName = Process.GetCurrentProcess().ProcessName;
        logger.LogError($"Количество попыток равно максимуму. Парсер {processName} будет перезапущен");
        await botService.SendCommandToBotAsync(ConfigLoader.Instance.BotTelegram.IpAddress, ConfigLoader.Instance.BotTelegram.Port,
            BotCommand.Info,
            $"Количество попыток равно максимуму. " + Environment.NewLine + $"Парсер {processName} будет перезапущен.");
        await botService.SendCommandToBotAsync(ConfigLoader.Instance.BotTelegram.IpAddress, ConfigLoader.Instance.BotTelegram.Port,
            BotCommand.Restart, $"{processName}");
        Environment.Exit(0);
    }

    private async Task WaitBeforeNextAttemptAsync(bool connect, int checkCount)
    {
        var delay = connect ? delayMonitoring : delayMonitoringTry;
        var nextAttemptMsg =
            $"Нет подключения, следующая проверка через {delay.TotalSeconds} секунд... (попытка {checkCount + 1})";

        logger.LogWarning(nextAttemptMsg);
        await botService.SendCommandToBotAsync(ConfigLoader.Instance.BotTelegram.IpAddress, ConfigLoader.Instance.BotTelegram.Port,
            BotCommand.Info, $"{nextAttemptMsg}");
        await Task.Delay(delay);
    }
}