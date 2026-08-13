using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Services.Analysis;

public sealed class BondsHistoryDictionary(ILogger<BondsHistoryDictionary> logger)
{
    public Dictionary<string, List<BondHistoryModel>> bondsHistory = new Dictionary<string, List<BondHistoryModel>>();

    public List<BondHistoryModel> GetBondHistory(string isin)
    {
        logger.LogInformation($"Получение облигации по ISIN ({isin})");
        return bondsHistory.TryGetValue(isin, out var history)
            ? history
            : new List<BondHistoryModel>();
    }

    public void AddBondHistory(string isin, BondHistoryModel bond)
    {
        if (!bondsHistory.ContainsKey(isin))
        {
            logger.LogInformation($"Данного ISIN ({isin}) нет в словаре");
            bondsHistory[isin] = new List<BondHistoryModel>();
            logger.LogInformation($"Создана новая коллекция для ISIN ({isin})");
        }

        bondsHistory[isin].Add(bond);
        logger.LogInformation($"Данные для ISIN ({isin}) добавлены в словарь");
    }

    public void ClearCache()
    {
        bondsHistory.Clear();
        logger.LogInformation($"Кэш очищен");
    }
}