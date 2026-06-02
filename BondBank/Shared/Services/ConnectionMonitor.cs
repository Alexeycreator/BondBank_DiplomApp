using System.Diagnostics;
using System.Net;
using Shared.Connection;

namespace Shared.Services;

public class ConnectionMonitor
{
    private static HttpStatusCode statusCode;
    public string respBonds;
    private HttpClient httpClient;

    public ConnectionMonitor(HttpClient httpClient)
    {
        this.httpClient = httpClient;
    }

    public bool ConnectionToData(string urlWebService)
    {
        bool connect = InternetChecker.CheckingInternetConnection();
        try
        {
            if (connect)
            {
                //loggerBondsParser.Info($"Подключение к данным по адресу: {urlSixGroup}");
                HttpRequestMessage requestMessage = new HttpRequestMessage(HttpMethod.Get, urlWebService);
                var resultBonds = httpClient.SendAsync(requestMessage).Result;
                if (resultBonds.IsSuccessStatusCode)
                {
                    //loggerBondsParser.Info($"Подключение установлено. {resultBonds.StatusCode}");
                    statusCode = HttpStatusCode.OK;
                    var resp = resultBonds.Content.ReadAsStringAsync().Result;
                    if (!string.IsNullOrEmpty(resp))
                    {
                        respBonds = resp;
                        return true;
                    }
                    else
                    {
                        // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Info,
                        //     $"HTML ответ не может быть пустым, {nameof(resp)}");
                        throw new ArgumentException($"HTML ответ не может быть пустым, {nameof(resp)}");
                    }
                }
                else
                {
                    statusCode = resultBonds.StatusCode;
                    throw new HttpRequestException(
                        $"Не получилось подключиться к сайту {urlWebService}. StatusCode: {resultBonds.StatusCode}");
                }
            }
            else
            {
                StartMonitoring(connect, urlWebService);
            }
        }
        catch (AggregateException ex)
        {
            // loggerBondsParser.Error($"{ex.Message}. Проверьте строку подключения: {urlSixGroup}");
            // _ = workBot.SendCommandToBotAsync(
            //     botAddress, botPort, BotCommandsType.Info,
            //     $"{ex.Message}. Проверьте строку подключения: {urlSixGroup}" + Environment.NewLine +
            //     $"Попробуйте связаться с тех. поддержкой" + Environment.NewLine +
            //     $"Парсер {Process.GetCurrentProcess().ProcessName} будет закрыт");
            // Environment.Exit(0);
        }
        catch (ArgumentException ex)
        {
            // loggerBondsParser.Error($"{ex.Message}");
            // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Info, $"{ex.Message}");
        }
        catch (HttpRequestException ex)
        {
            // loggerBondsParser.Warn($"{ex.Message} - запуск мониторинга подключения");
            // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Info,
            //     $"{ex.Message} - запуск мониторинга подключения");
            // MonitoringThread(connect);
        }
        catch (Exception ex)
        {
            // loggerBondsParser.Error($"{ex.Message}");
            // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Info, $"{ex.Message}");
        }

        return false;
    }

