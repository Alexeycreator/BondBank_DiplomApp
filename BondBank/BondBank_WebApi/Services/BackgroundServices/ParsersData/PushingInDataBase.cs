using System.Data.Common;
using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Services.DataBaseContext;
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
            existingBonds.NominalValue = updatedBonds.NominalValue;
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
        return true;
    }

    public async Task Push(ApplicationContext dbContext, List<MoscowExchangeBondsModel> bonds)
    {
        try
        {
            if (await CheckConnectToDataBase(dbContext))
            {
                logger.LogInformation($"Подключение к БД прошло успешно");
            }
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
            if (await CheckConnectToDataBase(dbContext))
            {
                logger.LogInformation($"Подключение к БД прошло успешно");
            }
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
            if (await CheckConnectToDataBase(dbContext))
            {
                logger.LogInformation($"Подключение к БД прошло успешно");
            }
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
}