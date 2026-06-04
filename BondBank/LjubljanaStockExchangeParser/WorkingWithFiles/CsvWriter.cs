using System.Text;
using LjubljanaStockExchangeParser.Models;

namespace LjubljanaStockExchangeParser.WorkingWithFiles;

public sealed class CsvWriter
{
    public void Write(string csvPath, List<BondModel> bonds)
    {
        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.AppendLine(
            "Symbol;Isin;Name;Sector;ListedQuantity;NominalValue;Currency;ListingDate;DelistingDate;UpdatedAt;");
        foreach (var bond in bonds)
        {
            csvBuilder.AppendLine(
                $"{bond.Symbol};{bond.Isin};{bond.Name};{bond.Sector};{bond.ListedQuantity};{bond.NominalValue};{bond.Currency};{bond.ListingDate};{bond.DelistingDate};{bond.UpdatedAt};");
        }

        File.WriteAllText(csvPath, csvBuilder.ToString());
    }
}