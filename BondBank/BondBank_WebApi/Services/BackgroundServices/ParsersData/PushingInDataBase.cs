using System.Data.Common;
using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Services.DataContext;
using Microsoft.EntityFrameworkCore;

namespace BondBank_WebApi.Services.BackgroundServices.ParsersData;

public sealed class PushingInDataBase(ILogger<PushingInDataBase> logger)
{
    public async Task Push(ApplicationContext dbContext, List<LjubljanaStockExchangeBondsModel> bonds)
    {
        try
        {
            if (!await CheckConnectToDataBase(dbContext))
            {
                logger.LogWarning($"Нет подключения к БД");
                return;
            }

            logger.LogInformation($"Подключение к БД прошло успешно");
            if (!bonds.Any())
            {
                logger.LogError(
                    $"Данные об облигациях LjubljanaStockExchange пустые и не могут быть добавлены в БД");
                return;
            }

            int countUpdated = 0;
            int countAdded = 0;
            foreach (var bond in bonds)
            {
                var existingBond =
                    dbContext.LjubljanaStockExchangeBonds.FirstOrDefault(b => b.Isin == bond.Isin);

                if (existingBond == null)
                {
                    bool added = await AddBondsInDataBase(dbContext, bond);
                    if (added)
                    {
                        countAdded++;
                    }
                }
                else
                {
                    if (UpdatedFieldsBonds(existingBond, bond))
                    {
                        dbContext.Entry(existingBond).State = EntityState.Modified;
                        countUpdated++;
                    }
                }
            }

            int savedCount = await dbContext.SaveChangesAsync();
            logger.LogInformation(
                $"LjubljanaStockExchange: Добавлено: {countAdded}, Обновлено: {countUpdated}, Сохранено: {savedCount}");
        }
        catch (DbUpdateException ex)
        {
            logger.LogError($"Ошибка при сохранении в БД: {ex.Message}");
        }
        catch (Exception ex)
        {
            logger.LogError(
                $"Неизвестная ошибка при добавлении LjubljanaStockExchange данных в базу данных: {ex.Message}");
        }
    }

    public async Task Push(ApplicationContext dbContext, List<MoscowExchangeBondsModel> bonds)
    {
        try
        {
            if (!await CheckConnectToDataBase(dbContext))
            {
                logger.LogWarning($"Нет подключения к БД");
                return;
            }

            logger.LogInformation($"Подключение к БД прошло успешно");
            if (!bonds.Any())
            {
                logger.LogError(
                    $"Данные об облигациях MoscowExchangeBonds пустые и не могут быть добавлены в БД");
                return;
            }

            int countUpdated = 0;
            int countAdded = 0;
            foreach (var bond in bonds)
            {
                var existingBond =
                    dbContext.MoscowExchangeBonds.FirstOrDefault(b => b.Isin == bond.Isin);

                if (existingBond == null)
                {
                    bool added = await AddBondsInDataBase(dbContext, bond);
                    if (added)
                    {
                        countAdded++;
                    }
                }
                else
                {
                    if (UpdatedFieldsBonds(existingBond, bond))
                    {
                        dbContext.Entry(existingBond).State = EntityState.Modified;
                        countUpdated++;
                    }
                }
            }

            int savedCount = await dbContext.SaveChangesAsync();
            logger.LogInformation(
                $"MoscowExchange: Добавлено: {countAdded}, Обновлено: {countUpdated}, Сохранено: {savedCount}");
        }
        catch (DbUpdateException ex)
        {
            logger.LogError($"Ошибка при сохранении в БД: {ex.Message}");
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при добавлении MoscowExchange данных в базу данных: {ex.Message}");
        }
    }

