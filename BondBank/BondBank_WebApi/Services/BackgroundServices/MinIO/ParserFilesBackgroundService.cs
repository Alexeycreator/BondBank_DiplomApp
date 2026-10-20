using System.Net;
using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Services.DataContext;
using Microsoft.EntityFrameworkCore;
using Shared.Services.MinIO;

namespace BondBank_WebApi.Services.BackgroundServices.MinIO;

public sealed class ParserFilesBackgroundService(
    ILogger<ParserFilesBackgroundService> logger,
    MinioStorageService minioService,
    IServiceScopeFactory serviceScopeFactory,
    HttpClient httpClient,
    IConfiguration configuration) : BackgroundService
{
    private readonly HashSet<string> folderPaths =
    [
        "rates", "bonds", "bonds/sg", "bonds/wb", "bonds/me", "bonds/lse", "history", "history/bonds",
        "history/portfolios"
    ];

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var isMinioAlive = await CheckMinioConnectionAsync(stoppingToken);
        if (!isMinioAlive)
        {
            logger.LogWarning("Сервер MinIO недоступен. Фоновый процесс обработки файлов не будет запущен.");
            return;
        }

        logger.LogInformation("Сервер MinIO доступен. Запуск фонового процесса...");
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = serviceScopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationContext>();

                await PushToDb(dbContext, stoppingToken);

                logger.LogInformation("Цикл обработки файлов завершен. Ожидание 5 минут...");
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Ошибка в фоновом процессе обработки файлов.");
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation($"Фоновый процесс обработки файлов с облака остановлен");
        await base.StopAsync(cancellationToken);
    }

    private async Task<bool> CheckMinioConnectionAsync(CancellationToken stoppingToken)
    {
        try
        {
            var minioEndpoint = configuration["Minio:Endpoint"] ?? "http://localhost:9000";
            var healthUrl = $"{minioEndpoint.TrimEnd('/')}/minio/health/live";

            logger.LogInformation("Проверка доступности MinIO по адресу: {Url}", healthUrl);
            var response = await httpClient.GetAsync(healthUrl, stoppingToken);
            return response.StatusCode == HttpStatusCode.OK;
        }
        catch (HttpRequestException)
        {
            return false;
        }
        catch (TaskCanceledException)
        {
            return false;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Неизвестная ошибка при проверке MinIO.");
            return false;
        }
    }

    private async Task PushToDb(ApplicationContext dbContext, CancellationToken stoppingToken)
    {
        var projectRoot = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
        var currencyRatesDir = configuration["StoragePaths:CurrencyRates"] ?? "CurrencyRates";
        var bondHistoriesDir = configuration["StoragePaths:BondHistories"] ?? "BondHistories";

        foreach (var folder in folderPaths)
        {
            try
            {
                var existingKeys = await dbContext.StoredFile
                    .Where(f => f.Folder == folder)
                    .Select(f => f.MinIoKey)
                    .ToHashSetAsync(stoppingToken);

                var files = await minioService.ListFilesWithInfoAsync(folder);
                int filesAddedCount = 0;

                foreach (var file in files)
                {
                    if (existingKeys.Contains(file.Key)) continue;

                    var fileNameWithPrefix = file.Key.Split('/').Last();
                    var originalName = fileNameWithPrefix.Split('_', 2).Last();

                    var storedFile = new StoredFileModel
                    {
                        OriginalFileName = originalName,
                        MinIoKey = file.Key,
                        ContentType = "text/csv",
                        Folder = folder,
                        SizeBytes = file.Size,
                        UploadedAt = file.LastModified,
                    };

                    storedFile.LocalPath = folder switch
                    {
                        "rates" => Path.Combine(projectRoot, currencyRatesDir, originalName),
                        "history/bonds" => Path.Combine(projectRoot, bondHistoriesDir, originalName),
                        _ => storedFile.LocalPath
                    };

                    dbContext.StoredFile.Add(storedFile);
                    filesAddedCount++;
                }

                if (filesAddedCount > 0)
                {
                    await dbContext.SaveChangesAsync(stoppingToken);
                    logger.LogInformation("Папка {Folder} обработана. Добавлено файлов: {Count}", folder,
                        filesAddedCount);
                }

                await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Ошибка при обработке папки {Folder}", folder);
            }
        }
    }
}