using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.HelperMethods.Validators;

public sealed class CurrencyRateValidator(ILogger<CurrencyRateValidator> logger)
{
    public IActionResult? ValidateCurrency(string currency)
    {
        if (string.IsNullOrWhiteSpace(currency))
        {
            logger.LogWarning($"Название валюты пустое или содержит пробелы");
            return new BadRequestObjectResult(new { message = $"Название валюты пустое или содержит пробелы" });
        }

        return null;
    }
}