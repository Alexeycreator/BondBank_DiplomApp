using BondBank_WebApi.HelperMethods;
using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Services.DataBaseContext;
using Shared.WorkingWithFiles;

namespace BondBank_WebApi.Services.BackgroundServices.SavingBondHistories;

public sealed class BondHistoriesService(
    ILogger<BondHistoriesService> logger,
    CsvHelper csvHelper,
    CsvService csvServiceDll)
{
    private static readonly string dirPath = Path.Combine(Directory.GetCurrentDirectory(), "BondHistories");
    private string FileName => $"BondHistories_{csvServiceDll.GetDate()}.csv";

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
                WriteToCsv(historyEntries);
            }
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка: {ex.Message}");
        }
    }

    private void WriteToCsv(List<BondHistoryModel> bonds)
    {
        try
        {
            logger.LogInformation($"Начало записи в файл");
            csvHelper.WhiteInFileCsv(dirPath, FileName, bonds);
            logger.LogInformation($"Запись в файл прошла успешно");
        }
        catch (IOException ex)
        {
            logger.LogError($"Ошибка при записи в файл: {ex.Message}");
        }
    }
}