using System.Diagnostics;
using Microsoft.Extensions.Logging;
using MoscowExchangeParser.HelperMethods;
using MoscowExchangeParser.Models;
using Newtonsoft.Json;
using Shared.BotHelpers;
using Shared.Services;
using Shared.Services.Interfaces;
using Shared.Services.MinIO;
using Shared.WorkingWithFiles;

namespace MoscowExchangeParser;

/// <summary>
/// Предназначен для получения бондов
/// </summary>
/// <param name="logger">Зависимость для логирования</param>
/// <param name="httpClient">Зависимость для нового объекта HttpClient</param>
/// <param name="connectionMonitor">Зависимость для проверки подключения к веб-ресурсу биржи</param>
/// <param name="botService">Зависимость для взаимодействия с ботом</param>
/// <param name="csvServiceDll">Зависимость для отправки сформированного файла на сервер</param>
/// <param name="csvHelper">Зависимость для сохранения бондов в csv файл и отправки на сервер</param>
public sealed class BondParser(
    ILogger<BondParser> logger,
    HttpClient httpClient,
    ConnectionMonitor connectionMonitor,
    BotService botService,
    CsvService csvServiceDll,
    CsvHelper csvHelper,
    MinioStorageService minioService) : IBondProvider<Bond>
{
    private readonly string urlMoscowExchange = $"https://www.moex.com/";
    private List<Bond> bonds = new();
    private static readonly string DirPath = Path.Combine(Directory.GetCurrentDirectory(), "Bonds");

    // массив всех json файлов с бондами
    private readonly string[] urlGettingBonds =
    [
        $@"https://iss.moex.com/iss/emitters/484/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/269/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/3588/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/711/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/10763/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/770/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/1074/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/9848/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/739/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/10712/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/1399/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/15523/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/12604/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/1158/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/886/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/651/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/10761/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/1242/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/6291/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/15750/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/1264/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/716/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/4330/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru",
        $@"https://iss.moex.com/iss/emitters/3455/securities.jsonp?iss.meta=off&iss.json=extended&callback=JSON_CALLBACK&lang=ru"
    ];

    private string FileName => $"me_bonds_{csvServiceDll.GetDate()}.csv";

    /// <summary>
    /// Получение бондов
    /// </summary>
    /// <returns>Возвращает бонды (сформированные или null)</returns>
    public async Task<List<Bond>> GetBondsAsync()
    {
        try
        {
            await botService.UsageTaskBotAsync(Process.GetCurrentProcess().ProcessName);
            if (await connectionMonitor.ConnectionToDataAsync(urlMoscowExchange))
            {
                await FillingBondsAsync();
            }

            await csvHelper.SendFileOnWebServer(DirPath, FileName);
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка: {ExMessage}", ex.Message);
            await botService.SendCommandToAllBotsAsync(BotCommand.Error, $"Неизвестная ошибка: {ex.Message}");
        }

        return bonds;
    }

    /// <summary>
    /// Заполнение бондов
    /// </summary>
    /// <returns>Возвращает бонды</returns>
    /// <exception cref="HttpRequestException">Исключение, если не удалось получить json файл по указанному адресу</exception>
    public async Task<List<Bond>> FillingBondsAsync()
    {
        try
        {
            logger.LogInformation($"Запущен процесс получения облигаций");
            int countDataBonds = 0;
            int totalBonds = 0;
            foreach (var urlBonds in urlGettingBonds)
            {
                logger.LogInformation("Подключение к данным по адресу: {UrlBonds}", urlBonds);
                var response = await httpClient.GetStringAsync(urlBonds);
                if (string.IsNullOrEmpty(response))
                {
                    throw new HttpRequestException($"Json файл не получен по адресу {urlBonds}.");
                }

                logger.LogInformation($"Подключение прошло успешно.");
                if (response.StartsWith("JSON_CALLBACK(") && response.EndsWith(")"))
                {
                    response = response.Substring("JSON_CALLBACK(".Length,
                        response.Length - "JSON_CALLBACK(".Length - 1);
                }

                logger.LogInformation("Извлечение данных");
                var jsonArrayBonds = JsonConvert.DeserializeObject<List<object>>(response);
                if (jsonArrayBonds != null)
                {
                    logger.LogInformation("Данные получены");
                    var securitiesDataBonds = jsonArrayBonds[1].ToString();
                    if (securitiesDataBonds != null)
                    {
                        logger.LogInformation("Корректные данные для считывания");
                        var securitiesBonds = JsonConvert.DeserializeObject<BondModel>(securitiesDataBonds);
                        if (securitiesBonds != null)
                        {
                            logger.LogInformation("Успешная десериализация данных");
                            var currentBond = securitiesBonds.StateBonds.Select(b => new Bond
                            {
                                SecurityType = b.SecurityType,
                                SecurityTypeId = b.SecurityTypeId,
                                Type = b.Type,
                                SecId = b.SecId,
                                ShortName = b.ShortName,
                                Name = b.Name,
                                RegNumber = b.RegNumber,
                                IsTraded = b.IsTraded,
                                PrimaryBoardId = b.PrimaryBoardId,
                                Market = b.Market,
                                Engine = b.Engine,
                                FaceValue = b.FaceValue,
                                FaceUnit = b.FaceUnit,
                                Isin = b.Isin,
                                UpdatedAt = DateTime.Now
                            }).ToList();
                            var totalSecuritiesBonds = securitiesBonds.SecuritiesCursorBonds[0].Total;
                            var filteredBonds = currentBond.Where(b => b.SecurityType == "Биржевая облигация").ToList();
                            bonds.AddRange(filteredBonds);
                            logger.LogInformation(
                                "Добавлено {FilteredBondsCount} биржевых облигаций из {TotalSecuritiesBonds} других облигаций", filteredBonds.Count, totalSecuritiesBonds);
                            countDataBonds = bonds.Count;
                            totalBonds += Convert.ToInt32(totalSecuritiesBonds);
                        }
                        else
                        {
                            logger.LogError("Данные {SecuritiesBonds} не удалось десериализовать", securitiesBonds);
                            await botService.SendCommandToAllBotsAsync(BotCommand.Error,
                                $"Данные {securitiesBonds} не удалось десериализовать");
                        }
                    }
                    else
                    {
                        logger.LogError("Выбраны неверные данные json-файла. {SecuritiesDataBonds}", securitiesDataBonds);
                        await botService.SendCommandToAllBotsAsync(BotCommand.Error,
                            $"Выбраны неверные данные json-файла. {securitiesDataBonds}");
                    }
                }
                else
                {
                    logger.LogError("Данные пустые: {JsonArrayBonds}", jsonArrayBonds);
                    await botService.SendCommandToAllBotsAsync(BotCommand.Error,
                        $"Данные пустые: {jsonArrayBonds}");
                }
            }

            logger.LogInformation(
                "Все данные успешно считаны. {CountDataBonds} биржевых облигаций из {TotalBonds} разных типов облигаций", countDataBonds, totalBonds);
            await botService.SendCommandToAllBotsAsync(BotCommand.ExecuteTask,
                $"Данные парсера {Process.GetCurrentProcess().ProcessName} получены. Количество биржевых облигаций: {bonds.Count}" +
                Environment.NewLine + $"Дата получения: {csvServiceDll.GetDate()}");
            logger.LogInformation($"Запись данных в файл");
            csvHelper.WhiteInFileCsv(DirPath, FileName, bonds);
            await SendToMinIo(DirPath, FileName, "text/csv", "bonds/me", logger);
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка: {ExMessage}", ex.Message);
            await botService.SendCommandToAllBotsAsync(BotCommand.Error,
                $"Неизвестная ошибка: {ex.Message}");
        }

        return bonds;
    }

    private async Task SendToMinIo(string fullLocalPath, string fileName, string contentType, string folderPath,
        ILogger log)
    {
        var fullPath = Path.Combine(fullLocalPath, fileName);
        bool success = await minioService.TryUploadFileFromPathAsync(
            fullLocalPath: fullPath,
            fileName: fileName,
            contentType: contentType,
            folderPath: folderPath,
            logger: logger
        );
    }
}