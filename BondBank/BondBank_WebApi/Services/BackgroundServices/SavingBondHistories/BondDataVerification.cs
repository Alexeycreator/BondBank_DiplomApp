using System.Data.Common;
using BondBank_WebApi.Services.DataBaseContext;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BondBank_WebApi.Services.BackgroundServices.SavingBondHistories;

public sealed class BondDataVerification(ILogger<BondDataVerification> logger)
{
    public async Task CheckingBondsData(ApplicationContext dbContext, BondHistoriesService bondHistories,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var bondsLse = await dbContext.LjubljanaStockExchangeBonds
                .Include(b => b.CurrencyRates)
                .ToListAsync(cancellationToken);
            var bondsMe = await dbContext.MoscowExchangeBonds
                .Include(b => b.CurrencyRates)
                .ToListAsync(cancellationToken);
            var bondsSg = await dbContext.SixGroupBonds
                .Include(b => b.CurrencyRates)
                .ToListAsync(cancellationToken);
            var bondsWb = await dbContext.WienerBoerseBonds
                .Include(b => b.CurrencyRates)
                .ToListAsync(cancellationToken);

            if (bondsLse.Any() || bondsMe.Any() || bondsSg.Any() || bondsWb.Any())
            {
                await bondHistories.SaveBondsHistoriesAsync(dbContext, bondsLse, bondsMe, bondsSg, bondsWb,
                    cancellationToken);
            }
            else
            {
                logger.LogWarning($"Данных о бондах еще нет");
            }
        }
        catch (NpgsqlException ex)
        {
            logger.LogError($"Ошибка PostgreSQL: {ex.Message}. Код: {ex.SqlState}");
        }
        catch (DbException ex)
        {
            logger.LogError($"Ошибка при работе с БД: {ex.Message}");
        }
    }
}