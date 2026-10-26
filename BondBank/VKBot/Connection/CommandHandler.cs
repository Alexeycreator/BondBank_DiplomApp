using Microsoft.Extensions.Logging;
using Shared.BotHelpers;
using VKBot.Services;

namespace VKBot.Connection;

public sealed class CommandHandler(
    ILogger<CommandHandler> logger,
    MethodsBot methodsBot,
    BotHealthChecker botHealthChecker)
{
    private string methodName;
    private string parameters;

    public async Task<string?> HandleAsync(string command, CancellationToken cancellationToken)
    {
        ParserCommand(command);
        var commandToExecute = CommandAnalysis();
        return await ExecutingCommand(commandToExecute, cancellationToken);
    }

    private void ParserCommand(string command)
    {
        var parts = command.Split('|');
        methodName = parts[0];
        parameters = parts.Length > 1 ? parts[1] : "";
    }

    private BotCommand CommandAnalysis()
    {
        return methodName switch
        {
            "Status" => BotCommand.Status,
            "ExecuteProgram" => BotCommand.ExecuteProgram,
            "ExecuteTask" => BotCommand.ExecuteTask,
            "Info" => BotCommand.Info,
            "Restart" => BotCommand.Restart,
            _ => throw new ArgumentOutOfRangeException(nameof(methodName), $"Неизвестная команда: {methodName}")
        };
    }

    private async Task<string?> ExecutingCommand(BotCommand command, CancellationToken cancellationToken)
    {
        switch (command)
        {
            case BotCommand.Status:
                return await botHealthChecker.GetStatusAsync();
            case BotCommand.ExecuteTask:
                methodsBot.SendMessageToUser(parameters);
                break;
            case BotCommand.ExecuteProgram:
                methodsBot.SendMessageToUser($"Запущено приложение {parameters} для получения облигаций");
                break;
            case BotCommand.Info:
                methodsBot.SendMessageToUser(parameters);
                break;
            case BotCommand.Error:
                break;
            case BotCommand.Restart:
                break;
            default:
                logger.LogError("Неизвестная команда: {MethodName}", methodName);
                break;
        }

        return null;
    }
}