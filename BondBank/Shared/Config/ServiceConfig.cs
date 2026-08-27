using Shared.Config.Bot;
using Shared.Config.WebService;

namespace Shared.Config;

public class ServiceConfig
{
    public BotConfig BotTelegram { get; set; } = new();
    public BotConfig BotVk { get; set; } = new();
    public WebServiceConfig WebService { get; set; } = new();
}