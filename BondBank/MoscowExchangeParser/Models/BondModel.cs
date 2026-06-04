using Newtonsoft.Json;

namespace MoscowExchangeParser.Models;

public sealed class BondModel
{
    [JsonProperty("securities")]
    public List<Bond> StateBonds { get; set; }

    [JsonProperty("securities.cursor")]
    public List<CursorBond> SecuritiesCursorBonds { get; set; }
}