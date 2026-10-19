using System.Text.RegularExpressions;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace BondBank_WebApi.Controllers.Users;

[ApiController]
[Route("api/[controller]/users")]
public sealed class UsersController(
    ILogger<UsersController> logger,
    IUsersControllerService usersService) : ControllerBase
{
    [HttpGet("get-all")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllUsersInfoAsync()
    {
        try
        {
            var usersData = await usersService.GetAllUsersInfoAsync();
            if (usersData.Any())
            {
                return Ok(usersData);
            }

            return NotFound(new { message = $"Данных о пользователях нет" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при получении информации о всех пользователях: {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-user-by-id")]
    [Authorize]
    public async Task<IActionResult> GetFullInfoUserByIdAsync(int userId)
    {
        try
        {
            if (userId < 1)
            {
                return BadRequest(new { message = $"Пользователя с ID = {userId} не может существовать" });
            }

            var user = await usersService.GetFullInfoUserByIdAsync(userId);
            if (user != null)
            {
                return Ok(user);
            }

            return NotFound(new { message = $"Данных о пользователе нет" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная шибка при получении информации о пользователе ID = {userId}. {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-user-by-email")]
    [Authorize]
    public async Task<IActionResult> GetInfoByEmailAsync(string email)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new { message = $"Введенный email: '{email}' пустой или содержит пробелы" });
            }

            var user = await usersService.GetInfoByEmailAsync(email);
            if (user != null)
            {
                return Ok(user);
            }

            return NotFound(new { message = $"Пользователя с email: '{email}' не существует" });
        }
        catch (Exception ex)
        {
            logger.LogError(
                $"Неизвестная ошибка при получении информации о пользователе с email = '{email}'. {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-user-by-login")]
    [Authorize]
    public async Task<IActionResult> GetInfoByLoginAsync(string login)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(login))
            {
                return BadRequest(new { message = $"Введенный логин: '{login}' пустой или содержит пробелы" });
            }

            var user = await usersService.GetInfoByLoginAsync(login);
            if (user != null)
            {
                return Ok(user);
            }

            return NotFound(new { message = $"Пользователя с логином: '{login}' не существует" });
        }
        catch (Exception ex)
        {
            logger.LogError(
                $"Неизвестная ошибка при получении информации о пользователе с логином: '{login}'. {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-user-by-tin")]
    [Authorize]
    public async Task<IActionResult> GetInfoByTinAsync(string tin)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(tin))
            {
                return BadRequest(new { message = $"ИНН пустой или содержит пробелы: {tin}" });
            }

            if (tin.Length is not (10 or 12))
            {
                return BadRequest(new
                {
                    message = $"ИНН содержит недопустимое количество символов: {tin.Length}. Должно быть 10 или 12"
                });
            }

            if (!Int64.TryParse(tin, out var value))
            {
                return BadRequest(new { message = $"ИНН должен содержать только целочисленные значения" });
            }

            var user = await usersService.GetInfoByTinAsync(tin);
            if (user != null)
            {
                return Ok(user);
            }

            return NotFound(new { message = $"Пользователя с ИНН: '{tin}' не существует" });
        }
        catch (Exception ex)
        {
            logger.LogError(
                $"Неизвестная ошибка при получении информации о пользователе с ИНН = '{tin}'. {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-user-by-fullName")]
    [Authorize]
    public async Task<IActionResult> GetInfoByFullNameAsync(string secondName, string firstName, string surName)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(secondName) || string.IsNullOrWhiteSpace(firstName))
            {
                return BadRequest(new { message = $"Фамилия и имя обязательны для заполнения" });
            }

            var user = await usersService.GetInfoByFullNameAsync(secondName, firstName, surName);
            if (user != null)
            {
                return Ok(user);
            }

            return NotFound(new { message = $"Пользователя с ФИО: {secondName} {firstName} {surName} не существует" });
        }
        catch (Exception ex)
        {
            logger.LogError(
                $"Неизвестная ошибка при получении информации о пользователе с ФИО: {secondName} {firstName} {surName}. {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-user-by-phoneNumber")]
    [Authorize]
    public async Task<IActionResult> GetInfoByPhoneNumberAsync(string phoneNumber)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(phoneNumber))
            {
                return BadRequest(new { message = $"Номер телефона пустой или содержит пробелы" });
            }

            var regularExpression = Regex.Match(phoneNumber, @"^(\+7|7|8)\d{10}$");
            if (!regularExpression.Success)
            {
                return BadRequest(new
                {
                    message =
                        $"Формат телефона: {phoneNumber} не соответствует требуемому: 8XXXXXXXXXX, 7XXXXXXXXXX или +7XXXXXXXXXX"
                });
            }

            var user = await usersService.GetInfoByPhoneNumberAsync(phoneNumber);
            if (user != null)
            {
                return Ok(user);
            }

            return NotFound(new { message = $"Пользователя с номером телефона: '{phoneNumber}' не существует" });
        }
        catch (Exception ex)
        {
            logger.LogError(
                $"Неизвестная ошибка при получении информации о пользователе с номером телефона: '{phoneNumber}'. {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}