using BondBank_WebApi.HelperMethods.Validators;
using BondBank_WebApi.Models.DTOs.Portfolios;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.Portfolios;

[ApiController]
[Route("api/portfolios")]
public sealed class PortfoliosController(
    ILogger<PortfoliosController> logger,
    IPortfoliosControllerService portfoliosService,
    IUsersControllerService usersService,
    CommonValidator commonValidator) : ControllerBase
{
    [HttpGet("all")]
    public async Task<IActionResult> GetAllPortfoliosAsync()
    {
        try
        {
            var portfoliosData = await portfoliosService.GetAllPortfoliosAsync();
            var portfoliosModels = portfoliosData.ToList();
            if (portfoliosModels.Count != 0)
                return Ok(portfoliosModels.Select(PortfolioDto.From));

            return NotFound(new { message = $"Данных о портфелях нет" });
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении информации о портфелях: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetAllPortfoliosByUserAsync([FromQuery] int userId)
    {
        try
        {
            var validationResult = commonValidator.ValidateId(userId);
            if (validationResult != null)
                return validationResult;

            var userPortfolios = await portfoliosService.GetAllPortfoliosByUserAsync(userId);
            var portfoliosModels = userPortfolios.ToList();
            if (portfoliosModels.Count != 0)
                return Ok(portfoliosModels.Select(PortfolioDto.From));

            return NotFound(new { message = $"Данных о портфелях пользователя ID = {userId} нет" });
        }
        catch (Exception ex)
        {
            logger.LogError(
                "Неизвестная ошибка при получении информации о портфелях пользователя ID = {UserId}: {ExMessage}",
                userId, ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [Authorize]
    [HttpGet("history")]
    public async Task<IActionResult> GetPortfolioHistoryAsync([FromQuery] int portfolioId)
    {
        try
        {
            var validationResult = commonValidator.ValidateId(portfolioId);
            if (validationResult != null)
                return validationResult;

            var email = User.FindFirst("email")?.Value;
            if (string.IsNullOrWhiteSpace(email))
                return Unauthorized(new { message = "В токене пользователя отсутствует email." });

            var users = await usersService.GetUsersByFilterAsync(null, email, null, null, null, null, null, null);
            var user = users.FirstOrDefault();

            if (user is null)
                return NotFound(new { message = "Профиль пользователя не найден." });

            var userPortfolios = await portfoliosService.GetAllPortfoliosByUserAsync(user.Id);
            if (userPortfolios.All(portfolio => portfolio.Id != portfolioId))
                return NotFound(new { message = "Портфель не найден." });

            var history = await portfoliosService.GetPortfolioHistoryAsync(portfolioId);
            return Ok(history.Select(PortfolioHistoryDto.From));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка при получении истории портфеля ID = {PortfolioId}", portfolioId);
            return StatusCode(500, new { message = "Не удалось загрузить историю портфеля." });
        }
    }
}