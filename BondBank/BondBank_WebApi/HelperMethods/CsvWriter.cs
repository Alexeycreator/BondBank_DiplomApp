using System.Text;
using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.HelperMethods;

public class CsvWriter
{
    protected void Write(string filePath, List<CurrencyRatesModel> currencyRates)
    {
        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.AppendLine($"DigitalCode;LetterCode;Units;Currency;Rate;DateReceipt");
        foreach (var currency in currencyRates)
        {
            csvBuilder.AppendLine(
                $"{currency.DigitalCode};{currency.LetterCode};{currency.Units};{currency.Currency};{currency.Rate};{currency.DateReceipt}");
        }

        File.WriteAllText(filePath, csvBuilder.ToString());
    }

    protected void Write(string filePath, List<BondHistoryModel> bondHistory)
    {
        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.AppendLine($"Isin;BondPrice;BondType;CurrencyRate;RecordedDate;");
        foreach (var bond in bondHistory)
        {
            csvBuilder.AppendLine(
                $"{bond.Isin};{bond.BondPrice};{bond.BondType};{bond.CurrencyRate};{bond.RecordedDate};");
        }

        File.WriteAllText(filePath, csvBuilder.ToString());
    }
}