using BondBank_WebApi.HelperMethods;
using BondBank_WebApi.Services.DataBaseContext;
using Shared.BotHelpers;
using Shared.Config;
using Shared.Services;
using Shared.WorkingWithFiles;

namespace BondBank_WebApi.Services.BackgroundServices.CurrencyRates;

/// <summary>
/// Для получения курсов валют
/// </summary>
/// <param name="logger">Зависимость для логирования</param>
/// <param name="connectionMonitor">Зависимость для проверки подключения к веб-ресурсу</param>
/// <param name="botService">Зависимость для взаимодействия с ботом</param>
/// <param name="serviceScopeFactory">Зависимость для создания scope объектов</param>
/// <param name="csvHelper">Зависимость для записи данных в файл</param>
/// <param name="csvServiceDll">Зависимость для возможности работы с файлами из библиотеки Shared.dll</param>
public sealed class CurrencyRatesBackgroundService(
    ILogger<CurrencyRatesBackgroundService> logger,
    ConnectionMonitor connectionMonitor,
    BotService botService,
    IServiceScopeFactory serviceScopeFactory,
    CsvHelper csvHelper,
    CsvService csvServiceDll) : BackgroundService
{
    private static readonly string dirPath = Path.Combine(Directory.GetCurrentDirectory(), "CurrencyRates");
    private string FileName => $"Rates_{csvServiceDll.GetDate()}.csv";

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // ждем 5 секунд с начала запуска сервера (чтобы дать время запуститься самому проекту и потом запускаем фоновый процесс)
        await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        logger.LogInformation($"Сервис фоновой работы с курсами валют запущен");
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var currentTime = DateTime.Now;
                
                // проверяем рабочие часы
                if (currentTime.Hour is >= 8 and <= 17)
                {
                    // создаем scope объекты, чтобы не нагружать систему
                    using var scope = serviceScopeFactory.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationContext>();

                    var currencyRatesParser = scope.ServiceProvider.GetRequiredService<CurrencyRatesParser>();
                    var currencyRatesPushInDataBase =
                        scope.ServiceProvider.GetRequiredService<CurrencyRatesPushInDataBase>();

                    await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress,
                        ConfigLoader.Instance.Bot.Port,
                        BotCommand.Info, $"Получение курсов валют за {DateTime.Now.ToShortDateString()}...");
                    var currencyRates = await currencyRatesParser.GetCurrencyRatesAsync(connectionMonitor, botService);
                    if (currencyRates != null && currencyRates.Any())
                    {
                        await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress,
                            ConfigLoader.Instance.Bot.Port,
                            BotCommand.Info, $"Курсы валют успешно получены");
                        await currencyRatesPushInDataBase.PushingInDataBase(dbContext, currencyRates);
                        csvHelper.WhiteInFileCsv(dirPath, FileName, currencyRates);
                    }
                    else
                    {
                        logger.LogWarning($"Не удалось получить курсы валют");
                    }

                    await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
                }
                else
                {
                    // вне рабочего времени ждем рабочие часы
                    var nextStart = new DateTime(currentTime.Year, currentTime.Month, currentTime.Day, 8, 0, 0);
                    if (currentTime.Hour >= 17)
                    {
                        nextStart = nextStart.AddDays(1);
                    }

                    var waitTime = nextStart - currentTime;
                    logger.LogInformation($"Ожидание рабочего времени, сейчас: {currentTime:HH:mm:ss}" +
                                          Environment.NewLine + $"Следующая попытка через {waitTime}");
                    await Task.Delay(waitTime, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"Неизвестная ошибка в фоновом процессе получения курсов валют: {ex.Message}");
            }

            await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation($"Сервис фоновой работы с курсами валют остановлен");
        await base.StopAsync(cancellationToken);
    }
}