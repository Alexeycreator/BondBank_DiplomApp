using System.Diagnostics;
using Microsoft.Extensions.Logging;
using TelegramBot.Methods;

namespace TelegramBot.Services;

public sealed class ParserRestarter(
    ILogger<ParserRestarter> logger,
    BotMainMethods bot)
{
    private readonly Dictionary<string, string> parserPaths = new()
    {
        ["WeinerBoerseParser"] = "WeinerBoerseParser.exe",
        ["LjubljanaStockExchangeParser"] = "LjubljanaStockExchangeParser.exe",
        ["MoscowExchangeParser"] = "MoscowExchangeParser.exe",
        ["SixGroupParser"] = "SixGroupParser.exe"
    };

    public async Task RestartAsync(string parserName)
    {
        if (!parserPaths.TryGetValue(parserName, out var parserExe))
        {
            logger.LogWarning("Парсер {ParserName} не найден в конфигурации", parserName);
            return;
        }

        var parserPath = FindParserPath(parserName, parserExe);

        if (File.Exists(parserPath))
        {
            StartParser(parserPath, parserName);
        }
        else
        {
            logger.LogError("Не найден исполняемый файл парсера {ParserName} по пути {ParserPath}", parserName, parserPath);
            bot.SendMessageToUsers($"Ошибка: не найден парсер {parserName}");
        }
    }

    private string FindParserPath(string parserName, string parserExe)
    {
        var baseDir = AppDomain.CurrentDomain.BaseDirectory;

        var paths = new[]
        {
            Path.Combine(baseDir, "Parsers", parserExe),
            Path.GetFullPath(Path.Combine(baseDir, "..", "..", "..", parserName, "bin", "Debug", "net9.0", parserExe)),
            Path.Combine(baseDir, parserExe)
        };

        return paths.FirstOrDefault(File.Exists) ?? paths[0];
    }

    private void StartParser(string parserPath, string parserName)
    {
        var psi = new ProcessStartInfo
        {
            FileName = parserPath,
            UseShellExecute = true,
            CreateNoWindow = false,
            WindowStyle = ProcessWindowStyle.Normal
        };

        Process.Start(psi);
        logger.LogInformation("Парсер {ParserName} запущен: {ParserPath}", parserName, parserPath);
        bot.SendMessageToUsers($"Парсер {parserName} запущен");
    }
}