    public async Task Push(ApplicationContext dbContext, List<SixGroupBondsModel> bonds)
    {
        try
        {
            if (!await CheckConnectToDataBase(dbContext))
            {
                logger.LogWarning($"Нет подключения к БД");
                return;
            }

            logger.LogInformation($"Подключение к БД прошло успешно");
            if (!bonds.Any())
            {
                logger.LogError(
                    $"Данные об облигациях SixGroupBonds пустые и не могут быть добавлены в БД");
                return;
            }

            int countUpdated = 0;
            int countAdded = 0;
            foreach (var bond in bonds)
            {
                var existingBond =
                    dbContext.SixGroupBonds.FirstOrDefault(b => b.Isin == bond.Isin);

                if (existingBond == null)
                {
                    bool added = await AddBondsInDataBase(dbContext, bond);
                    if (added)
                    {
                        countAdded++;
                    }
                }
                else
                {
                    if (UpdatedFieldsBonds(existingBond, bond))
                    {
                        dbContext.Entry(existingBond).State = EntityState.Modified;
                        countUpdated++;
                    }
                }
            }

            int savedCount = await dbContext.SaveChangesAsync();
            logger.LogInformation(
                $"SixGroup: Добавлено: {countAdded}, Обновлено: {countUpdated}, Сохранено: {savedCount}");
        }
        catch (DbUpdateException ex)
        {
            logger.LogError($"Ошибка при сохранении в БД: {ex.Message}");
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при добавлении SixGroup данных в базу данных: {ex.Message}");
        }
    }

    public async Task Push(ApplicationContext dbContext, List<WienerBoerseBondsModel> bonds)
    {
        try
        {
            if (!await CheckConnectToDataBase(dbContext))
            {
                logger.LogWarning($"Нет подключения к БД");
                return;
            }

            logger.LogInformation($"Подключение к БД прошло успешно");
            if (!bonds.Any())
            {
                logger.LogError(
                    $"Данные об облигациях WienerBoerseBonds пустые и не могут быть добавлены в БД");
                return;
            }

            int countUpdated = 0;
            int countAdded = 0;
            foreach (var bond in bonds)
            {
                var existingBond =
                    dbContext.WienerBoerseBonds.FirstOrDefault(b => b.Isin == bond.Isin);

                if (existingBond == null)
                {
                    bool added = await AddBondsInDataBase(dbContext, bond);
                    if (added)
                    {
                        countAdded++;
                    }
                }
                else
                {
                    if (UpdatedFieldsBonds(existingBond, bond))
                    {
                        dbContext.Entry(existingBond).State = EntityState.Modified;
                        countUpdated++;
                    }
                }
            }

            int savedCount = await dbContext.SaveChangesAsync();
            logger.LogInformation(
                $"WienerBoerse: Добавлено: {countAdded}, Обновлено: {countUpdated}, Сохранено: {savedCount}");
        }
        catch (DbUpdateException ex)
        {
            logger.LogError($"Ошибка при сохранении в БД: {ex.Message}");
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при добавлении WienerBoerse данных в базу данных: {ex.Message}");
        }
    }

    private async Task<bool> CheckConnectToDataBase(ApplicationContext dbContext)
    {
        try
        {
            return await dbContext.Database.CanConnectAsync();
        }
        catch (DbException ex)
        {
            logger.LogError($"Ошибка при подключении к базе данных: {ex.Message}");
            return false;
        }
    }

    private bool UpdatedFieldsBonds(LjubljanaStockExchangeBondsModel existingBonds,
        LjubljanaStockExchangeBondsModel updatedBonds)
    {
        bool hasChanges = false;
        if (existingBonds.Symbol != updatedBonds.Symbol)
        {
            existingBonds.Symbol = updatedBonds.Symbol;
            hasChanges = true;
        }

        if (existingBonds.Isin != updatedBonds.Isin)
        {
            existingBonds.Isin = updatedBonds.Isin;
            hasChanges = true;
        }

        if (existingBonds.Name != updatedBonds.Name)
        {
            existingBonds.Name = updatedBonds.Name;
            hasChanges = true;
        }

        if (existingBonds.Sector != updatedBonds.Sector)
        {
            existingBonds.Sector = updatedBonds.Sector;
            hasChanges = true;
        }

        if (existingBonds.ListedQuantity != updatedBonds.ListedQuantity)
        {
            existingBonds.ListedQuantity = updatedBonds.ListedQuantity;
            hasChanges = true;
        }

        if (existingBonds.NominalValue != updatedBonds.NominalValue)
        {
            existingBonds.NominalValue = updatedBonds.NominalValue;
            hasChanges = true;
        }

        if (existingBonds.Currency != updatedBonds.Currency)
        {
            existingBonds.Currency = updatedBonds.Currency;
            hasChanges = true;
        }

        if (existingBonds.ListingDate != updatedBonds.ListingDate)
        {
            existingBonds.ListingDate = updatedBonds.ListingDate;
            hasChanges = true;
        }

        if (existingBonds.DelistingDate != updatedBonds.DelistingDate)
        {
            existingBonds.DelistingDate = updatedBonds.DelistingDate;
            hasChanges = true;
        }

        if (existingBonds.UpdatedAt != updatedBonds.UpdatedAt)
        {
            existingBonds.UpdatedAt = updatedBonds.UpdatedAt;
            hasChanges = true;
        }

        return hasChanges;
    }

