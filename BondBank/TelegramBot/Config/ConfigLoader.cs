using System.Text.Json;

namespace TelegramBot.Config;

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

    private static string GetConfigPath()
    {
        var envPath = Environment.GetEnvironmentVariable("CONFIG_PATH");
        if (!string.IsNullOrEmpty(envPath) && File.Exists(envPath))
        {
            return envPath;
        }

        var localPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "bot_config.json");
        if (File.Exists(localPath))
        {
            return localPath;
        }

        var configPath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, 
            "..", "..", "..", "Config", "bot_config.json"));
        return File.Exists(configPath) ? Path.GetFullPath(configPath) : "bot_config.json";
    }
}