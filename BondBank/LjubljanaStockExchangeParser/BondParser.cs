using System.Diagnostics;
using System.Text.RegularExpressions;
using HtmlAgilityPack;
using LjubljanaStockExchangeParser.HelperMethods;
using LjubljanaStockExchangeParser.Models;
using Microsoft.Extensions.Logging;
using Shared.BotHelpers;
using Shared.Services;
using Shared.Services.Interfaces;
using Shared.Services.MinIO;
using Shared.WorkingWithFiles;

namespace LjubljanaStockExchangeParser;

/// <summary>
/// Предназначен для получения бондов
/// </summary>
/// <param name="logger">Зависимость для логирования</param>
/// <param name="connectionMonitor">Зависимость для проверки подключения к веб-ресурсу биржи</param>
/// <param name="botService">Зависимость для взаимодействия с ботом</param>
/// <param name="csvServiceDll">Зависимость для отправки сформированного файла на сервер</param>
/// <param name="csvHelper">Зависимость для сохранения бондов в csv файл и отправки на сервер</param>
public sealed class BondParser(
    ILogger<BondParser> logger,
    ConnectionMonitor connectionMonitor,
    BotService botService,
    CsvHelper csvHelper,
    CsvService csvServiceDll,
    MinioStorageService minioService) : IBondProvider<BondModel>
{
    private readonly string urlBonds = $"https://ljse.si/en/financni-instrumenti/26?status=ALL&model=ALL&type=BOND";
    private List<BondModel> bonds = new();
    private HtmlDocument document = new();
    private static readonly string DirPath = Path.Combine(Directory.GetCurrentDirectory(), "Bonds");
    private string FileName => $"lse_bonds_{csvServiceDll.GetDate()}.csv";

    /// <summary>
    /// Получение бондов
    /// </summary>
    /// <returns>Возвращает бонды (сформированные или null)</returns>
    public async Task<List<BondModel>> GetBondsAsync()
    {
        try
        {
            await botService.UsageTaskBotAsync(Process.GetCurrentProcess().ProcessName);
            if (await connectionMonitor.ConnectionToDataAsync(urlBonds))
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
    public async Task<List<BondModel>> FillingBondsAsync()
    {
        document.LoadHtml(connectionMonitor.ResponseContent());
        var container = document.GetElementbyId("D");
        if (container != null)
        {
            var tableBody = (document.GetElementbyId("D")
                    ?.SelectNodes($"//tbody//tr[@data-type='DEBT,BOND']")!)
                .ToArray();
            logger.LogInformation($"Контент получен. Извлечение данных...");
            try
            {
                foreach (var tableRow in tableBody)
                {
                    var cellSymbol = tableRow.SelectSingleNode($".//td[1]")?.InnerText;
                    var cellIsin = tableRow.SelectSingleNode($".//td[2]")?.InnerText;
                    var cellName = tableRow.SelectSingleNode($".//td[3]")?.InnerText;
                    var cellSector = tableRow.SelectSingleNode($".//td[4]")?.InnerText;
                    var cellListedQuantity = GetCorrectNumber(tableRow.SelectSingleNode($".//td[5]")?.InnerText);
                    var cellNominalValue = GetCorrectNumber(tableRow.SelectSingleNode($".//td[6]")?.InnerText);
                    var cellCurrency = GetCurrency(tableRow.SelectSingleNode($".//td[6]")?.InnerText);
                    var cellListingDate = tableRow.SelectSingleNode($".//td[7]")?.InnerText;
                    var cellDelistingDate = tableRow.SelectSingleNode($".//td[8]")?.InnerText;

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
                    logger.LogInformation("Данные извлечены. Количество: {BondsCount}", bonds.Count);

                    await botService.SendCommandToAllBotsAsync(BotCommand.ExecuteTask,
                        $"Данные парсера {Process.GetCurrentProcess().ProcessName} получены. Количество: {bonds.Count}" +
                        Environment.NewLine + $"Дата получения: {csvServiceDll.GetDate()}");

                    logger.LogInformation($"Запись данных в файл");
                    csvHelper.WhiteInFileCsv(DirPath, FileName, bonds);
                    await SendToMinIo(DirPath, FileName, "text/csv", "bonds/lse", logger);
                }
                else
                {
                    logger.LogError($"Данные не удалось извлечь");
                }
            }
            catch (Exception ex)
            {
                logger.LogError("Неизвестная ошибка: {ExMessage}", ex.Message);
            }
        }

        return bonds;
    }

    private string GetCurrency(string? line)
    {
        return Regex.Match(line?.Trim() ?? throw new InvalidOperationException(), @"[A-Z]{3}$").Value;
    }

    private string GetCorrectNumber(string? line)
    {
        return Regex.Replace(line?.Replace('.', ',') ?? throw new InvalidOperationException(), @"[^\d.]", "");
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