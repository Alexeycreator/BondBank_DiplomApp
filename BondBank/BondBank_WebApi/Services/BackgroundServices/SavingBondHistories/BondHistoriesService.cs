using BondBank_WebApi.HelperMethods;
using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Services.DataBaseContext;
using Microsoft.EntityFrameworkCore;
using Shared.WorkingWithFiles;
using BondsBaseModel = BondBank_WebApi.Models.DataBase.BondsBaseModel;

namespace BondBank_WebApi.Services.BackgroundServices.SavingBondHistories;

/// <summary>
/// Предназначен для формирования данных в БД об истории бондов
/// </summary>
/// <param name="logger">Логирование</param>
/// <param name="csvHelper">Для корректной работы с файлами CSV</param>
/// <param name="csvServiceDll">Для корректной работы с файлами CSV</param>
public sealed class BondHistoriesService(
    ILogger<BondHistoriesService> logger,
    CsvHelper csvHelper,
    CsvService csvServiceDll)
{
    private static readonly string dirPath = Path.Combine(Directory.GetCurrentDirectory(), "BondHistories");
    private string FileName => $"BondHistories_{csvServiceDll.GetDate()}.csv";

    /// <summary>
    /// Метод сохранения данных
    /// </summary>
    /// <param name="dbContext">Контекст БД</param>
    /// <param name="bondsLse">Бонды Lse</param>
    /// <param name="bondsMe">Бонды Me</param>
    /// <param name="bondsSg">Бонды Sg</param>
    /// <param name="bondsWb">Бонды Wb</param>
    /// <param name="cancellationToken">Токен отмены работы</param>
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

            var allBondsWithType = new List<(BondsBaseModel Bond, string Type)>();

            // создаем кортеж общего класса и указываем тип бонда
            if (bondsLse != null && bondsLse.Any())
            {
                allBondsWithType.AddRange(bondsLse.Select(b => (b as BondsBaseModel, "lse")));
            }

            if (bondsMe != null && bondsMe.Any())
            {
                allBondsWithType.AddRange(bondsMe.Select(b => (b as BondsBaseModel, "me")));
            }

            if (bondsSg != null && bondsSg.Any())
            {
                allBondsWithType.AddRange(bondsSg.Select(b => (b as BondsBaseModel, "sg")));
            }

            if (bondsWb != null && bondsWb.Any())
            {
                allBondsWithType.AddRange(bondsWb.Select(b => (b as BondsBaseModel, "wb")));
            }

            // проверяем существование бондов за сегодня, фильтруем только новые записи
            var existingIsins = await dbContext.BondHistories
                .Where(h => h.RecordedDate == today && h.Isin != null)
                .Select(h => h.Isin)
                .ToHashSetAsync(cancellationToken);

            var newBonds = allBondsWithType
                .Where(item => !existingIsins.Contains(item.Bond.Isin))
                .ToList();

            if (!newBonds.Any())
            {
                logger.LogInformation($"Новых записей для сохранения нет. Сегодня: {today}");
                return;
            }

            // добавляем записи в историю бондов
            var historyEntries = newBonds.Select(item => new BondHistoryModel
            {
                Isin = item.Bond.Isin,
                RecordedDate = today,
                BondType = item.Type,
                CurrencyRate = GetCurrencyRate(item.Bond),
                BondPrice = GetBondPrice(item.Bond, item.Type)
            }).ToList();
            
            await dbContext.BondHistories.AddRangeAsync(historyEntries, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            logger.LogInformation($"Сохранено {historyEntries.Count} записей в историю бондов");
            WriteToCsv(historyEntries);
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка: {ex.Message}");
        }
    }
    
    private decimal GetCurrencyRate(BondsBaseModel bond)
    {
        return bond.CurrencyRates?.Rate ?? 0;
    }

    private decimal GetBondPrice(BondsBaseModel bond, string type)
    {
        var rate = bond.CurrencyRates?.Rate ?? 0;
        return type switch
        {
            "lse" => (bond as LjubljanaStockExchangeBondsModel)?.NominalValue * rate ?? 0,
            "me" => (bond as MoscowExchangeBondsModel)?.FaceValue * rate ?? 0,
            "sg" => (bond as SixGroupBondsModel)?.ClosingPrice * rate ?? 0,
            "wb" => (bond as WienerBoerseBondsModel)?.Last * rate ?? 0,
            _ => 0
        };
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