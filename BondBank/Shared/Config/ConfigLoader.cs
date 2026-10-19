using System.Text.Json;
using DotNetEnv;
using Shared.Config.Bot;
using Shared.Config.MinIO;
using Shared.Config.WebService;

namespace Shared.Config;

/// <summary>
/// Предназначен для считывания конфигурации бота или веб-сервиса (ip-адрес, port)
/// </summary>
public sealed class ConfigLoader
{
    private static ServiceConfig? instance;
    private static readonly object _lock = new();

    public static ServiceConfig Instance
    {
        get
        {
            if (instance != null) return instance;
            lock (_lock)
            {
                instance ??= Load();
            }

            return instance;
        }
    }

    /// <summary>
    /// Отвечает за загрузку файла конфигурации
    /// </summary>
    /// <returns>Возвращает объект конфигурации, который нужен (бот или веб-сервис)</returns>
    private static ServiceConfig Load()
    {
        Env.Load();
        var config = LoadFromEnvironment();
        if (config == null)
        {
            config = LoadFromJsonFile();
        }

        return config ?? new ServiceConfig();
    }

    private static ServiceConfig? LoadFromEnvironment()
    {
        var telegramIp = Environment.GetEnvironmentVariable("BOT_TELEGRAM_IP_ADDRESS");
        var telegramPort = Environment.GetEnvironmentVariable("BOT_TELEGRAM_PORT");
        var vkIp = Environment.GetEnvironmentVariable("BOT_VK_IP_ADDRESS");
        var vkPort = Environment.GetEnvironmentVariable("BOT_VK_PORT");
        var webHost = Environment.GetEnvironmentVariable("WEB_SERVICE_HOST");
        var webPort = Environment.GetEnvironmentVariable("WEB_SERVICE_PORT");
        var minioEndpoint = Environment.GetEnvironmentVariable("MINIO_ENDPOINT");
        var minioAccessKey = Environment.GetEnvironmentVariable("MINIO_ACCESS_KEY");
        var minioSecretKey = Environment.GetEnvironmentVariable("MINIO_SECRET_KEY");
        var minioBucketName = Environment.GetEnvironmentVariable("MINIO_BUCKET_NAME");

        // Если хотя бы одно значение есть — используем .env
        if (telegramIp == null && vkIp == null && webHost == null)
        {
            return null;
        }

        return new ServiceConfig
        {
            BotTelegram = new BotConfig
            {
                IpAddress = telegramIp ?? "localhost",
                Port = int.TryParse(telegramPort, out var tp) ? tp : 8888
            },
            BotVk = new BotConfig
            {
                IpAddress = vkIp ?? "localhost",
                Port = int.TryParse(vkPort, out var vp) ? vp : 7777
            },
            WebService = new WebServiceConfig
            {
                Host = webHost ?? "localhost",
                Port = int.TryParse(webPort, out var wp) ? wp : 7240
            },
            MinIo = new MinioConfig()
            {
                AccessKey =  minioAccessKey ?? "admin_mio",
                SecretKey = minioSecretKey ?? "admin_mio",
                BucketName = minioBucketName ?? "bondbank-files",
                Endpoint = minioEndpoint ?? "http://localhost:9000"
            }
        };
    }

    private static ServiceConfig? LoadFromJsonFile()
    {
        var configPath = GetConfigPath();

        if (!File.Exists(configPath))
        {
            return new ServiceConfig();
        }

        var jsonBytes = File.ReadAllBytes(configPath);
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            ReadCommentHandling = JsonCommentHandling.Skip,
            AllowTrailingCommas = true
        };

        return JsonSerializer.Deserialize<ServiceConfig>(jsonBytes, options);
    }

    /// <summary>
    /// Предназначен для формирования пути к файлу конфигурации
    /// </summary>
    /// <returns>Возвращает полный путь к файлу конфигурации</returns>
    private static string GetConfigPath()
    {
        var envPath = Environment.GetEnvironmentVariable("CONFIG_PATH");
        if (!string.IsNullOrEmpty(envPath) && File.Exists(envPath))
        {
            return envPath;
        }

        var localPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "config.json");
        if (File.Exists(localPath))
        {
            return localPath;
        }

        /*
        передаем информацию о том, где находится файл конфигурации
        - если он существует - возвращаем его полный путь
        - если не существует - возвращаем файл 'config'
        */
        var sharedPath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory,
            "..", "..", "..", "config.json"));
        return File.Exists(sharedPath) ? Path.GetFullPath(sharedPath) : "config.json";
    }
}