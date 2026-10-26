using System.Text.RegularExpressions;
using BondBank_WebApi.HelperMethods.Validators;
using BondBank_WebApi.Models.DTOs.Users;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace BondBank_WebApi.Controllers.Users;

[ApiController]
[Route("api/users")]
public sealed class UsersController(
    ILogger<UsersController> logger,
    IUsersControllerService usersService,
    UserValidator validator) : ControllerBase
{
    [HttpGet("all")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllUsersInfoAsync()
    {
        try
        {
            var usersData = await usersService.GetAllUsersInfoAsync();
            var usersModels = usersData.ToList();
            if (usersModels.Count != 0)
                return Ok(usersModels.Select(AdminUserResponseDto.From));

            return NotFound(new { message = $"Данных о пользователях нет" });
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении информации о всех пользователях: {ExMessage}",
                ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("filter")]
    [Authorize]
    public async Task<IActionResult> GetUsersByFilterAsync([FromQuery] int? id, [FromQuery] string? email,
        [FromQuery] string? login, [FromQuery] string? tin, [FromQuery] string? phoneNumber,
        [FromQuery] string? secondName, [FromQuery] string? firstName, [FromQuery] string? surName)
    {
        try
        {
            var idVal = validator.ValidateId(id);
            if (idVal != null) 
                return idVal;

            var tinVal = validator.ValidateTin(tin);
            if (tinVal != null) 
                return tinVal;

            var phoneVal = validator.ValidatePhoneNumber(phoneNumber);
            if (phoneVal != null) 
                return phoneVal;

            var usersData = await usersService.GetUsersByFilterAsync(id, email, login, tin, phoneNumber, secondName,
                firstName, surName);
            var usersModels = usersData.ToList();

            if (usersModels.Count != 0)
                return Ok(usersModels.Select(UserResponseDto.From));

            return NotFound(new { message = "По заданным фильтрам пользователи не найдены" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при фильтрации пользователей: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPost("heartbeat")]
    [Authorize]
    public async Task<IActionResult> UpdateLoginHeartbeat()
    {
        try
        {
            /*
             * если поменяются параметры в Keycloak
             * раскоментировать строку и проверить какие параметры приходят
             */
            //var allClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            var keycloakId = User.FindFirst("sub")?.Value
                             ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
                                 ?.Value;
            var email = User.FindFirst("email")?.Value
                        ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;
            var secondName = User.FindFirst("family_name")?.Value ??
                             User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname")?.Value
                             ?? "";
            var firstName = User.FindFirst("given_name")?.Value
                            ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname")?.Value
                            ?? "";

            // Если токен валидный, но ID нет — что-то пошло не так
            if (string.IsNullOrEmpty(keycloakId))
            {
                logger.LogWarning("Токен прочитан, но sub не найден");
                return Unauthorized(new { message = "Токен прочитан, но sub не найден" });
            }

            // 1. Проверяем, есть ли пользователь в БД. Если нет — создаем.
            // (Этот же метод есть в Middleware, но дублирование не помешает, 
            // так как EnsureUserExistsAsync просто проверит наличие и обновит LastLoginAt)
            await usersService.EnsureUserExistsAsync(keycloakId, email ?? "", secondName, firstName);

            // 2. Обновляем время последнего входа
            await usersService.UpdateLastLoginAsync(keycloakId);

            // Возвращаем успешный ответ
            return Ok(new { message = "Heartbeat received", keycloakId });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при обновлении времени входа: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера при синхронизации пользователя" });
        }
    }
}