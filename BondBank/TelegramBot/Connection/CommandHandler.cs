using Microsoft.Extensions.Logging;
using Shared.BotHelpers;
using TelegramBot.Methods;
using TelegramBot.Services;

namespace TelegramBot.Connection;

public sealed class CommandHandler(
    ILogger<CommandHandler> logger,
    BotHealthChecker healthChecker,
    ParserRestarter restarter,
    BotMainMethods bot)
{
    public async Task<string?> HandleAsync(string command, CancellationToken cancellationToken)
    {
        var parts = command.Split('|');
        string methodName = parts[0];
        string parameters = parts.Length > 1 ? parts[1] : "";

        BotCommand commandsType = methodName switch
        {
            "Status" => BotCommand.Status,
            "ExecuteProgram" => BotCommand.ExecuteProgram,
            "ExecuteTask" => BotCommand.ExecuteTask,
            "Info" => BotCommand.Info,
            "Restart" => BotCommand.Restart,
            _ => throw new ArgumentOutOfRangeException(nameof(methodName), $"Неизвестная команда: {methodName}")
        };

        switch (commandsType)
        {
            case BotCommand.Status:
                return await healthChecker.GetStatusAsync(cancellationToken);
            case BotCommand.ExecuteTask:
                bot.SendMessageToUsers(parameters);
                break;
            case BotCommand.ExecuteProgram:
                bot.SendMessageToUsers($"Запущено приложение {parameters} для получения облигаций");
                break;
            case BotCommand.Info:
                bot.SendMessageToUsers(parameters);
                break;
            case BotCommand.Restart:
                await restarter.RestartAsync(parameters);
                break;
            default:
                logger.LogError("Неизвестная команда: {MethodName}", methodName);
                break;
        }

        return null;
    }
}