using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.HelperMethods.Validators;

public sealed partial class UserValidator(
    ILogger<UserValidator> logger,
    CommonValidator commonValidator)
{
    [GeneratedRegex(@"^(\+7|7|8)\d{10}$")]
    private static partial Regex MyRegex();
    
    public IActionResult? ValidateId(int? id)
    {
        return id.HasValue ? commonValidator.ValidateId(id.Value) : null;
    }

    public IActionResult? ValidateTin(string? tin)
    {
        if (string.IsNullOrWhiteSpace(tin))
        {
            logger.LogWarning("ИНН пустой или имеет пробелы");
            return null;
        }

        if (tin.Length is not (10 or 12) || !long.TryParse(tin, out _))
        {
            logger.LogWarning("ИНН должен содержать 10 или 12 цифр");
            return new BadRequestObjectResult(new { message = "ИНН должен содержать 10 или 12 цифр" });
        }
        return null;
    }

    public IActionResult? ValidatePhoneNumber(string? phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
        {
            logger.LogWarning("Номер телефона пустой или имеет пробелы");
            return null;
        }

        if (!MyRegex().IsMatch(phoneNumber))
        {
            logger.LogWarning("Неверный формат телефона");
            return new BadRequestObjectResult(new { message = "Неверный формат телефона" });
        }
        return null;
    }
}