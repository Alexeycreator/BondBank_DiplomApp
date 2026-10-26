using BondBank_WebApi.Services.DataContext;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace BondBank_WebApi.HelperMethods.Validators;

public sealed class BondValidator(
    ILogger<BondValidator> logger,
    IOptions<AppSettings> appSettings)
{
    private readonly AppSettings valueAppSettings = appSettings.Value;
    private readonly HashSet<string> validBondTypes = appSettings.Value.ValidBondTypes;

    public IActionResult? ValidateType(string? type)
    {
        if (validBondTypes.Count == 0)
        {
            logger.LogWarning("Нет доступных типов облигаций");
            return new BadRequestObjectResult(new { message = "Нет доступных типов облигаций" });
        }

        if (string.IsNullOrWhiteSpace(type))
        {
            logger.LogWarning("Тип облигации не может быть пустым или содержать пробелы: {Type}", type);
            return new BadRequestObjectResult(new
                { message = "Тип облигации не может быть пустым или содержать пробелы" });
        }

        var normalizedType = type.ToLowerInvariant();
        if (!validBondTypes.Contains(normalizedType))
        {
            logger.LogWarning("Облигации типа '{Type}' нет в системе", type);
            return new NotFoundObjectResult(new { message = $"Облигации типа '{type}' нет в системе" });
        }

        return null;
    }

    public IActionResult? ValidateIsin(string? isin)
    {
        if (string.IsNullOrWhiteSpace(isin))
        {
            logger.LogWarning("ISIN не может быть пустым или содержать пробелы");
            return new BadRequestObjectResult(new { message = "ISIN не может быть пустым или содержать пробелы" });
        }

        if (isin.Length != 12)
        {
            logger.LogWarning("ISIN должен содержать 12 символов");
            return new BadRequestObjectResult(new { message = "ISIN должен содержать 12 символов" });
        }
        return null;
    }
}