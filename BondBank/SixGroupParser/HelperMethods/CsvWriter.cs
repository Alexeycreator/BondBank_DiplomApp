using System.Text;
using SixGroupParser.Models;

namespace SixGroupParser.HelperMethods;

public class CsvWriter
{
    protected void Write(string csvPath, List<BondModel> bonds)
    {
        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.AppendLine(
            $"Name;ValorId;TradingBaseCurrency;CouponRate;MaturityDate;ClosingPrice;ClosingPerfomance;BidPrice;AskPrice;MarketTime;MarketDate;IssuerNameFull;ProductLine;IndustrySectorCode;SecTypeCode;Isin;AmountInIssue;YieldToWorst;UpdatedAt;");
        foreach (var bond in bonds)
        {
            csvBuilder.AppendLine(
                $"{bond.Name};{bond.ValorId};{bond.TradingBaseCurrency};{bond.CouponRate};{bond.MaturityDate};{bond.ClosingPrice};{bond.ClosingPerfomance};{bond.BidPrice};{bond.AskPrice};{bond.MarketTime};{bond.MarketDate};{bond.IssuerNameFull};{bond.ProductLine};{bond.IndustrySectorCode};{bond.SecTypeCode};{bond.Isin};{bond.AmountInIssue};{bond.YieldToWorst};{bond.UpdatedAt};");
        }

        File.WriteAllText(csvPath, csvBuilder.ToString());
    }
}