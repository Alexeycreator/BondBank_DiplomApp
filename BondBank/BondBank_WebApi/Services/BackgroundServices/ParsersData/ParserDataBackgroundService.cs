using System.Text.RegularExpressions;
using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Services.DataBaseContext;

namespace BondBank_WebApi.Services.BackgroundServices.ParsersData;

public sealed class ParserDataBackgroundService(
    ILogger<ParserDataBackgroundService> logger,
    IServiceScopeFactory serviceScopeFactory) : BackgroundService
{
    private readonly string mainDirectoryBonds = Path.Combine(Directory.GetCurrentDirectory(), $"ImportBondsFiles");

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        logger.LogInformation($"Сервис фоновой обработки данных парсера запущен");
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                logger.LogInformation($"Проверка рабочего времени");
                var currentTime = DateTime.Now;
                if (currentTime.Hour is >= 8 and <= 17)
                {
                    logger.LogInformation($"Разрешено анализировать данные");
                    using var scope = serviceScopeFactory.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationContext>();
                    var processingData = scope.ServiceProvider.GetRequiredService<ProcessingData>();
                    var pushingInDataBase = scope.ServiceProvider.GetRequiredService<PushingInDataBase>();

                    var bondsLse = new List<LjubljanaStockExchangeBondsModel>();
                    var bondsMe = new List<MoscowExchangeBondsModel>();
                    var bondsSg = new List<SixGroupBondsModel>();
                    var bondsWb = new List<WienerBoerseBondsModel>();

                    string[] nameDirectory = Directory.GetDirectories(mainDirectoryBonds);
                    foreach (var dir in nameDirectory)
                    {
                        var filePath = processingData.ProcessingFile(dir);
                        logger.LogInformation($"Путь до файла получен" + Environment.NewLine +
                                              $"Анализирование данных...");
                        await UsingMethodProcessingBonds(filePath, processingData, pushingInDataBase, dbContext,
                            bondsLse, bondsMe, bondsSg, bondsWb);
                    }

                    await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
                }
                else
                {
                    var nextStart = new DateTime(currentTime.Year, currentTime.Month, currentTime.Day, 8, 0, 0);
                    if (currentTime.Hour >= 17)
                    {
                        nextStart = nextStart.AddDays(1);
                    }

                    var waitTime = nextStart - currentTime;
                    logger.LogWarning($"Ожидание рабочего времени, сейчас: {currentTime:HH:mm:ss}" +
                                      Environment.NewLine + $"Следующая попытка через {waitTime}");
                    await Task.Delay(waitTime, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"Неизвестная ошибка фонового процесса обработки данных парсера: {ex.Message}");
            }

            await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation($"Фоновый процесс обработки данных парсера остановлен");
        await base.StopAsync(cancellationToken);
    }

    private async Task UsingMethodProcessingBonds(string filePath, ProcessingData processingData,
        PushingInDataBase pushingInDataBase, ApplicationContext dbContext,
        List<LjubljanaStockExchangeBondsModel> bondsLse, List<MoscowExchangeBondsModel> bondsMe,
        List<SixGroupBondsModel> bondsSg, List<WienerBoerseBondsModel> bondsWb)
    {
        string fileName = Path.GetFileName(filePath);
        string typeBonds = Regex.Match(fileName, @"^[^_]+").Value.ToLower();
        switch (typeBonds)
        {
            case "lse":
                logger.LogInformation($"Анализирование данных LjubljanaStockExchange парсера");
                var resultLse = await processingData.GetLjubljanaStockExchangeBondsAsync(filePath);
                if (resultLse != null)
                {
                    bondsLse.AddRange(resultLse);
                    logger.LogInformation($"Данные успешно преобразованы");
                }
                logger.LogInformation($"Отправка данных в базу данных...");
                await pushingInDataBase.Push(dbContext, bondsLse);

                break;
            case "me":
                logger.LogInformation($"Анализирование данных MoscowExchangeBondsModel парсера");
                var resultMe = await processingData.GetMoscowExchangeBondsAsync(filePath);
                if (resultMe != null)
                {
                    bondsMe.AddRange(resultMe);
                    logger.LogInformation($"Данные успешно преобразованы");
                }
                logger.LogInformation($"Отправка данных в базу данных...");
                await pushingInDataBase.Push(dbContext, bondsMe);

                break;
            case "sg":
                logger.LogInformation($"Анализирование данных SixGroupBondsModel парсера");
                var resultSg = await processingData.GetSixGroupBondsAsync(filePath);
                if (resultSg != null)
                {
                    bondsSg.AddRange(resultSg);
                    logger.LogInformation($"Данные успешно преобразованы");
                }
                logger.LogInformation($"Отправка данных в базу данных...");
                await pushingInDataBase.Push(dbContext, bondsSg);

                break;
            case "wb":
                logger.LogInformation($"Анализирование данных WienerBoerseBondsModel парсера");
                var resultWb = await processingData.GetWienerBoerseBondsAsync(filePath);
                if (resultWb != null)
                {
                    bondsWb.AddRange(resultWb);
                    logger.LogInformation($"Данные успешно преобразованы");
                }
                logger.LogInformation($"Отправка данных в базу данных...");
                await pushingInDataBase.Push(dbContext, bondsWb);

                break;
            default:
                logger.LogWarning($"Данный тип облигаций не предусмотрен системой");
                break;
        }
    }
}