using System.Data.Common;
using BondBank_WebApi.Services.DataBaseContext;
using Microsoft.EntityFrameworkCore;

namespace BondBank_WebApi.Services.Analysis;

public sealed class AnalysisData(ILogger<AnalysisData> logger, IServiceScopeFactory serviceScopeFactory)
{
    private const int MinDotsForAnalysis = 4;
    private const int RankForAnalysis = 4;

    /// <summary>
    /// Метод для прогнозирования данных на несколько дней вперед
    /// </summary>
    /// <returns>Возвращает результат прогноза в виде словаря данных (isin, значения)</returns>
    public async Task<Dictionary<string, double[]>> DataForecastingAsync()
    {
        try
        {
            using var scope = serviceScopeFactory.CreateScope();
            var bondsHistory = scope.ServiceProvider.GetRequiredService<BondsHistoryDictionary>();
            await FillDictionaryFromDatabaseAsync(scope, bondsHistory);

            if (!bondsHistory.bondsHistory.Any())
            {
                logger.LogWarning("Словарь пуст. Нет данных для прогноза.");
                return new Dictionary<string, double[]>();
            }

            // создаем новый словарь для данных о прогнозе и заполняем его
            var result = new Dictionary<string, double[]>();
            foreach (var isin in bondsHistory.bondsHistory.Keys)
            {
                var forecast = await ForecastBondAsync(bondsHistory, isin);
                if (forecast != null)
                {
                    result[isin] = forecast;
                }
            }

            return result;
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка: {ex.Message}");
            return new Dictionary<string, double[]>();
        }
    }

    private async Task FillDictionaryFromDatabaseAsync(IServiceScope scope, BondsHistoryDictionary bondsHistory)
    {
        try
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationContext>();
            var bonds = await dbContext.BondHistories.OrderBy(b => b.RecordedDate).ToListAsync();
            bondsHistory.ClearCache();

            foreach (var bond in bonds)
            {
                if (string.IsNullOrEmpty(bond.Isin))
                {
                    continue;
                }

                bondsHistory.AddBondHistory(bond.Isin, bond);
            }

            logger.LogInformation($"Загружено {bondsHistory.bondsHistory.Count} значений в словарь");
        }
        catch (DbException ex)
        {
            logger.LogError($"Ошибка при работе с БД: {ex.Message}. Code Exception: {ex.ErrorCode}");
        }
    }

    /// <summary>
    /// Метод для формирования данных прогнозирования
    /// </summary>
    /// <param name="bondsHistory">Передаем для работы с классом словаря и его методами</param>
    /// <param name="isin">Ключ для нахождения значений в таблице</param>
    /// <param name="forecastSteps">Сколько элементов надо просчитать</param>
    /// <returns>Возвращает прогнозированные данные</returns>
    private async Task<double[]?> ForecastBondAsync(BondsHistoryDictionary bondsHistory, string isin,
        int forecastSteps = 2)
    {
        try
        {
            var history = bondsHistory.GetBondHistory(isin);
            if (!history.Any())
            {
                logger.LogWarning($"Нет данных для прогноза по ISIN ({isin})");
                return null;
            }

            // создаем массив с нужными данными для прогноза (так как библиотека требует именно double[])
            var prices = history.OrderBy(h => h.RecordedDate).Select(h => (double)(h.BondPrice * h.CurrencyRate))
                .ToArray();
            if (prices.Length < MinDotsForAnalysis)
            {
                logger.LogWarning(
                    $"Недостаточно данных для прогноза по ISIN ({isin}). Нужно минимум {MinDotsForAnalysis} точки(ек)");
                return null;
            }

            /*
             * RankForAnalysis - константа, которая определяет ранг прогнозирования
             * Его надо определять самому, так как число элементов может быть разным
             * И шум может влиять на расчет, надо подбирать данное значение
             * Обычно это 2 или 4
             */

            var window = Math.Min(prices.Length / RankForAnalysis, 10);

            alglib.ssacreate(out var ssaModel);
            alglib.ssasetwindow(ssaModel, window);
            alglib.ssaaddsequence(ssaModel, prices);
            alglib.ssasetalgotopkdirect(ssaModel, 2);

            alglib.ssaforecastlast(ssaModel, forecastSteps, out double[] forecast);

            logger.LogInformation(
                $"Прогноз для {isin} выполнен. История: {prices.Length} точек. Прогноз: {forecast.Length} точек");

            return forecast;
        }
        catch (IndexOutOfRangeException ex)
        {
            logger.LogError($"Ошибка при создании массива: {ex.Message}");
            return null;
        }
        catch (alglib.alglibexception ex)
        {
            logger.LogError($"Ошибка ALGLIB: {ex.msg}");
            return null;
        }
    }
}