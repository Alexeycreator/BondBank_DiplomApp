namespace VKBot.Config;

public sealed class BotConfig
{
    public string AccessToken { get; set; } = string.Empty;
    public long AdminId { get; set; }
    public ulong GroupId { get; set; }
    public HashSet<long> UsersId { get; set; } = new HashSet<long>();
}