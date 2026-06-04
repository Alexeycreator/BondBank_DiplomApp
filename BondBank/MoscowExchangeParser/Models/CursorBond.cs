using Newtonsoft.Json;

namespace MoscowExchangeParser.Models;

public sealed class CursorBond
{
    [JsonProperty("TOTAL")]
    public string Total { get; set; }
}