    private bool UpdatedFieldsBonds(MoscowExchangeBondsModel existingBonds,
        MoscowExchangeBondsModel updatedBonds)
    {
        bool hasChanges = false;
        if (existingBonds.SecurityType != updatedBonds.SecurityType)
        {
            existingBonds.SecurityType = updatedBonds.SecurityType;
            hasChanges = true;
        }

        if (existingBonds.SecurityTypeId != updatedBonds.SecurityTypeId)
        {
            existingBonds.SecurityTypeId = updatedBonds.SecurityTypeId;
            hasChanges = true;
        }

        if (existingBonds.Type != updatedBonds.Type)
        {
            existingBonds.Type = updatedBonds.Type;
            hasChanges = true;
        }

        if (existingBonds.SecId != updatedBonds.SecId)
        {
            existingBonds.SecId = updatedBonds.SecId;
            hasChanges = true;
        }

        if (existingBonds.ShortName != updatedBonds.ShortName)
        {
            existingBonds.ShortName = updatedBonds.ShortName;
            hasChanges = true;
        }

        if (existingBonds.Name != updatedBonds.Name)
        {
            existingBonds.Name = updatedBonds.Name;
            hasChanges = true;
        }

        if (existingBonds.RegNumber != updatedBonds.RegNumber)
        {
            existingBonds.RegNumber = updatedBonds.RegNumber;
            hasChanges = true;
        }

        if (existingBonds.IsTraded != updatedBonds.IsTraded)
        {
            existingBonds.IsTraded = updatedBonds.IsTraded;
            hasChanges = true;
        }

        if (existingBonds.PrimaryBoardId != updatedBonds.PrimaryBoardId)
        {
            existingBonds.PrimaryBoardId = updatedBonds.PrimaryBoardId;
            hasChanges = true;
        }

        if (existingBonds.Market != updatedBonds.Market)
        {
            existingBonds.Market = updatedBonds.Market;
            hasChanges = true;
        }

        if (existingBonds.Engine != updatedBonds.Engine)
        {
            existingBonds.Engine = updatedBonds.Engine;
            hasChanges = true;
        }

        if (existingBonds.FaceValue != updatedBonds.FaceValue)
        {
            existingBonds.FaceValue = updatedBonds.FaceValue;
            hasChanges = true;
        }

        if (existingBonds.FaceUnit != updatedBonds.FaceUnit)
        {
            existingBonds.FaceUnit = updatedBonds.FaceUnit;
            hasChanges = true;
        }

        if (existingBonds.Isin != updatedBonds.Isin)
        {
            existingBonds.Isin = updatedBonds.Isin;
            hasChanges = true;
        }

        if (existingBonds.UpdatedAt != updatedBonds.UpdatedAt)
        {
            existingBonds.UpdatedAt = updatedBonds.UpdatedAt;
            hasChanges = true;
        }

        return hasChanges;
    }

