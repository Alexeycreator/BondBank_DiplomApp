using BondBank_WebApi.Models.DataBase;
using Shared.WorkingWithFiles;

namespace BondBank_WebApi.HelperMethods;

public sealed class CsvHelper(ILogger<CsvHelper> logger, CsvService csvServiceDll) : CsvWriter
{
    public void WhiteInFileCsv(string directoryPath, string fileName, List<CurrencyRatesModel> currencyRates)
    {
        try
        {
            csvServiceDll.EnsureDirectoryExists(directoryPath);
            string filePath = Path.Combine(directoryPath, fileName);
            logger.LogInformation($"Начало записи данных в файл");
            Write(filePath, currencyRates);
            logger.LogInformation($"Запись в файл прошла успешно");
        }
        catch (IOException ex)
        {
            logger.LogError($"Ошибка при записи в файл: {ex.Message}");
        }
    }
}