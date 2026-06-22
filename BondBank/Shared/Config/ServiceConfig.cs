using Shared.Config.Bot;
using Shared.Config.WebService;

namespace Shared.Config;

public class ServiceConfig
{
    public BotConfig Bot { get; set; } = new();
    public WebServiceConfig WebService { get; set; } = new();
}