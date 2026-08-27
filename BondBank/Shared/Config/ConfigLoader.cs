using System.Text.Json;

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

        var config = JsonSerializer.Deserialize<ServiceConfig>(jsonBytes, options);

        return config ?? new ServiceConfig();
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