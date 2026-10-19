using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BondBank_WebApi.Services.Keycloak;
using BondBank_WebApi.Models.DTOs.Users;

namespace BondBank_WebApi.Controllers.KeycloakAdmin;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class KeycloakAdminController(
    KeycloakUserSyncService keycloakService,
    ILogger<KeycloakAdminController> logger) : ControllerBase
{
    [HttpPost("create-user")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestDto request)
    {
        try
        {
            var userId = await keycloakService.CreateUserInKeycloakAsync(request);
            return Ok(new { message = "Пользователь успешно создан в Keycloak и локальной базе данных.", userId });
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при создании пользователя: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPut("update-user")]
    public async Task<IActionResult> UpdateUser([FromBody] UpdateUserRequestDto request)
    {
        try
        {
            await keycloakService.UpdateUserInKeycloakAsync(request);
            return Ok(new { message = "Пользователь успешно обновился в Keycloak и локальной базе данных." });
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при обновлении пользователя: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpDelete("delete-user/{keycloakUserId}")]
    public async Task<IActionResult> DeleteUser(string keycloakUserId)
    {
        try
        {
            await keycloakService.DeleteUserFromKeycloakAsync(keycloakUserId);
            return Ok(new { message = "Пользователь успешно удален из Keycloak и локальной базы данных." });
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при удалении пользователя: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}