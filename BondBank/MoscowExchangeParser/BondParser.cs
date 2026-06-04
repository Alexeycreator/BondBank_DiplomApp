using System.Diagnostics;
using Microsoft.Extensions.Logging;
using MoscowExchangeParser.Models;
using MoscowExchangeParser.WorkingWithFiles;
using Newtonsoft.Json;
using NLog.Extensions.Logging;
using Shared.BotHelpers;
using Shared.Config;
using Shared.Services;
using Shared.Services.Interfaces;
using Shared.WorkingWithFiles;

namespace MoscowExchangeParser;

public sealed class BondParser(
    ILogger<BondParser> logger,
    HttpClient httpClient,
    ConnectionMonitor connectionMonitor,
    BotService botService) : IBondProvider<Bond>
{
    private readonly string urlMoscowExchange = $"https://www.moex.com/";
    private List<Bond> bonds = new List<Bond>();
    private static readonly string dirPath = Path.Combine(Directory.GetCurrentDirectory(), "Bonds");
    private CsvService csvServiceDll;
    private CsvWriter csvWriter = new CsvWriter();

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

    public async Task<List<Bond>> GetBonds()
    {
        try
        {
            await botService.UsageTaskBotAsync(Process.GetCurrentProcess().ProcessName);
            if (await connectionMonitor.ConnectionToDataAsync(urlMoscowExchange))
            {
                await FillingBonds();
            }
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка: {ex.Message}");
            await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress, ConfigLoader.Instance.Bot.Port,
                BotCommand.Error, $"Неизвестная ошибка: {ex.Message}");
        }

        return bonds;
    }

    public async Task<List<Bond>> FillingBonds()
    {
        try
        {
            logger.LogInformation($"Запущен процесс получения облигаций");
            int countDataBonds = 0;
            int totalBonds = 0;
            foreach (var urlBonds in urlGettingBonds)
            {
                logger.LogInformation($"Подключение к данным по адресу: {urlBonds}");
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
                                Currency = "RUB",
                                UpdatedAt = DateTime.Now
                            }).ToList();
                            var totalSecuritiesBonds = securitiesBonds.SecuritiesCursorBonds[0].Total;
                            var filteredBonds = currentBond.Where(
                                b => b.SecurityType == "Биржевая облигация").ToList();
                            bonds.AddRange(filteredBonds);
                            logger.LogInformation(
                                $"Добавлено {filteredBonds.Count} биржевых облигаций из {totalSecuritiesBonds} других облигаций");
                            countDataBonds = bonds.Count;
                            totalBonds += Convert.ToInt32(totalSecuritiesBonds);
                        }
                        else
                        {
                            logger.LogError($"Данные {securitiesBonds} не удалось десериализовать");
                            await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress,
                                ConfigLoader.Instance.Bot.Port, BotCommand.Error,
                                $"Данные {securitiesBonds} не удалось десериализовать");
                        }
                    }
                    else
                    {
                        logger.LogError($"Выбраны неверные данные json-файла. {securitiesDataBonds}");
                        await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress,
                            ConfigLoader.Instance.Bot.Port, BotCommand.Error,
                            $"Выбраны неверные данные json-файла. {securitiesDataBonds}");
                    }
                }
                else
                {
                    logger.LogError($"Данные пустые: {jsonArrayBonds}");
                    await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress,
                        ConfigLoader.Instance.Bot.Port, BotCommand.Error,
                        $"Данные пустые: {jsonArrayBonds}");
                }
            }

            logger.LogInformation(
                $"Все данные успешно считаны. {countDataBonds} биржевых облигаций из {totalBonds} разных типов облигаций");
            await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress,
                ConfigLoader.Instance.Bot.Port, BotCommand.ExecuteTask,
                $"Данные парсера {Process.GetCurrentProcess().ProcessName} получены. Количество биржевых облигаций: {bonds.Count}");
            logger.LogInformation($"Запись данных в файл");
            try
            {
                WorkingWithServiceDll();
                WriteInFileCsv();
                logger.LogInformation($"Запись в файл прошла успешно");
            }
            catch (IOException ex)
            {
                logger.LogError($"Ошибка при записи в файл: {ex.Message}");
            }
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка: {ex.Message}");
            await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress,
                ConfigLoader.Instance.Bot.Port, BotCommand.Error,
                $"Неизвестная ошибка: {ex.Message}");
        }

        return bonds;
    }

    private void WorkingWithServiceDll()
    {
        using var loggerFactory = LoggerFactory.Create(builder => { builder.AddNLog(); });
        var csvLogger = loggerFactory.CreateLogger<CsvService>();
        csvServiceDll = new CsvService(csvLogger, httpClient);
    }

    private void WriteInFileCsv()
    {
        csvServiceDll.EnsureDirectoryExists(dirPath);
        string filePath = Path.Combine(dirPath, $"Me_Bonds_{csvServiceDll.GetDate()}.csv");
        csvWriter.Write(filePath, bonds);
    }
}