    public void StartMonitoring(bool connect, string urlWebService)
    {
        Task.Run(() =>
        {
            bool isConnected = connect;
            int checkCount = 0;
            const int maxChecks = 10;

            switch (connect)
            {
                case true:
                    while (checkCount < maxChecks)
                    {
                        //loggerBondsParser.Info($"Проверка подключения #{checkCount + 1} в {DateTime.Now.TimeOfDay}");
                        if (checkCount == maxChecks - 1)
                        {
                            // loggerBondsParser.Error($"Количество попыток равно максимуму");
                            // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Info,
                            //     $"Количество попыток равно максимуму" + Environment.NewLine +
                            //     $"Парсер {Process.GetCurrentProcess().ProcessName} будет перезапущен");
                            // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Restart,
                            //     $"{Process.GetCurrentProcess().ProcessName}");
                            Environment.Exit(0);
                            break;
                        }
                        else
                        {
                            // loggerBondsParser.Warn($"Задержка в {_tsDelayMonitoring} минут");
                            // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Info,
                            //     $"Задержка в {_tsDelayMonitoring} минут");
                            // Task.Delay(_tsDelayMonitoring);
                        }

                        if (statusCode == HttpStatusCode.OK)
                        {
                            // loggerBondsParser.Info($"Подключение восстановлено!");
                            // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Info,
                            //     $"Подключение восстановлено!");
                            ConnectionToData(urlWebService);
                        }
                        else
                        {
                            // loggerBondsParser.Warn(
                            //     $"Нет подключения, следующая проверка через {_tsDelayMonitoringTry} секунд...");
                            // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Info,
                            //     $"Нет подключения, следующая проверка через {_tsDelayMonitoringTry} секунд...");
                            // Task.Delay(_tsDelayMonitoringTry);
                            checkCount++;
                        }
                    }

                    if (statusCode != HttpStatusCode.OK)
                    {
                        // loggerBondsParser.Error($"Подключение не восстановлено после всех попыток");
                        // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Info,
                        //     $"Подключение не восстановлено после всех попыток" + Environment.NewLine +
                        //     $"Парсер {Process.GetCurrentProcess().ProcessName} будет перезапущен");
                        // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Restart,
                        //     $"{Process.GetCurrentProcess().ProcessName}");
                        Environment.Exit(0);
                    }

                    break;
                case false:
                    while (!isConnected && checkCount < maxChecks)
                    {
                        // loggerBondsParser.Info($"Проверка подключения #{checkCount + 1} в {DateTime.Now.TimeOfDay}");
                        // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Info,
                        //     $"Проверка подключения #{checkCount + 1} в {DateTime.Now.TimeOfDay}");
                        if (checkCount == maxChecks - 1)
                        {
                            // loggerBondsParser.Error($"Количество попыток равно максимуму");
                            // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Info,
                            //     $"Количество попыток равно максимуму" + Environment.NewLine +
                            //     $"Парсер {Process.GetCurrentProcess().ProcessName} будет перезапущен");
                            // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Restart,
                            //     $"{Process.GetCurrentProcess().ProcessName}");
                            Environment.Exit(0);
                            break;
                        }
                        else
                        {
                            // loggerBondsParser.Warn($"Задержка потока в {_tsDelayMonitoring} минут");
                            // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Info,
                            //     $"Задержка потока в {_tsDelayMonitoring} минут");
                            // Task.Delay(_tsDelayMonitoring);
                        }

                        isConnected = InternetChecker.CheckingInternetConnection();
                        if (isConnected)
                        {
                            // loggerBondsParser.Info($"Подключение восстановлено!");
                            // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Info,
                            //     $"Подключение восстановлено!");
                            ConnectionToData(urlWebService);
                        }
                        else
                        {
                            // loggerBondsParser.Warn(
                            //     $"Нет подключения, следующая проверка через {_tsDelayMonitoringTry} секунд...");
                            // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Info,
                            //     $"Нет подключения, следующая проверка через {_tsDelayMonitoringTry} секунд...");
                            // Task.Delay(_tsDelayMonitoringTry);
                            checkCount++;
                        }
                    }

                    if (statusCode != HttpStatusCode.OK)
                    {
                        // loggerBondsParser.Error($"Подключение не восстановлено после всех попыток");
                        // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Info,
                        //     $"Подключение не восстановлено после всех попыток" + Environment.NewLine +
                        //     $"Парсер {Process.GetCurrentProcess().ProcessName} будет перезапущен");
                        // _ = workBot.SendCommandToBotAsync(botAddress, botPort, BotCommandsType.Restart,
                        //     $"{Process.GetCurrentProcess().ProcessName}");
                        Environment.Exit(0);
                    }

                    break;
            }
        });
    }
}