    private bool UpdatedFieldsBonds(SixGroupBondsModel existingBonds,
        SixGroupBondsModel updatedBonds)
    {
        bool hasChanges = false;
        if (existingBonds.Name != updatedBonds.Name)
        {
            existingBonds.Name = updatedBonds.Name;
            hasChanges = true;
        }

        if (existingBonds.ValorId != updatedBonds.ValorId)
        {
            existingBonds.ValorId = updatedBonds.ValorId;
            hasChanges = true;
        }

        if (existingBonds.TradingBaseCurrency != updatedBonds.TradingBaseCurrency)
        {
            existingBonds.TradingBaseCurrency = updatedBonds.TradingBaseCurrency;
            hasChanges = true;
        }

        if (existingBonds.CouponRate != updatedBonds.CouponRate)
        {
            existingBonds.CouponRate = updatedBonds.CouponRate;
            hasChanges = true;
        }

        if (existingBonds.MaturityDate != updatedBonds.MaturityDate)
        {
            existingBonds.MaturityDate = updatedBonds.MaturityDate;
            hasChanges = true;
        }

        if (existingBonds.ClosingPrice != updatedBonds.ClosingPrice)
        {
            existingBonds.ClosingPrice = updatedBonds.ClosingPrice;
            hasChanges = true;
        }

        if (existingBonds.ClosingPerfomance != updatedBonds.ClosingPerfomance)
        {
            existingBonds.ClosingPerfomance = updatedBonds.ClosingPerfomance;
            hasChanges = true;
        }

        if (existingBonds.BidPrice != updatedBonds.BidPrice)
        {
            existingBonds.BidPrice = updatedBonds.BidPrice;
            hasChanges = true;
        }

        if (existingBonds.AskPrice != updatedBonds.AskPrice)
        {
            existingBonds.AskPrice = updatedBonds.AskPrice;
            hasChanges = true;
        }

        if (existingBonds.MarketTime != updatedBonds.MarketTime)
        {
            existingBonds.MarketTime = updatedBonds.MarketTime;
            hasChanges = true;
        }

        if (existingBonds.MarketDate != updatedBonds.MarketDate)
        {
            existingBonds.MarketDate = updatedBonds.MarketDate;
            hasChanges = true;
        }

        if (existingBonds.IssuerNameFull != updatedBonds.IssuerNameFull)
        {
            existingBonds.IssuerNameFull = updatedBonds.IssuerNameFull;
            hasChanges = true;
        }

        if (existingBonds.ProductLine != updatedBonds.ProductLine)
        {
            existingBonds.ProductLine = updatedBonds.ProductLine;
            hasChanges = true;
        }

        if (existingBonds.IndustrySectorCode != updatedBonds.IndustrySectorCode)
        {
            existingBonds.IndustrySectorCode = updatedBonds.IndustrySectorCode;
            hasChanges = true;
        }

        if (existingBonds.SecTypeCode != updatedBonds.SecTypeCode)
        {
            existingBonds.SecTypeCode = updatedBonds.SecTypeCode;
            hasChanges = true;
        }

        if (existingBonds.Isin != updatedBonds.Isin)
        {
            existingBonds.Isin = updatedBonds.Isin;
            hasChanges = true;
        }

        if (existingBonds.AmountInIssue != updatedBonds.AmountInIssue)
        {
            existingBonds.AmountInIssue = updatedBonds.AmountInIssue;
            hasChanges = true;
        }

        if (existingBonds.YieldToWorst != updatedBonds.YieldToWorst)
        {
            existingBonds.YieldToWorst = updatedBonds.YieldToWorst;
            hasChanges = true;
        }

        if (existingBonds.UpdatedAt != updatedBonds.UpdatedAt)
        {
            existingBonds.UpdatedAt = updatedBonds.UpdatedAt;
            hasChanges = true;
        }

        return hasChanges;
    }

