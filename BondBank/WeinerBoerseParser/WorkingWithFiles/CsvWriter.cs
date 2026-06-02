using System.Text;
using WeinerBoerseParser.Models;

namespace WeinerBoerseParser.WorkingWithFiles;

public class CsvWriter
{
    public void Write(string csvPath, List<BondModel> bonds)
    {
        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.AppendLine(
            "Name;Last;Chg.% 1D Chg.Abs.;DateTime;ISIN;Bid Volume;Ask Volume;Maturity;Status;Currency;UpdatedAt");
        foreach (var bond in bonds)
        {
            csvBuilder.AppendLine(
                $"{bond.Name};{bond.Last};{bond.Chg};{bond.Date};{bond.Isin};{bond.Bid};" +
                $"{bond.Ask};{bond.Maturity};{bond.Status};{bond.Currency};{bond.UpdatedAt}");
        }

        File.WriteAllText(csvPath, csvBuilder.ToString());
    }
}