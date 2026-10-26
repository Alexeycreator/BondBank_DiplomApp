using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.HelperMethods.Validators;

public sealed class CommonValidator(ILogger<CommonValidator> logger)
{
    public IActionResult? ValidateDate(DateOnly date)
    {
        var currentDate = DateTime.UtcNow;
        if (Convert.ToDateTime(date) > currentDate)
        {
            logger.LogWarning("Дата '{DateOnly}' не может быть позднее текущей '{CurrentDate}'", date, currentDate);
            return new BadRequestObjectResult(new
                { message = $"Дата '{date}' не может быть позднее текущей '{currentDate}'" });
        }

        return null;
    }
}