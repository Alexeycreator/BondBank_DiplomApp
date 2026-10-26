using Microsoft.Extensions.Logging;

namespace Shared.WorkingWithFiles;

/// <summary>
/// Предназначен для проверки существования директории и отправки сформированных csv файлов бондов на сервер
/// </summary>
/// <param name="logger">Зависимость для логирования</param>
/// <param name="httpClient">Зависимость для своего объекта HttpClient</param>
public class CsvService(ILogger<CsvService> logger, HttpClient httpClient)
{
    public void EnsureDirectoryExists(string directoryPath)
    {
        if (!Directory.Exists(directoryPath))
        {
            Directory.CreateDirectory(directoryPath);
        }
    }

    /// <summary>
    /// Предназначен для отправки сформированного файла бондов на сервер
    /// </summary>
    /// <param name="csvFilePath">Путь к файлу</param>
    /// <param name="urlWebService">'url' веб-сервера</param>
    /// <param name="type">Тип бондов</param>
    public async Task FileSendAsync(string csvFilePath, string urlWebService, string type)
    {
        try
        {
            if (!File.Exists(csvFilePath))
            {
                logger.LogWarning("Файл не найден: {CsvFilePath}", csvFilePath);
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
        
        // готовим файл для отправки на сервер
        using var formDataFile = new MultipartFormDataContent();
        await using var fileStream = File.OpenRead(csvFilePath);
        formDataFile.Add(new StreamContent(fileStream), "file", fileName);
        logger.LogInformation("Отправка файла {FileName} по адресу: {UrlWebService}", fileName, urlWebService);

        try
        {
            var responseFile = await httpClient.PostAsync(urlWebService, formDataFile);
            if (responseFile.IsSuccessStatusCode)
            {
                logger.LogInformation("Файл {FileName} успешно отправлен. Ответ: {ResponseFileStatusCode}", fileName, responseFile.StatusCode);
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
            logger.LogError("{ExMessage}", ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка: {ExMessage}", ex.Message);
        }
    }
}