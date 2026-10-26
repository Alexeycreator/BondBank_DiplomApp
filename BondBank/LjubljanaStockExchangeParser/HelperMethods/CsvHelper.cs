using LjubljanaStockExchangeParser.Models;
using Microsoft.Extensions.Logging;
using Shared.Config;
using Shared.WorkingWithFiles;

namespace LjubljanaStockExchangeParser.HelperMethods;

public sealed class CsvHelper(ILogger<CsvHelper> logger, CsvService csvServiceDll) : CsvWriter
{
    public void WhiteInFileCsv(string directoryPath, string fileName, List<BondModel> bonds)
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
            logger.LogError("Ошибка при записи в файл: {ExMessage}", ex.Message);
        }
    }
    
    public async Task SendFileOnWebServer(string directoryPath, string fileName)
    {
        var configWebService = ConfigLoader.Instance.WebService;
        var protocol = configWebService.Protocol ?? "https";
        var host = configWebService.Host ?? "localhost";
        var port = configWebService.Port ?? 7240;
        var urlWebService = $"{protocol}://{host}:{port}/api/ExportImportFiles/import-bonds";
        string filePath = Path.Combine(directoryPath, fileName);
        await csvServiceDll.FileSendAsync(filePath, urlWebService, "lse");
    }
}