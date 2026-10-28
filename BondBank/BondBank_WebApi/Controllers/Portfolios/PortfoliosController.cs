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
    CommonValidator commonValidator,
    PortfolioValidator validator) : ControllerBase
{
    [HttpGet("all")]
    [Authorize(Roles = "admin")]
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
    [Authorize]
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

    [HttpGet("history")]
    [Authorize]
    public async Task<IActionResult> GetPortfolioHistoryAsync([FromQuery] int portfolioId)
    {
        try
        {
            var validationResult = commonValidator.ValidateId(portfolioId);
            if (validationResult != null)
                return validationResult;

            var email = validator.GetEmail(User);
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

    [HttpPost("save")]
    [Authorize]
    public async Task<IActionResult> SavePortfolioAsync([FromQuery] int? portfolioId,
        [FromBody] PortfolioRequestDto dto)
    {
        try
        {
            var keycloakId = User.FindFirst("sub")?.Value
                             ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
                                 ?.Value;

            if (string.IsNullOrEmpty(keycloakId))
                return Unauthorized(new { message = "В токене отсутствует идентификатор пользователя" });

            var savedId = await portfoliosService.SavePortfolioAsync(keycloakId, portfolioId, dto);

            if (savedId > 0)
                return Ok(new { id = savedId, message = "Портфель успешно сохранен" });

            return BadRequest(new { message = "Не удалось сохранить портфель. Проверьте права доступа." });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при сохранении портфеля: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpDelete("{portfolioId}")]
    [Authorize]
    public async Task<IActionResult> DeletePortfolioAsync([FromRoute] int portfolioId)
    {
        try
        {
            var validationResult = commonValidator.ValidateId(portfolioId);
            if (validationResult != null)
                return validationResult;

            var keycloakId = User.FindFirst("sub")?.Value
                             ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
                                 ?.Value;

            if (string.IsNullOrEmpty(keycloakId))
                return Unauthorized(new { message = "В токене отсутствует идентификатор пользователя" });

            var success = await portfoliosService.DeletePortfolioAsync(keycloakId, portfolioId);

            if (success)
                return Ok(new { message = "Портфель успешно удален" });

            return NotFound(new { message = "Портфель не найден или у вас нет прав на его удаление" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при удалении портфеля: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}