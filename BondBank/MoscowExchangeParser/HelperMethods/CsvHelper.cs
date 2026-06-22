using Microsoft.Extensions.Logging;
using MoscowExchangeParser.Models;
using Shared.WorkingWithFiles;

namespace MoscowExchangeParser.HelperMethods;

public sealed class CsvHelper(ILogger<CsvHelper> logger, CsvService csvServiceDll) : CsvWriter
{
    public void WhiteInFileCsv(string directoryPath, string fileName, List<Bond> bonds)
    {
        try
        {
            csvServiceDll.EnsureDirectoryExists(directoryPath);
            string filePath = Path.Combine(directoryPath, fileName);
            logger.LogInformation($"Начало записи данных в файл");
            Write(filePath, bonds);
            logger.LogInformation($"Запись в файл прошла успешно");
        }
        catch (IOException ex)
        {
            logger.LogError($"Ошибка при записи в файл: {ex.Message}");
        }
    }
}