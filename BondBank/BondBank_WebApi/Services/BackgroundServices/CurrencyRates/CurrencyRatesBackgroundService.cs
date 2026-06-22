using BondBank_WebApi.Services.DataBaseContext;
using Shared.BotHelpers;
using Shared.Config;
using Shared.Services;

namespace BondBank_WebApi.Services.BackgroundServices.CurrencyRates;

public sealed class CurrencyRatesBackgroundService(
    ILogger<CurrencyRatesBackgroundService> logger,
    ConnectionMonitor connectionMonitor,
    BotService botService,
    IServiceScopeFactory serviceScopeFactory) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        logger.LogInformation($"Сервис фоновой работы с курсами валют запущен");
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = serviceScopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationContext>();

                var currencyRatesParser = scope.ServiceProvider.GetRequiredService<CurrencyRatesParser>();
                var currencyRatesPushInDataBase =
                    scope.ServiceProvider.GetRequiredService<CurrencyRatesPushInDataBase>();

                await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress,
                    ConfigLoader.Instance.Bot.Port,
                    BotCommand.Error, $"Получение курсов валют за {DateTime.Now.ToShortDateString()}...");
                var currencyRates = await currencyRatesParser.GetCurrencyRatesAsync(connectionMonitor, botService);
                if (currencyRates != null && currencyRates.Any())
                {
                    await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress,
                        ConfigLoader.Instance.Bot.Port,
                        BotCommand.Error, $"Курсы валют успешно получены");
                    await currencyRatesPushInDataBase.PushingInDataBase(dbContext, currencyRates);
                }
                else
                {
                    logger.LogWarning($"Не удалось получить курсы валют");
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"Неизвестная ошибка в фоновом процессе получения курсов валют: {ex.Message}");
            }

            await Task.Delay(TimeSpan.FromHours(4), stoppingToken);
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation($"Сервис фоновой работы с курсами валют остановлен");
        await base.StopAsync(cancellationToken);
    }
}