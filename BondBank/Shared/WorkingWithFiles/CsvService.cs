using Microsoft.Extensions.Logging;

namespace Shared.WorkingWithFiles;

public class CsvService(ILogger<CsvService> logger, HttpClient httpClient)
{
    public void EnsureDirectoryExists(string directoryPath)
    {
        if (!Directory.Exists(directoryPath))
        {
            Directory.CreateDirectory(directoryPath);
        }
    }

    public async Task FileSendAsync(string csvFilePath, string urlWebService, string type)
    {
        try
        {
            if (!File.Exists(csvFilePath))
            {
                logger.LogWarning($"Файл не найден: {csvFilePath}");
                return;
            }

            var fullUrlToWebService = GetUrlByType(urlWebService, type);
            await SendAsync(csvFilePath, fullUrlToWebService);
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при отправке файла {csvFilePath} на {urlWebService}" + Environment.NewLine +
                            $"Ошибка: {ex.Message}");
        }
    }

    public string GetDate()
    {
        return DateTime.Now.ToString("yyyy-MM-dd");
    }

    private string GetUrlByType(string baseUrl, string type)
    {
        return type switch
        {
            "wb" => $"{baseUrl}?typeFile=WienerBoerse",
            "lse" => $"{baseUrl}?typeFile=LjubljanaStockExchange",
            "sg" => $"{baseUrl}?typeFile=SixGroup",
            "me" => $"{baseUrl}?typeFile=MoscowExchange",
            _ => $"{baseUrl}?typeFile=NotDefined"
        };
    }

    private async Task SendAsync(string csvFilePath, string urlWebService)
    {
        string fileName = Path.GetFileName(csvFilePath);
        using var formDataFile = new MultipartFormDataContent();
        await using var fileStream = File.OpenRead(csvFilePath);
        formDataFile.Add(new StreamContent(fileStream), "file", fileName);
        logger.LogInformation($"Отправка файла {fileName} по адресу: {urlWebService}");

        try
        {
            var responseFile = await httpClient.PostAsync(urlWebService, formDataFile);
            if (responseFile.IsSuccessStatusCode)
            {
                logger.LogInformation($"Файл {fileName} успешно отправлен. Ответ: {responseFile.StatusCode}");
            }
            else
            {
                var error = await responseFile.Content.ReadAsStringAsync();
                logger.LogWarning($"Ошибка отправки файла {fileName}. StatusCode: {responseFile.StatusCode}" +
                                  Environment.NewLine + $"Ошибка: {error}");
                throw new HttpRequestException($"Ошибка отправки: {responseFile.StatusCode}");
            }
        }
        catch (HttpRequestException ex)
        {
            logger.LogError($"{ex.Message}");
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка: {ex.Message}");
        }
    }
}