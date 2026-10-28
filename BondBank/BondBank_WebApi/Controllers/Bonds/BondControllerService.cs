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

    public async Task<IEnumerable<BondDto>> GetBondsByFilterAsync(string? isin, string? type)
    {
        logger.LogInformation($"Процесс получения облигаций по фильтру");
        return await SearchByFilterAsync(isin, type);
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

            var allBonds = new List<BondsBaseModel>();
            allBonds.AddRange(bondsLse);
            allBonds.AddRange(bondsMe);
            allBonds.AddRange(bondsSg);
            allBonds.AddRange(bondsWb);

            return allBonds
                .Select(MapToDto)
                .OfType<BondDto>()
                .ToList();
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе с БД при получении облигации: {ExMessage}", ex.Message);
            return new List<BondDto>();
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении всех облигаций: {ExMessage}", ex.Message);
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

    private async Task<List<BondDto>> FindBondsByTypeAsync(string type)
    {
        try
        {
            List<BondsBaseModel> bonds = type switch
            {
                "lse" => await dbContext.LjubljanaStockExchangeBonds.ToListAsync<BondsBaseModel>(),
                "me" => await dbContext.MoscowExchangeBonds.ToListAsync<BondsBaseModel>(),
                "sg" => await dbContext.SixGroupBonds.ToListAsync<BondsBaseModel>(),
                "wb" => await dbContext.WienerBoerseBonds.ToListAsync<BondsBaseModel>(),
                _ => new List<BondsBaseModel>()
            };

            return bonds
                .Select(MapToDto)
                .OfType<BondDto>()
                .ToList();
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе с БД при получении облигации по типу '{Type}': {ExMessage}", type,
                ex.Message);
            return new List<BondDto>();
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при поиске облигаций типа {Type}: {ExMessage}", type, ex.Message);
            return new List<BondDto>();
        }
    }

    private async Task<IEnumerable<BondDto>> SearchByFilterAsync(string? type, string? isin)
    {
        if (!string.IsNullOrWhiteSpace(isin) && string.IsNullOrWhiteSpace(type))
        {
            var bond = await FindBondByIsinAsync(isin);
            if (bond == null)
                return new List<BondDto>();

            var dto = MapToDto(bond);
            return dto == null ? new List<BondDto>() : new List<BondDto> { dto };
        }

        if (!string.IsNullOrWhiteSpace(type) && string.IsNullOrWhiteSpace(isin))
            return await FindBondsByTypeAsync(type);

        if (!string.IsNullOrWhiteSpace(type) && !string.IsNullOrWhiteSpace(isin))
        {
            var bond = await FindBondByIsinAsync(isin);
            if (bond == null) 
                return new List<BondDto>();

            var dto = MapToDto(bond);
            if (dto is { Type: not null } && dto.Type.Equals(type, StringComparison.InvariantCultureIgnoreCase))
                return new List<BondDto> { dto };
        }

        return new List<BondDto>();
    }

    private BondDto? MapToDto(BondsBaseModel bond)
    {
        return bond switch
        {
            LjubljanaStockExchangeBondsModel lse => new BondDto()
            {
                Type = "lse",
                Bond = lse,
                SpecificData = new
                {
                    lse.Sector, lse.Symbol, lse.ListedQuantity, lse.NominalValue, lse.Currency, lse.ListingDate,
                    lse.DelistingDate
                }
            },
            MoscowExchangeBondsModel me => new BondDto()
            {
                Type = "me",
                Bond = me,
                SpecificData = new
                {
                    me.SecurityType, me.SecurityTypeId, me.Type, me.SecId, me.ShortName, me.RegNumber, me.IsTraded,
                    me.PrimaryBoardId, me.Market, me.Engine, me.FaceValue, me.FaceUnit
                }
            },
            SixGroupBondsModel sg => new BondDto()
            {
                Type = "sg",
                Bond = sg,
                SpecificData = new
                {
                    sg.ValorId, sg.TradingBaseCurrency, sg.CouponRate, sg.MaturityDate, sg.ClosingPrice,
                    sg.ClosingPerfomance, sg.BidPrice, sg.AskPrice, sg.MarketTime, sg.MarketDate, sg.IssuerNameFull,
                    sg.ProductLine, sg.IndustrySectorCode, sg.SecTypeCode, sg.AmountInIssue, sg.YieldToWorst
                }
            },
            WienerBoerseBondsModel wb => new BondDto()
            {
                Type = "wb",
                Bond = wb,
                SpecificData = new { wb.Last, wb.Chg, wb.Date, wb.Bid, wb.Ask, wb.Maturity, wb.Status, wb.Currency }
            },
            _ => null
        };
    }
}