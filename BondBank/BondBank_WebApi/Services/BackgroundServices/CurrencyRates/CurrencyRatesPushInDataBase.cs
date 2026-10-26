using System.Data.Common;
using System.Diagnostics.CodeAnalysis;
using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Services.DataContext;
using Microsoft.EntityFrameworkCore;

namespace BondBank_WebApi.Services.BackgroundServices.CurrencyRates;

/// <summary>
/// Предназначен для отправки сформированных курсов валют в БД
/// </summary>
/// <param name="logger">Зависимость для логирования</param>
public sealed class CurrencyRatesPushInDataBase(ILogger<CurrencyRatesPushInDataBase> logger)
{
    public async Task PushingInDataBase(ApplicationContext dbContext, List<CurrencyRatesModel> currencyRates)
    {
        try
        {
            bool isConnectedToDataBase = await dbContext.Database.CanConnectAsync();
            if (isConnectedToDataBase)
            {
                logger.LogInformation($"Подключение к БД прошло успешно");
                if (!currencyRates.Any())
                {
                    logger.LogError($"Данные о курсах валют пустые и не могут быть добавлены в БД");
                }
                else
                {
                    int countUpdatedCurrency = 0;
                    int countAddedCurrency = 0;
                    foreach (var currency in currencyRates)
                    {
                        var existingCurrency = dbContext.CurrencyRates.FirstOrDefault(c =>
                            c.LetterCode == currency.LetterCode && c.DateReceipt == currency.DateReceipt);
                        if (existingCurrency == null)
                        {
                            await dbContext.CurrencyRates.AddAsync(currency);
                            countAddedCurrency++;
                        }
                        else
                        {
                            if (UpdatedFieldsCurrencyRates(existingCurrency, currency))
                            {
                                dbContext.Entry(existingCurrency).State = EntityState.Modified;
                                countUpdatedCurrency++;
                            }
                        }
                    }

                    await dbContext.SaveChangesAsync();
                    logger.LogInformation(
                        $"Обработано валют: {currencyRates.Count} (добавлено: {countAddedCurrency}, обновлено: {countUpdatedCurrency})" +
                        Environment.NewLine + $"Все данные успешно сохранены в БД");
                }
            }
        }
        catch (DbUpdateException ex)
        {
            logger.LogError("Ошибка при сохранении в БД: {ExMessage}", ex.Message);
        }
        catch (DbException ex)
        {
            logger.LogError("Не получилось установить соединение с БД: {ExMessage}", ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка: {ExMessage}", ex.Message);
        }
    }

    private bool UpdatedFieldsCurrencyRates(CurrencyRatesModel existingCurrency, CurrencyRatesModel updatedCurrency)
    {
        bool hasChanges = false;
        if (existingCurrency.DigitalCode != updatedCurrency.DigitalCode)
        {
            existingCurrency.DigitalCode = updatedCurrency.DigitalCode;
            hasChanges = true;
        }

        if (existingCurrency.Units != updatedCurrency.Units)
        {
            existingCurrency.Units = updatedCurrency.Units;
            hasChanges = true;
        }

        if (existingCurrency.Currency != updatedCurrency.Currency)
        {
            existingCurrency.Currency = updatedCurrency.Currency;
            hasChanges = true;
        }

        if (existingCurrency.Rate != updatedCurrency.Rate)
        {
            existingCurrency.Rate = updatedCurrency.Rate;
            hasChanges = true;
        }

        return hasChanges;
    }
}