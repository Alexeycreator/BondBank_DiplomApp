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
}