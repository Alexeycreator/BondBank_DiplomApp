using System.Text.RegularExpressions;
using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Services.DataBaseContext;

namespace BondBank_WebApi.Services.BackgroundServices.ParsersData;

/// <summary>
/// Для анализирования данных парсеров
/// </summary>
/// <param name="logger">Зависимость для логирования</param>
/// <param name="serviceScopeFactory">Зависимость для создания scope объектов</param>
public sealed class ParserDataBackgroundService(
    ILogger<ParserDataBackgroundService> logger,
    IServiceScopeFactory serviceScopeFactory) : BackgroundService
{
    private readonly string mainDirectoryBonds = Path.Combine(Directory.GetCurrentDirectory(), $"ImportBondsFiles");
    private DateOnly GetDate => DateOnly.FromDateTime(DateTime.UtcNow);
    private readonly string directoryCurrencyRates = Path.Combine(Directory.GetCurrentDirectory(), $"CurrencyRates");

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // проверяем есть ли файл за сегодня с курсами валют и заполнен ли он
        if (!await CheckingCompletedParsingCurrencyRates(stoppingToken))
        {
            logger.LogWarning("Не удалось получить курсы валют. Фоновый процесс не запущен.");
            return;
        }

        // если такой файл существует - начинаем анализирование данных
        logger.LogInformation($"Сервис фоновой обработки данных парсера запущен");
        HashSet<string> processedFiles = new HashSet<string>();
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                logger.LogInformation($"Проверка рабочего времени");
                var currentTime = DateTime.Now;

                // проверяем рабочие часы
                if (currentTime.Hour is >= 8 and <= 17)
                {
                    logger.LogInformation($"Разрешено анализировать данные");

                    // создаем scope объекты, чтобы не нагружать систему
                    using var scope = serviceScopeFactory.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationContext>();
                    var processingData = scope.ServiceProvider.GetRequiredService<ProcessingData>();
                    var pushingInDataBase = scope.ServiceProvider.GetRequiredService<PushingInDataBase>();

                    // создаем свою коллекцию бондов
                    var bondsLse = new List<LjubljanaStockExchangeBondsModel>();
                    var bondsMe = new List<MoscowExchangeBondsModel>();
                    var bondsSg = new List<SixGroupBondsModel>();
                    var bondsWb = new List<WienerBoerseBondsModel>();

                    string[] nameDirectory = Directory.GetDirectories(mainDirectoryBonds);
                    foreach (var dir in nameDirectory)
                    {
                        // получаем путь к файлу
                        var filePath = processingData.ProcessingFile(dir);
                        logger.LogInformation($"Путь до файла {filePath} получен" + Environment.NewLine +
                                              $"Анализирование данных...");
                        
                        // проверяем обрабатывался ли файл раньше
                        if (processedFiles.Add(filePath))
                        {
                            // проверяем какой парсер вернул данные
                            await UsingMethodProcessingBonds(filePath, processingData, pushingInDataBase, dbContext,
                                bondsLse, bondsMe, bondsSg, bondsWb);
                        }
                        else
                        {
                            continue;
                        }
                    }

                    await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
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
                    logger.LogWarning($"Ожидание рабочего времени, сейчас: {currentTime:HH:mm:ss}" +
                                      Environment.NewLine + $"Следующая попытка через {waitTime}");
                    await Task.Delay(waitTime, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"Неизвестная ошибка фонового процесса обработки данных парсера: {ex.Message}");
            }

            var nextIteration = TimeSpan.FromMinutes(10);
            logger.LogInformation($"Следующая итерация через {nextIteration.Minutes} минут");
            await Task.Delay(nextIteration, stoppingToken);
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

    private async Task<bool> CheckingCompletedParsingCurrencyRates(CancellationToken cancellationToken = default)
    {
        // делаем задержку в 10 секунд для корректного запуска процесса
        await Task.Delay(TimeSpan.FromSeconds(10), cancellationToken);
        const int maxAttempts = 6;
        var nextTry = TimeSpan.FromMinutes(30);

        for (int attempt = 0; attempt < maxAttempts; attempt++)
        {
            try
            {
                if (!Directory.Exists(directoryCurrencyRates))
                {
                    logger.LogWarning(
                        $"Каталог {directoryCurrencyRates} не существует. Попытка {attempt + 1}/{maxAttempts}");
                    await Task.Delay(nextTry, cancellationToken);
                    continue;
                }

                var files = Directory.GetFiles(directoryCurrencyRates);
                if (files.Length == 0)
                {
                    logger.LogWarning(
                        $"В каталоге {directoryCurrencyRates} нет файлов. Попытка {attempt + 1}/{maxAttempts}");
                    await Task.Delay(nextTry, cancellationToken);
                    continue;
                }

                string filePath = files.Last();
                if (!File.Exists(filePath))
                {
                    logger.LogWarning($"Файл {filePath} не найден. Попытка {attempt + 1}/{maxAttempts}");
                    await Task.Delay(nextTry, cancellationToken);
                    continue;
                }

                string fileName = Path.GetFileName(filePath);
                if (IsFileToday(fileName))
                {
                    // создаем объект FileStream, чтобы считать данные и если у нас записан хотя бы 1 байт, то true, иначе false
                    await using var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                    if (stream.ReadByte() != -1)
                    {
                        logger.LogInformation($"Курсы валют за сегодняшнюю дату ({fileName}). Продолжаем процесс.");
                        return true;
                    }

                    logger.LogWarning($"Файл за сегодняшнюю дату есть ({fileName}), но в нем нет данных");
                    return false;
                }

                logger.LogWarning($"Файл {fileName} не за сегодняшнюю дату. Попытка {attempt + 1}/{maxAttempts}");
                await Task.Delay(nextTry, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Ошибка при проверке файла курсов валют. Попытка {attempt + 1}/{maxAttempts}");
                await Task.Delay(nextTry, cancellationToken);
            }
        }

        logger.LogError($"Не удалось дождаться файла с курсами валют за сегодня после {maxAttempts} попыток");
        return false;
    }

    private bool IsFileToday(string fileName)
    {
        var datePart = fileName.Split('_')[1].Split('.')[0];
        if (!DateOnly.TryParse(datePart, out var fileDate))
        {
            logger.LogWarning($"Не получилось считать дату из названия файла {fileName}");
            return false;
        }

        return fileDate == GetDate;
    }
}