    private bool UpdatedFieldsBonds(WienerBoerseBondsModel existingBonds,
        WienerBoerseBondsModel updatedBonds)
    {
        bool hasChanges = false;
        if (existingBonds.Name != updatedBonds.Name)
        {
            existingBonds.Name = updatedBonds.Name;
            hasChanges = true;
        }

        if (existingBonds.Last != updatedBonds.Last)
        {
            existingBonds.Last = updatedBonds.Last;
            hasChanges = true;
        }

        if (existingBonds.Chg != updatedBonds.Chg)
        {
            existingBonds.Chg = updatedBonds.Chg;
            hasChanges = true;
        }

        if (existingBonds.Date != updatedBonds.Date)
        {
            existingBonds.Date = updatedBonds.Date;
            hasChanges = true;
        }

        if (existingBonds.Isin != updatedBonds.Isin)
        {
            existingBonds.Isin = updatedBonds.Isin;
            hasChanges = true;
        }

        if (existingBonds.Bid != updatedBonds.Bid)
        {
            existingBonds.Bid = updatedBonds.Bid;
            hasChanges = true;
        }

        if (existingBonds.Ask != updatedBonds.Ask)
        {
            existingBonds.Ask = updatedBonds.Ask;
            hasChanges = true;
        }

        if (existingBonds.Maturity != updatedBonds.Maturity)
        {
            existingBonds.Maturity = updatedBonds.Maturity;
            hasChanges = true;
        }

        if (existingBonds.Status != updatedBonds.Status)
        {
            existingBonds.Status = updatedBonds.Status;
            hasChanges = true;
        }

        if (existingBonds.Currency != updatedBonds.Currency)
        {
            existingBonds.Currency = updatedBonds.Currency;
            hasChanges = true;
        }

        if (existingBonds.UpdatedAt != updatedBonds.UpdatedAt)
        {
            existingBonds.UpdatedAt = updatedBonds.UpdatedAt;
            hasChanges = true;
        }

        return hasChanges;
    }

    private async Task<bool> AddBondsInDataBase(ApplicationContext dbContext, LjubljanaStockExchangeBondsModel bond)
    {
        var currencyRates =
            await dbContext.CurrencyRates.FirstOrDefaultAsync(c =>
                c.LetterCode == bond.Currency &&
                c.DateReceipt == DateOnly.FromDateTime(bond.UpdatedAt.Date));
        if (currencyRates == null)
        {
            logger.LogError($"Не удалось найти курс валюты, который указан в облигации {bond.Isin}");
            return false;
        }

        bond.CurrencyRatesId = currencyRates.Id;
        await dbContext.LjubljanaStockExchangeBonds.AddAsync(bond);
        await dbContext.SaveChangesAsync();
        return true;
    }

    private async Task<bool> AddBondsInDataBase(ApplicationContext dbContext, MoscowExchangeBondsModel bond)
    {
        var currencyRates =
            await dbContext.CurrencyRates.FirstOrDefaultAsync(c =>
                c.LetterCode == bond.FaceUnit &&
                c.DateReceipt == DateOnly.FromDateTime(bond.UpdatedAt.Date));
        if (currencyRates == null)
        {
            logger.LogError($"Не удалось найти курс валюты, который указан в облигации {bond.Isin}");
            return false;
        }

        bond.CurrencyRatesId = currencyRates.Id;
        await dbContext.MoscowExchangeBonds.AddAsync(bond);
        await dbContext.SaveChangesAsync();
        return true;
    }

    private async Task<bool> AddBondsInDataBase(ApplicationContext dbContext, SixGroupBondsModel bond)
    {
        var currencyRates =
            await dbContext.CurrencyRates.FirstOrDefaultAsync(c =>
                c.LetterCode == bond.TradingBaseCurrency &&
                c.DateReceipt == DateOnly.FromDateTime(bond.UpdatedAt.Date));
        if (currencyRates == null)
        {
            logger.LogError($"Не удалось найти курс валюты, который указан в облигации {bond.Isin}");
            return false;
        }

        bond.CurrencyRatesId = currencyRates.Id;
        await dbContext.SixGroupBonds.AddAsync(bond);
        await dbContext.SaveChangesAsync();
        return true;
    }

    private async Task<bool> AddBondsInDataBase(ApplicationContext dbContext, WienerBoerseBondsModel bond)
    {
        var currencyRates =
            await dbContext.CurrencyRates.FirstOrDefaultAsync(c =>
                c.LetterCode == bond.Currency &&
                c.DateReceipt == DateOnly.FromDateTime(bond.UpdatedAt.Date));
        if (currencyRates == null)
        {
            logger.LogError($"Не удалось найти курс валюты, который указан в облигации {bond.Isin}");
            return false;
        }

        bond.CurrencyRatesId = currencyRates.Id;
        await dbContext.WienerBoerseBonds.AddAsync(bond);
        await dbContext.SaveChangesAsync();
        return true;
    }
}