using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Logging;
using Shared.Config.MinIO;

namespace Shared.Services.MinIO;

public sealed class MinioStorageService
{
    private readonly IAmazonS3 s3Client;
    public readonly string bucketName;

    public MinioStorageService(MinioConfig settings)
    {
        // Берем имя бакета из настроек, если пусто - ставим дефолтное
        bucketName = string.IsNullOrEmpty(settings.BucketName)
            ? "bondbank-files"
            : settings.BucketName;

        var config = new AmazonS3Config
        {
            ServiceURL = settings.Endpoint,
            ForcePathStyle = true, // ⚠️ Критически важно для MinIO!
        };

        s3Client = new AmazonS3Client(settings.AccessKey, settings.SecretKey, config);
    }

    // ==================== ЗАГРУЗКА ====================
    private async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType,
        string folderPath = "")
    {
        // Генерируем уникальный ключ (путь) для файла, чтобы избежать перезаписи
        var key = string.IsNullOrEmpty(folderPath)
            ? $"{Guid.NewGuid()}_{fileName}"
            : $"{folderPath}/{Guid.NewGuid()}_{fileName}";

        var putRequest = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = key,
            InputStream = fileStream,
            ContentType = contentType,
            AutoCloseStream = true // Автоматически закроет поток после загрузки
        };

        await s3Client.PutObjectAsync(putRequest);

        // Возвращаем ключ, по которому файл сохранен в MinIO
        return key;
    }

    // ==================== УДАЛЕНИЕ ====================
    /// <summary>
    /// Удаляет файл из хранилища по его ключу (пути).
    /// </summary>
    /// <param name="key">Ключ файла (например, "rates/guid_file.csv")</param>
    public async Task DeleteFileAsync(string key)
    {
        var deleteRequest = new DeleteObjectRequest
        {
            BucketName = bucketName,
            Key = key
        };

        await s3Client.DeleteObjectAsync(deleteRequest);
    }

    // ==================== ПОЛУЧЕНИЕ СПИСКА ФАЙЛОВ ====================
    /// <summary>
    /// Получает список файлов (объектов) в хранилище. 
    /// Можно фильтровать по папке (префиксу).
    /// </summary>
    /// <param name="folderPath">Необязательный префикс (папка) для поиска</param>
    /// <returns>Список ключей (путей) файлов</returns>
    public async Task<List<string>> ListFilesAsync(string folderPath = "")
    {
        var request = new ListObjectsV2Request
        {
            BucketName = bucketName,
            Prefix = string.IsNullOrEmpty(folderPath) ? null : $"{folderPath}/"
        };

        var response = await s3Client.ListObjectsV2Async(request);

        var fileKeys = new List<string>();
        foreach (var s3Object in response.S3Objects)
        {
            fileKeys.Add(s3Object.Key);
        }

        return fileKeys;
    }
    
    public async Task<List<MinioFileInfo>> ListFilesWithInfoAsync(string folderPath = "")
    {
        var request = new ListObjectsV2Request
        {
            BucketName = bucketName,
            Prefix = string.IsNullOrEmpty(folderPath) ? null : $"{folderPath}/"
        };

        var response = await s3Client.ListObjectsV2Async(request);
    
        var files = new List<MinioFileInfo>();
        foreach (var s3Object in response.S3Objects)
        {
            files.Add(new MinioFileInfo
            {
                Key = s3Object.Key,
                Size = s3Object.Size,
                LastModified = s3Object.LastModified ?? DateTime.UtcNow
            });
        }

        return files;
    }

    // ==================== СКАЧИВАНИЕ ====================
    /// <summary>
    /// Скачивает файл из хранилища в поток (например, для отдачи пользователю).
    /// </summary>
    /// <param name="key">Ключ файла</param>
    /// <returns>Поток с содержимым файла</returns>
    public async Task<Stream> DownloadFileAsync(string key)
    {
        var getRequest = new GetObjectRequest
        {
            BucketName = bucketName,
            Key = key
        };

        var response = await s3Client.GetObjectAsync(getRequest);

        // Копируем поток в MemoryStream, чтобы можно было вернуть его после закрытия ответа
        var memoryStream = new MemoryStream();
        await response.ResponseStream.CopyToAsync(memoryStream);
        memoryStream.Position = 0; // Сбрасываем позицию в начало для чтения

        return memoryStream;
    }

    public async Task<bool> TryUploadFileFromPathAsync(string fullLocalPath, string fileName, string contentType,
        string folderPath, ILogger logger)
    {
        try
        {
            if (!File.Exists(fullLocalPath))
            {
                logger.LogWarning("Файл {FileName} не найден на диске по пути {Path}. Загрузка в MinIO отменена.",
                    fileName, fullLocalPath);
                return false;
            }

            await using var stream = new FileStream(fullLocalPath, FileMode.Open, FileAccess.Read);

            var fileKey = await UploadFileAsync(stream, fileName, contentType, folderPath);

            logger.LogInformation("Файл {FileName} успешно загружен в MinIO. Ключ: {FileKey}", fileName, fileKey);
            return true;
        }
        catch (AmazonS3Exception ex) when (ex.ErrorCode is "NoSuchKey" or "NoSuchBucket")
        {
            logger.LogError("Ошибка MinIO (Bucket/Key): {ExMessage}. Проверьте бакет '{BucketName}'.", ex.Message,
                bucketName);
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.Forbidden)
        {
            logger.LogError("Доступ к MinIO запрещен: {ExMessage}", ex.Message);
        }
        catch (AmazonS3Exception ex)
        {
            logger.LogError("Ошибка S3 при загрузке файла {FileName}: {ExMessage} (Code: {ExErrorCode})", fileName,
                ex.Message, ex.ErrorCode);
        }
        catch (Exception ex)
        {
            logger.LogError("Не удалось отправить файл {FileName} в MinIO: {ExMessage}", fileName, ex.Message);
        }

        return false;
    }
}