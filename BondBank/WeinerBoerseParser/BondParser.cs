using System.Diagnostics;
using System.Text.RegularExpressions;
using HtmlAgilityPack;
using Microsoft.Extensions.Logging;
using Shared.BotHelpers;
using Shared.Services;
using Shared.Services.Interfaces;
using Shared.WorkingWithFiles;
using WeinerBoerseParser.Models;
using Shared.Config;
using WeinerBoerseParser.HelperMethods;

namespace WeinerBoerseParser;

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
    CsvService csvServiceDll,
    CsvHelper csvHelper) : IBondProvider<BondModel>
{
    private int numberPage = 1;
    private const int CountCells = 9;
    private List<BondModel> bonds = new List<BondModel>();
    private static readonly string dirPath = Path.Combine(Directory.GetCurrentDirectory(), "Bonds");
    private HtmlDocument document = new HtmlDocument();
    private string FileName => $"Wb_Bonds_{csvServiceDll.GetDate()}.csv";

    /// <summary>
    /// Получение бондов
    /// </summary>
    /// <returns>Возвращает бонды (сформированные или null)</returns>
    public async Task<List<BondModel>> GetBondsAsync()
    {
        try
        {
            await botService.UsageTaskBotAsync(Process.GetCurrentProcess().ProcessName);
            logger.LogInformation($"Запуск парсинга данных...");
            do
            {
                if (await connectionMonitor.ConnectionToDataAsync(GetBondsUrl(numberPage)))
                {
                    await FillingBondsAsync();
                }

                numberPage++;
            } while (numberPage <= CountPagesWb());

            await botService.SendCommandToBotAsync(
                ConfigLoader.Instance.BotTelegram.IpAddress, ConfigLoader.Instance.BotTelegram.Port, BotCommand.ExecuteTask,
                $"Облигации парсера {Process.GetCurrentProcess().ProcessName} получены. Количество: {bonds.Count}");
            logger.LogInformation($"Отправка сформированных данных на сервер...");
            await csvHelper.SendFileOnWebServer(dirPath, FileName);
        }
        catch (ArgumentException ex)
        {
            logger.LogError($"{ex.Message}");
            await botService.SendCommandToBotAsync(ConfigLoader.Instance.BotTelegram.IpAddress, ConfigLoader.Instance.BotTelegram.Port,
                BotCommand.Error, $"{ex.Message}");
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка: {ex.Message}");
            await botService.SendCommandToBotAsync(ConfigLoader.Instance.BotTelegram.IpAddress, ConfigLoader.Instance.BotTelegram.Port,
                BotCommand.Error, $"Неизвестная ошибка: {ex.Message}");
        }

        return bonds;
    }

    /// <summary>
    /// Заполнение бондов
    /// </summary>
    /// <returns>Возвращает бонды</returns>
    /// <exception cref="ArgumentException">Исключение, если не удалось найти контейнер по id в html тегах</exception>
    public async Task<List<BondModel>> FillingBondsAsync()
    {
        document.LoadHtml(connectionMonitor.ResponseContent());
        var container = document.GetElementbyId($"c7928-module-container");
        if (container != null)
        {
            var tableBody = document.GetElementbyId($"c7928-module-container").ChildNodes
                .FindFirst($"tbody").ChildNodes.Where(x => x.Name == $"tr").ToArray();
            logger.LogInformation($"Контент страницы {numberPage} получен");
            logger.LogInformation($"Извлечение данных...");
            var countCells = document.GetElementbyId($"c7928-module-container").ChildNodes
                .FindFirst("tbody").SelectSingleNode(".//tr").ChildNodes.Count;
            try
            {
                if (countCells == CountCells)
                {
                    foreach (var tableRow in tableBody)
                    {
                        var cellName = tableRow.ChildNodes.FindFirst($"td").ChildNodes.FindFirst($"a")
                            .InnerText;
                        var cellLast = tableRow.SelectSingleNode($".//td[2]").InnerText;
                        var cellChange = tableRow.SelectSingleNode($".//td[3]").InnerText;
                        var cellDate = tableRow.SelectSingleNode($".//td[4]").InnerText;
                        var cellIsin = tableRow.SelectSingleNode($".//td[5]").InnerText;
                        var cellBid = tableRow.SelectSingleNode($".//td[6]").InnerText;
                        var cellAsk = tableRow.SelectSingleNode($".//td[7]").InnerText;
                        var cellMaturity = tableRow.SelectSingleNode($".//td[8]").InnerText;
                        var cellStatus = tableRow.SelectSingleNode($".//td[9]").InnerText;
                        bonds.Add(new BondModel()
                        {
                            Name = cellName,
                            Last = cellLast,
                            Chg = cellChange,
                            Date = cellDate,
                            Isin = cellIsin,
                            Bid = cellBid,
                            Ask = cellAsk,
                            Maturity = cellMaturity,
                            Status = cellStatus,
                            Currency = "EUR",
                            UpdatedAt = DateTime.Now
                        });
                    }

                    if (bonds.Count > 0)
                    {
                        logger.LogInformation(
                            $"Данные со страницы №{numberPage} извлечены. Количество: {bonds.Count}");
                        csvHelper.WhiteInFileCsv(dirPath, FileName, bonds);
                    }
                    else
                    {
                        logger.LogError($"Данные со страницы №{numberPage} не удалось извлечь");
                        await botService.SendCommandToBotAsync(ConfigLoader.Instance.BotTelegram.IpAddress,
                            ConfigLoader.Instance.BotTelegram.Port, BotCommand.Info,
                            $"Данные со страницы №{numberPage} не удалось извлечь");
                    }
                }
                else
                {
                    logger.LogError(
                        $"Количество столбцов на странице {numberPage} изменилось. Данные не удается получить.");
                    await botService.SendCommandToBotAsync(ConfigLoader.Instance.BotTelegram.IpAddress,
                        ConfigLoader.Instance.BotTelegram.Port, BotCommand.Info,
                        $"Количество столбцов на странице {numberPage} изменилось. Данные не удается получить.");
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"{ex.Message}");
                await botService.SendCommandToBotAsync(ConfigLoader.Instance.BotTelegram.IpAddress,
                    ConfigLoader.Instance.BotTelegram.Port, BotCommand.Info,
                    $"Неизвестная ошибка: {ex.Message}");
            }
        }
        else
        {
            throw new ArgumentException(
                $"Не удалось найти данные в контейнере или сам контейнер по id: 'c7928-module-container'");
        }

        return bonds;
    }

    private static string AllRemovedCharacters(string? value)
    {
        return string.IsNullOrEmpty(value) ? string.Empty : Regex.Replace(value, @"[^\d.]", "");
    }

    private static string GetBondsUrl(int pageNumber)
    {
        return
            $"https://www.wienerborse.at/en/bonds/?c7928-page={pageNumber}&per-page=50&cHash=8a64e6f2193d28657a2297b3ccfd2a22";
    }

    private int CountPagesWb()
    {
        const int elementsPage = 50;
        var container = document.GetElementbyId($"c7928-module");
        var countAllBonds = container.SelectSingleNode($".//*[contains(@class, 'summary')]").ChildNodes
            .Where(x => x.Name == "b").ToArray();
        var cBonds = Convert.ToDouble(AllRemovedCharacters(countAllBonds[0].InnerText)) / elementsPage;
        logger.LogInformation(
            $"Всего страниц с облигациями: {Convert.ToInt32(cBonds >= Math.Truncate(cBonds) ? Math.Truncate(cBonds + 1) : Math.Truncate(cBonds))}");
        return Convert.ToInt32(cBonds >= Math.Truncate(cBonds) ? Math.Truncate(cBonds + 1) : Math.Truncate(cBonds));
    }
}