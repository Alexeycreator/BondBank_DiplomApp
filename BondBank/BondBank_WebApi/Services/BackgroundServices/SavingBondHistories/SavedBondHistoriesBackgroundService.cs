using BondBank_WebApi.Services.DataBaseContext;

namespace BondBank_WebApi.Services.BackgroundServices.SavingBondHistories;

public sealed class SavedBondHistoriesBackgroundService(
    ILogger<SavedBondHistoriesBackgroundService> logger,
    IServiceScopeFactory serviceScopeFactory) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // ждем 30 минут, чтобы данные поступили в БД
        await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);

        logger.LogInformation($"Запуск фоновой работы сохранения данных бондов...");
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = serviceScopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationContext>();
                var bondHistories = scope.ServiceProvider.GetRequiredService<BondHistoriesService>();
                var bondData = scope.ServiceProvider.GetRequiredService<BondDataVerification>();

                await bondData.CheckingBondsData(dbContext, bondHistories, stoppingToken);
                logger.LogInformation($"Пауза между итерациями 10 минут");
                await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError($"Неизвестная ошибка: {ex.Message}");
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation($"Фоновый процесс обработки данных парсера остановлен");
        await base.StopAsync(cancellationToken);
    }
}