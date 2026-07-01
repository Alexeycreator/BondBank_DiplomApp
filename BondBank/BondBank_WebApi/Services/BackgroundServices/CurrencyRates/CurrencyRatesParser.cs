using BondBank_WebApi.Models.DataBase;
using HtmlAgilityPack;
using Shared.BotHelpers;
using Shared.Config;
using Shared.Config.Bot;
using Shared.Services;

namespace BondBank_WebApi.Services.BackgroundServices.CurrencyRates;

/// <summary>
/// Предназначен для парсинга курсов валют
/// </summary>
/// <param name="logger">Зависимость для логирования</param>
public sealed class CurrencyRatesParser(ILogger<CurrencyRatesParser> logger)
{
    private static DateOnly GetTodayDate() => DateOnly.FromDateTime(DateTime.Now);

    private readonly string urlWebService =
        $"https://www.cbr.ru/currency_base/daily/?UniDbQuery.Posted=True&UniDbQuery.To={GetTodayDate()}";
    
    /// <summary>
    /// Получение курсов валют
    /// </summary>
    /// <param name="connectionMonitor">Проверка подключения к веб-ресурсу</param>
    /// <param name="botService">Возможность взаимодействия с ботом</param>
    /// <returns>Возвращаем либо null, либо сформированные данные</returns>
    public async Task<List<CurrencyRatesModel>?> GetCurrencyRatesAsync(ConnectionMonitor connectionMonitor,
        BotService botService)
    {
        try
        {
            List<CurrencyRatesModel> currencyRates = new List<CurrencyRatesModel>();
            var result = await ParsingCurrencyRatesAsync(connectionMonitor, currencyRates);
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка получения курсов валют: {ex.Message}");
            await botService.SendCommandToBotAsync(ConfigLoader.Instance.Bot.IpAddress, ConfigLoader.Instance.Bot.Port,
                BotCommand.Error, $"Неизвестная ошибка получения курсов валют: {ex.Message}");
            return null;
        }
    }

    /// <summary>
    /// Процесс парсинга курсов валют
    /// </summary>
    /// <param name="connectionMonitor">Проверка подключения к веб-ресурсу</param>
    /// <param name="currencyRates">Объект коллекции модели курсов валют</param>
    /// <returns>Возвращаем null, либо сформированные данные</returns>
    private async Task<List<CurrencyRatesModel>?> ParsingCurrencyRatesAsync(ConnectionMonitor connectionMonitor,
        List<CurrencyRatesModel> currencyRates)
    {
        logger.LogInformation($"Подключение к веб-сервису курсов валют...");
        if (!await connectionMonitor.ConnectionToDataAsync(urlWebService))
        {
            return null;
        }
        else
        {
            var content = connectionMonitor.ResponseContent();
            if (!string.IsNullOrEmpty(content))
            {
                logger.LogInformation($"Получен ответ от веб-сервиса курсов валют");
                return ProcessingResponseWebService(content, currencyRates);
            }
            else
            {
                logger.LogWarning($"Данные с адреса {urlWebService} пришли пустые");
                return null;
            }
        }
    }

    private List<CurrencyRatesModel>? ProcessingResponseWebService(string content, List<CurrencyRatesModel> currencyRates)
    {
        HtmlDocument document = new HtmlDocument();
        document.LoadHtml(content);
        var container = document?.GetElementbyId($"content");
        if (container != null)
        {
            var tableBody = container.ChildNodes.FindFirst("tbody").ChildNodes.Where(x => x.Name == "tr")
                .Skip(1)
                .ToArray();
            logger.LogInformation($"Данные курсов валют получены. Извлечение данных...");
            return FillingCurrencyRates(tableBody, currencyRates);
        }
        else
        {
            throw new ArgumentNullException(
                $"Не получилось получить данные контента страницы с Id = 'content'. Данного элемента не существует или он неверный");
        }
    }

    private List<CurrencyRatesModel>? FillingCurrencyRates(HtmlNode[] tableBody, List<CurrencyRatesModel> currencyRates)
    {
        try
        {
            foreach (var tableRow in tableBody)
            {
                var cellDigitalCode = tableRow.SelectSingleNode(".//td[1]").InnerText;
                var cellLetterCode = tableRow.SelectSingleNode(".//td[2]").InnerText;
                var cellUnits = tableRow.SelectSingleNode(".//td[3]").InnerText;
                var cellCurrency = tableRow.SelectSingleNode(".//td[4]").InnerText;
                var cellRate = tableRow.SelectSingleNode(".//td[5]").InnerText;
                currencyRates.Add(new CurrencyRatesModel()
                {
                    DigitalCode = Convert.ToInt32(cellDigitalCode),
                    LetterCode = cellLetterCode,
                    Units = Convert.ToInt32(cellUnits),
                    Currency = cellCurrency,
                    Rate = Convert.ToDecimal(cellRate),
                    DateReceipt = GetTodayDate()
                });
            }

            FillingCurrencyRatesDefaultMeaning(currencyRates);
            return currencyRates;
        }
        catch (FormatException ex)
        {
            logger.LogError($"Ошибка формата данных: {ex.Message}");
            return null;
        }
        catch (OverflowException ex)
        {
            logger.LogError($"Числовое переполнение: {ex.Message}");
            return null;
        }
        catch (NullReferenceException ex)
        {
            logger.LogError($"Не найдена ячейка таблицы: {ex.Message}");
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка: {ex.Message}");
            return null;
        }
    }

    private void FillingCurrencyRatesDefaultMeaning(List<CurrencyRatesModel> currencyRates)
    {
        currencyRates.Add(new CurrencyRatesModel()
        {
            DigitalCode = 643,
            LetterCode = "RUB",
            Units = 1,
            Currency = "Российский рубль",
            Rate = 1,
            DateReceipt = GetTodayDate()
        });
    }
}