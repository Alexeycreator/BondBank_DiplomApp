using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.HelperMethods.Validators;

public sealed class CommonValidator(ILogger<CommonValidator> logger)
{
    public IActionResult? ValidateId(int id)
    {
        if (id is 0 or < 1)
        {
            logger.LogWarning("ID='{Id}' не может существовать", id);
            return new BadRequestObjectResult(new { message = $"ID='{id}' не может существовать" });
        }

        return null;
    }

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