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

    public async Task FileSendAsync(string csvPath, string urlWebService, string type)
    {
        try
        {
            if (!File.Exists(csvPath))
            {
                logger.LogWarning($"Файл не найден: {csvPath}");
                return;
            }

            var fullUrl = GetUrlByType(urlWebService, type);
            await SendAsync(csvPath, fullUrl, type);
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при отправке файла {csvPath} на {urlWebService}" + Environment.NewLine +
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
            "wb" => $"{baseUrl}/WienerBoerse",
            "lse" => $"{baseUrl}/LjubljanaStockExchange",
            "sg" => $"{baseUrl}/SixGroup",
            "me" => $"{baseUrl}/MoscowExchange",
            _ => $"{baseUrl}/NotDefined"
        };
    }

    private async Task SendAsync(string csvPath, string urlWebService, string type)
    {
        using var formDataFile = new MultipartFormDataContent();
        await using (var fileStream = File.OpenRead(csvPath))
        {
            var dateGet = GetDate();
            var fileName = $"bonds_{type}_{dateGet}.csv";

            formDataFile.Add(new StreamContent(fileStream), "file", fileName);
            formDataFile.Add(new StringContent(type), "typeFile");
            logger.LogInformation($"Отправка файла {fileName} по адресу: {urlWebService}");

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
    }
}