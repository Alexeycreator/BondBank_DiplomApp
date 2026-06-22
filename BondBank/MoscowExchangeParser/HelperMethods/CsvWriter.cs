using System.Text;
using MoscowExchangeParser.Models;

namespace MoscowExchangeParser.HelperMethods;

public class CsvWriter
{
    protected void Write(string path, List<Bond> bonds)
    {
        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.AppendLine(
            "SecurityType;SecurityTypeId;Type;SecID;ShortName;Name;RegNumber;IsTraded;PrimaryBoardID;Market;Engine;FaceValue;FaceUnit;Isin;UpdatedAt;");
        foreach (var bond in bonds)
        {
            csvBuilder.AppendLine(
                $"{bond.SecurityType};{bond.SecurityTypeId};{bond.Type};{bond.SecId};{bond.ShortName};{bond.Name};{bond.RegNumber};{bond.IsTraded};{bond.PrimaryBoardId};{bond.Market};{bond.Engine};{bond.FaceValue};{bond.FaceUnit};{bond.Isin};{bond.UpdatedAt};");
        }

        File.WriteAllText(path, csvBuilder.ToString());
    }
}