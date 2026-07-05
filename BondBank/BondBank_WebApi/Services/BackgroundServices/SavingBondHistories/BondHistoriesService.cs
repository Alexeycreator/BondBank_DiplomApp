using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Services.DataBaseContext;

namespace BondBank_WebApi.Services.BackgroundServices.SavingBondHistories;

public sealed class BondHistoriesService(ILogger<BondHistoriesService> logger)
{
    public async Task SaveBondsHistoriesAsync(
        ApplicationContext dbContext,
        List<LjubljanaStockExchangeBondsModel>? bondsLse,
        List<MoscowExchangeBondsModel>? bondsMe,
        List<SixGroupBondsModel>? bondsSg,
        List<WienerBoerseBondsModel>? bondsWb,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var historyEntries = new List<BondHistoryModel>();

            if (bondsLse != null && bondsLse.Any())
            {
                historyEntries.AddRange(bondsLse.Select(b => new BondHistoryModel
                {
                    Isin = b.Isin,
                    RecordedDate = today,
                    CurrencyRate = b.CurrencyRates?.Rate ?? 0,
                    BondPrice = b.NominalValue * b.CurrencyRates?.Rate ?? 0,
                    BondType = "lse"
                }));
            }

            if (bondsMe != null && bondsMe.Any())
            {
                historyEntries.AddRange(bondsMe.Select(b => new BondHistoryModel
                {
                    Isin = b.Isin,
                    RecordedDate = today,
                    CurrencyRate = b.CurrencyRates?.Rate ?? 0,
                    BondPrice = b.FaceValue * b.CurrencyRates?.Rate ?? 0,
                    BondType = "me"
                }));
            }

            if (bondsSg != null && bondsSg.Any())
            {
                historyEntries.AddRange(bondsSg.Select(b => new BondHistoryModel
                {
                    Isin = b.Isin,
                    RecordedDate = today,
                    CurrencyRate = b.CurrencyRates?.Rate ?? 0,
                    BondPrice = b.ClosingPrice * b.CurrencyRates?.Rate ?? 0,
                    BondType = "sg"
                }));
            }

            if (bondsWb != null && bondsWb.Any())
            {
                historyEntries.AddRange(bondsWb.Select(b => new BondHistoryModel
                {
                    Isin = b.Isin,
                    RecordedDate = today,
                    CurrencyRate = b.CurrencyRates?.Rate ?? 0,
                    BondPrice = b.Last * b.CurrencyRates?.Rate ?? 0,
                    BondType = "wb"
                }));
            }

            if (historyEntries.Any())
            {
                await dbContext.BondHistories.AddRangeAsync(historyEntries, cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);
                logger.LogInformation($"Сохранено {historyEntries.Count} записей в историю бондов");
            }
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка: {ex.Message}");
        }
    }
}