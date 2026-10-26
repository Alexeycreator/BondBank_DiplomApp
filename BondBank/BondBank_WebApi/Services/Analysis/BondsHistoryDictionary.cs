using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Services.Analysis;

public sealed class BondsHistoryDictionary(ILogger<BondsHistoryDictionary> logger)
{
    public Dictionary<string, List<BondHistoryModel>> bondsHistory = new Dictionary<string, List<BondHistoryModel>>();

    public List<BondHistoryModel> GetBondHistory(string isin)
    {
        logger.LogInformation("Получение облигации по ISIN ({Isin})", isin);
        return bondsHistory.TryGetValue(isin, out var history)
            ? history
            : new List<BondHistoryModel>();
    }

    public void AddBondHistory(string isin, BondHistoryModel bond)
    {
        if (!bondsHistory.ContainsKey(isin))
        {
            logger.LogInformation("Данного ISIN ({Isin}) нет в словаре", isin);
            bondsHistory[isin] = new List<BondHistoryModel>();
            logger.LogInformation("Создана новая коллекция для ISIN ({Isin})", isin);
        }

        bondsHistory[isin].Add(bond);
        logger.LogInformation("Данные для ISIN ({Isin}) добавлены в словарь", isin);
    }

    public void ClearCache()
    {
        bondsHistory.Clear();
        logger.LogInformation($"Кэш очищен");
    }
}