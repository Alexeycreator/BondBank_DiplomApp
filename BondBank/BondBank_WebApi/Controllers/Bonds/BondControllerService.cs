using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Models.DTOs.Bonds;
using BondBank_WebApi.Services.Analysis;
using BondBank_WebApi.Services.DataContext;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BondBank_WebApi.Controllers.Bonds;

/// <summary>
/// Описание бизнес-логики контракта
/// </summary>
/// <param name="logger">Зависимость для логирования</param>
/// <param name="dbContext">Зависимость для контекста БД</param>
public sealed class BondControllerService(
    ILogger<BondControllerService> logger,
    ApplicationContext dbContext,
    AnalysisData analysisData) : IBondControllerService
{
    public async Task<IEnumerable<BondDto>> GetAllBondsAsync()
    {
        logger.LogInformation($"Процесс получения всех облигаций");
        var bonds = await ConsolidationBondsAsync();
        return bonds;
    }

    public async Task<BondsBaseModel?> GetBondByIsinAsync(string isin)
    {
        logger.LogInformation($"Процесс получения облигации по номеру isin");
        var bond = await FindBondByIsinAsync(isin);
        return bond;
    }

    public async Task<IEnumerable<BondDto>> GetBondsByTypeAsync(string typeBond)
    {
        logger.LogInformation($"Процесс получения всех облигаций одного типа");
        var bonds = await FindBondsByTypeAsync(typeBond);
        return bonds;
    }

    public async Task<Dictionary<string, double[]>> GetForecastBondsAsync()
    {
        var result = await analysisData.DataForecastingAsync();
        return result;
    }

    /// <summary>
    /// Объединяем бонды в общий список, для отправки
    /// </summary>
    /// <returns>Возвращаем коллекцию бондов всех типов</returns>
    private async Task<List<BondDto>> ConsolidationBondsAsync()
    {
        try
        {
            var bondsLse = await dbContext.LjubljanaStockExchangeBonds.ToListAsync();
            var bondsMe = await dbContext.MoscowExchangeBonds.ToListAsync();
            var bondsSg = await dbContext.SixGroupBonds.ToListAsync();
            var bondsWb = await dbContext.WienerBoerseBonds.ToListAsync();

            var allBonds = new List<BondDto>();
            allBonds.AddRange(bondsLse.Select(b => new BondDto()
            {
                Type = "lse",
                Bond = b,
                SpecificData = new
                    { b.Sector, b.Symbol, b.ListedQuantity, b.NominalValue, b.Currency, b.ListingDate, b.DelistingDate }
            }));
            allBonds.AddRange(bondsMe.Select(b => new BondDto()
            {
                Type = "me",
                Bond = b,
                SpecificData = new
                {
                    b.SecurityType, b.SecurityTypeId, b.Type, b.SecId, b.ShortName, b.RegNumber, b.IsTraded,
                    b.PrimaryBoardId, b.Market, b.Engine, b.FaceValue, b.FaceUnit
                }
            }));
            allBonds.AddRange(bondsSg.Select(b => new BondDto()
            {
                Type = "sg",
                Bond = b,
                SpecificData = new
                {
                    b.ValorId, b.TradingBaseCurrency, b.CouponRate, b.MaturityDate, b.ClosingPrice, b.ClosingPerfomance,
                    b.BidPrice, b.AskPrice, b.MarketTime, b.MarketDate, b.IssuerNameFull, b.ProductLine,
                    b.IndustrySectorCode, b.SecTypeCode, b.AmountInIssue, b.YieldToWorst
                }
            }));
            allBonds.AddRange(bondsWb.Select(b => new BondDto()
            {
                Type = "wb",
                Bond = b,
                SpecificData = new { b.Last, b.Chg, b.Date, b.Bid, b.Ask, b.Maturity, b.Status, b.Currency }
            }));

            return allBonds;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе с БД при получении всех облигаций: {ExMessage}", ex.Message);
            return new List<BondDto>();
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении всех облигаций: {ExMessage}", ex.Message);
            return new List<BondDto>();
        }
    }

    private async Task<BondsBaseModel?> FindBondByIsinAsync(string isin)
    {
        try
        {
            var bondLse = await dbContext.LjubljanaStockExchangeBonds.FirstOrDefaultAsync(b => b.Isin == isin);
            if (bondLse != null)
                return bondLse;

            var bondMe = await dbContext.MoscowExchangeBonds.FirstOrDefaultAsync(b => b.Isin == isin);
            if (bondMe != null)
                return bondMe;

            var bondSg = await dbContext.SixGroupBonds.FirstOrDefaultAsync(b => b.Isin == isin);
            if (bondSg != null)
                return bondSg;

            var bondWb = await dbContext.WienerBoerseBonds.FirstOrDefaultAsync(b => b.Isin == isin);
            if (bondWb != null)
                return bondWb;

            logger.LogWarning($"В БД нет облигаций");
            return null;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе с БД при получении облигации по isin: {ExMessage}", ex.Message);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при поиске облигации по isin: {ExMessage}", ex.Message);
            return null;
        }
    }

    private async Task<List<BondDto>> FindBondsByTypeAsync(string typeBond)
    {
        try
        {
            var resultBonds = new List<BondDto>();
            switch (typeBond)
            {
                case "lse":
                    var bondLse = await dbContext.LjubljanaStockExchangeBonds.ToListAsync();
                    resultBonds.AddRange(bondLse.Select(b => new BondDto()
                    {
                        Type = "lse",
                        Bond = b,
                        SpecificData = new
                        {
                            b.Sector, b.Symbol, b.ListedQuantity, b.NominalValue, b.Currency, b.ListingDate,
                            b.DelistingDate
                        }
                    }));
                    break;
                case "me":
                    var bondMe = await dbContext.MoscowExchangeBonds.ToListAsync();
                    resultBonds.AddRange(bondMe.Select(b => new BondDto()
                    {
                        Type = "me",
                        Bond = b,
                        SpecificData = new
                        {
                            b.SecurityType, b.SecurityTypeId, b.Type, b.SecId, b.ShortName, b.RegNumber, b.IsTraded,
                            b.PrimaryBoardId, b.Market, b.Engine, b.FaceValue, b.FaceUnit
                        }
                    }));
                    break;
                case "sg":
                    var bondSg = await dbContext.SixGroupBonds.ToListAsync();
                    resultBonds.AddRange(bondSg.Select(b => new BondDto()
                    {
                        Type = "sg",
                        Bond = b,
                        SpecificData = new
                        {
                            b.ValorId, b.TradingBaseCurrency, b.CouponRate, b.MaturityDate, b.ClosingPrice,
                            b.ClosingPerfomance,
                            b.BidPrice, b.AskPrice, b.MarketTime, b.MarketDate, b.IssuerNameFull, b.ProductLine,
                            b.IndustrySectorCode, b.SecTypeCode, b.AmountInIssue, b.YieldToWorst
                        }
                    }));
                    break;
                case "wb":
                    var bondWb = await dbContext.WienerBoerseBonds.ToListAsync();
                    resultBonds.AddRange(bondWb.Select(b => new BondDto()
                    {
                        Type = "wb",
                        Bond = b,
                        SpecificData = new { b.Last, b.Chg, b.Date, b.Bid, b.Ask, b.Maturity, b.Status, b.Currency }
                    }));
                    break;
                default:
                    logger.LogWarning($"Данного типа облигаций нет в системе");
                    break;
            }

            return resultBonds;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе с БД при получении всех облигаций одного типа: {ExMessage}", ex.Message);
            return new List<BondDto>();
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при поиске облигаций одного типа: {ExMessage}", ex.Message);
            return new List<BondDto>();
        }
    }
}