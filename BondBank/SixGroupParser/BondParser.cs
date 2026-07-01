using System.Diagnostics;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using NLog.Extensions.Logging;
using Shared.BotHelpers;
using Shared.Config;
using Shared.Services;
using Shared.Services.Interfaces;
using Shared.WorkingWithFiles;
using SixGroupParser.HelperMethods;
using SixGroupParser.Models;

namespace SixGroupParser;

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
    private readonly string urlBondsSixGroup =
        $"https://www.six-group.com/fqs/ref.json?select=ShortName,ValorId,TradingBaseCurrency,CouponRate,MaturityDate,ClosingPrice,ClosingPerformance,BidPrice,AskPrice,MarketTime,MarketDate,IssuerNameFull,ProductLine,IndustrySectorCode,SecTypeCode,ISIN,AmountInIssue,YieldToWorst&where=PortalSegment=BO&orderby=ShortName&page=1&pagesize=20";

    private static readonly string dirPath = Path.Combine(Directory.GetCurrentDirectory(), "Bonds");
    private List<BondModel> bonds = new List<BondModel>();
    private string FileName => $"Sg_Bonds_{csvServiceDll.GetDate()}.csv";

    /// <summary>
    /// Получение бондов
    /// </summary>
    /// <returns>Возвращает бонды (сформированные или null)</returns>
    public async Task<List<BondModel>> GetBondsAsync()
    {
        try
        {
            await botService.UsageTaskBotAsync(Process.GetCurrentProcess().ProcessName);
            if (await connectionMonitor.ConnectionToDataAsync(urlBondsSixGroup))
            {
                await FillingBondsAsync();
            }

            await botService.SendCommandToBotAsync(
                ConfigLoader.Instance.Bot.IpAddress, ConfigLoader.Instance.Bot.Port, BotCommand.ExecuteTask,
                $"Облигации парсера {Process.GetCurrentProcess().ProcessName} получены. Количество: {bonds.Count}");
            await csvHelper.SendFileOnWebServer(dirPath, FileName);
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка: {ex.Message}");
            await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress, ConfigLoader.Instance.Bot.Port,
                BotCommand.Error, $"Неизвестная ошибка: {ex.Message}");
        }

        return bonds;
    }

    /// <summary>
    /// Заполнение бондов
    /// </summary>
    /// <returns>Возвращает бонды</returns>
    public async Task<List<BondModel>> FillingBondsAsync()
    {
        try
        {
            logger.LogInformation($"Получение облигаций...");
            JObject jsonRespBonds = JObject.Parse(connectionMonitor.ResponseContent());
            int pageItemsBond = GettingPageItemsBond(jsonRespBonds);
            int totalBonds = GettingTotalBonds(jsonRespBonds);
            logger.LogInformation($"Всего {totalBonds} облигаций");
            logger.LogInformation($"Обработка облигаций...");

            string urlAllBonds = UrlGettingAllBonds(pageItemsBond, totalBonds);

            await connectionMonitor.ConnectionToDataAsync(urlAllBonds);
            JObject jsonData = JObject.Parse(connectionMonitor.ResponseContent());
            JArray jsonDataBonds = (JArray)jsonData["rowData"];

            if (jsonDataBonds != null)
                foreach (var bond in jsonDataBonds)
                {
                    var shortName = bond[0];
                    var valorId = bond[1];
                    var tradingBaseCurrency = bond[2];
                    var couponRate = bond[3];
                    var maturityDate = bond[4];
                    var closingPrice = bond[5];
                    var closingPerfomance = bond[6];
                    var bidPrice = bond[7];
                    var askPrice = bond[8];
                    var marketTime = bond[9];
                    var marketDate = bond[10];
                    var issuerNameFull = bond[11];
                    var productLine = bond[12];
                    var industrySectorCode = bond[13];
                    var secTypeCode = bond[14];
                    var isin = bond[15];
                    var amountInIssue = bond[16];
                    var yieldToWorst = bond[17];
                    bonds.Add(new BondModel()
                    {
                        Name = shortName?.ToString(),
                        ValorId = valorId?.ToString(),
                        TradingBaseCurrency = tradingBaseCurrency?.ToString(),
                        CouponRate = couponRate?.ToString(),
                        MaturityDate = maturityDate?.ToString(),
                        ClosingPrice = closingPrice?.ToString(),
                        ClosingPerfomance = closingPerfomance?.ToString(),
                        BidPrice = bidPrice?.ToString(),
                        AskPrice = askPrice?.ToString(),
                        MarketTime = marketTime?.ToString(),
                        MarketDate = marketDate?.ToString(),
                        IssuerNameFull = issuerNameFull?.ToString(),
                        ProductLine = productLine?.ToString(),
                        IndustrySectorCode = industrySectorCode?.ToString(),
                        SecTypeCode = secTypeCode?.ToString(),
                        Isin = isin?.ToString(),
                        AmountInIssue = amountInIssue?.ToString(),
                        YieldToWorst = yieldToWorst?.ToString(),
                        UpdatedAt = DateTime.Now
                    });
                }

            if (bonds.Count > 0)
            {
                logger.LogInformation($"Данные извлечены. Всего {bonds.Count} из {totalBonds} облигаций");
                await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress,
                    ConfigLoader.Instance.Bot.Port, BotCommand.ExecuteTask,
                    $"Данные парсера {Process.GetCurrentProcess().ProcessName} получены. Количество: {bonds.Count}");
                logger.LogInformation($"Запись данных в файл");
                csvHelper.WhiteInFileCsv(dirPath, FileName, bonds);
            }
        }
        catch (InvalidOperationException ex)
        {
            logger.LogError($"Ошибка операции преобразования бондов: {ex.Message}");
            await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress, ConfigLoader.Instance.Bot.Port,
                BotCommand.Error, $"Ошибка операции преобразования бондов: {ex.Message}");
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка: {ex.Message}");
            await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress, ConfigLoader.Instance.Bot.Port,
                BotCommand.Error, $"Неизвестная ошибка: {ex.Message}");
        }

        return bonds;
    }

    /// <summary>
    /// Проверяет по какому url адресу парсить бонды
    /// </summary>
    /// <param name="pageItemsBond">Количество бондов на странице</param>
    /// <param name="totalBonds">Всего бондов</param>
    /// <returns>Возвращает новый url адрес</returns>
    private string UrlGettingAllBonds(int pageItemsBond, int totalBonds)
    {
        if (totalBonds != 0 && totalBonds > pageItemsBond)
        {
            return
                $"https://www.six-group.com/fqs/ref.json?select=ShortName,ValorId,TradingBaseCurrency,CouponRate,MaturityDate,ClosingPrice,ClosingPerformance,BidPrice,AskPrice,MarketTime,MarketDate,IssuerNameFull,ProductLine,IndustrySectorCode,SecTypeCode,ISIN,AmountInIssue,YieldToWorst&where=PortalSegment=BO&orderby=ShortName&page=1&pagesize={totalBonds}";
        }

        return urlBondsSixGroup;
    }

    private int GettingPageItemsBond(JObject jsonRespBonds)
    {
        return (jsonRespBonds["pageSize"] ?? throw new InvalidOperationException()).Value<int>();
    }

    private int GettingTotalBonds(JObject jsonRespBonds)
    {
        return (jsonRespBonds["totalRows"] ?? throw new InvalidOperationException()).Value<int>();
    }
}