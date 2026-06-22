using System.Diagnostics;
using System.Text.RegularExpressions;
using HtmlAgilityPack;
using LjubljanaStockExchangeParser.Models;
using LjubljanaStockExchangeParser.WorkingWithFiles;
using Microsoft.Extensions.Logging;
using NLog.Extensions.Logging;
using Shared.BotHelpers;
using Shared.Config;
using Shared.Services;
using Shared.Services.Interfaces;
using Shared.WorkingWithFiles;

namespace LjubljanaStockExchangeParser;

public sealed class BondParser(
    ILogger<BondParser> logger,
    HttpClient httpClient,
    ConnectionMonitor connectionMonitor,
    BotService botService) : IBondProvider<BondModel>
{
    private readonly string urlBonds = $"https://ljse.si/en/financni-instrumenti/26?status=ALL&model=ALL&type=BOND";
    private List<BondModel> bonds = new List<BondModel>();
    private HtmlDocument document = new HtmlDocument();
    private static readonly string dirPath = Path.Combine(Directory.GetCurrentDirectory(), "Bonds");
    private CsvService csvServiceDll;
    private CsvWriter csvWriter = new CsvWriter();
    private string filePath => Path.Combine(dirPath, $"Lse_Bonds_{csvServiceDll.GetDate()}.csv");

    public async Task<List<BondModel>> GetBondsAsync()
    {
        try
        {
            await botService.UsageTaskBotAsync(Process.GetCurrentProcess().ProcessName);
            if (await connectionMonitor.ConnectionToDataAsync(urlBonds))
            {
                await FillingBondsAsync();
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

    public async Task<List<BondModel>> FillingBondsAsync()
    {
        document.LoadHtml(connectionMonitor.ResponseContent());
        var container = document.GetElementbyId("D");
        if (container != null)
        {
            var tableBody = document.GetElementbyId("D").SelectNodes($"//tbody//tr[@data-type='DEBT,BOND']")
                .ToArray();
            logger.LogInformation($"Контент получен. Извлечение данных...");
            try
            {
                foreach (var tableRow in tableBody)
                {
                    var cellSymbol = tableRow.SelectSingleNode($".//td[1]").InnerText;
                    var cellIsin = tableRow.SelectSingleNode($".//td[2]").InnerText;
                    var cellName = tableRow.SelectSingleNode($".//td[3]").InnerText;
                    var cellSector = tableRow.SelectSingleNode($".//td[4]").InnerText;
                    var cellListedQuantity = GetCorrectNumber(tableRow.SelectSingleNode($".//td[5]").InnerText);
                    var cellNominalValue = GetCorrectNumber(tableRow.SelectSingleNode($".//td[6]").InnerText);
                    var cellCurrency = GetCurrency(tableRow.SelectSingleNode($".//td[6]").InnerText);
                    var cellListingDate = tableRow.SelectSingleNode($".//td[7]").InnerText;
                    var cellDelistingDate = tableRow.SelectSingleNode($".//td[8]").InnerText;

                    bonds.Add(new BondModel()
                    {
                        Symbol = cellSymbol,
                        Isin = cellIsin,
                        Name = cellName,
                        Sector = cellSector,
                        ListedQuantity = cellListedQuantity,
                        NominalValue = cellNominalValue,
                        Currency = cellCurrency,
                        ListingDate = cellListingDate,
                        DelistingDate = cellDelistingDate,
                        UpdatedAt = DateTime.Now
                    });
                }

                if (bonds.Count > 0)
                {
                    logger.LogInformation($"Данные извлечены. Количество: {bonds.Count}");
                    await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress,
                        ConfigLoader.Instance.Bot.Port, BotCommand.ExecuteTask,
                        $"Данные парсера {Process.GetCurrentProcess().ProcessName} получены. Количество: {bonds.Count}");
                    logger.LogInformation($"Запись данных в файл");
                    WriteInFileCsv();
                }
                else
                {
                    logger.LogError($"Данные не удалось извлечь");
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"Неизвестная ошибка: {ex.Message}");
            }
        }

        return bonds;
    }

    private string GetCurrency(string line)
    {
        return Regex.Match(line.Trim(), @"[A-Z]{3}$").Value;
    }

    private string GetCorrectNumber(string line)
    {
        return Regex.Replace(line.Replace('.', ','), @"[^\d.]", "");
    }

    private void WorkingWithServiceDll()
    {
        using var loggerFactory = LoggerFactory.Create(builder => { builder.AddNLog(); });
        var csvLogger = loggerFactory.CreateLogger<CsvService>();
        csvServiceDll = new CsvService(csvLogger, httpClient);
    }

    private void WriteInFileCsv()
    {
        try
        {
            WorkingWithServiceDll();
            csvServiceDll.EnsureDirectoryExists(dirPath);
            csvWriter.Write(filePath, bonds);
            logger.LogInformation($"Запись в файл прошла успешно");
        }
        catch (IOException ex)
        {
            logger.LogError($"Ошибка при записи в файл: {ex.Message}");
        }
    }
}