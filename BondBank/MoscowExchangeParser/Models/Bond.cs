using Newtonsoft.Json;
using Shared.Models;

namespace MoscowExchangeParser.Models;

public sealed class Bond : BondBase
{
    [JsonProperty("SECURITY_TYPE")]
    public string SecurityType { get; set; }
    
    [JsonProperty("SECURITY_TYPE_ID")]
    public string SecurityTypeId { get; set; }
    
    [JsonProperty("TYPE")]
    public string Type { get; set; }
    
    [JsonProperty("SECID")]
    public string SecId { get; set; }
    
    [JsonProperty("SHORTNAME")]
    public string ShortName { get; set; }
    
    [JsonProperty("REGNUMBER")]
    public string RegNumber { get; set; }
    
    [JsonProperty("IS_TRADED")]
    public string IsTraded { get; set; }
    
    [JsonProperty("PRIMARY_BOARDID")]
    public string PrimaryBoardId { get; set; }
    
    [JsonProperty("MARKET")]
    public string Market { get; set; }
    
    [JsonProperty("ENGINE")]
    public string Engine { get; set; }
    
    [JsonProperty("FACEVALUE")]
    public string FaceValue { get; set; }
    
    [JsonProperty("FACEUNIT")]
    public string FaceUnit { get; set; }
}