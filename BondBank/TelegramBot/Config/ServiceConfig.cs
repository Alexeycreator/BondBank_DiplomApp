namespace TelegramBot.Config;

public sealed class ServiceConfig : Shared.Config.ServiceConfig
{
    public BotConfig Bot { get; set; } = new();
}