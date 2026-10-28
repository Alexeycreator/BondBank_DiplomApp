using BondBank_WebApi.Models.DTOs.News;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.News;

[ApiController]
[Route("api/news")]
public sealed class NewsController(
    ILogger<NewsController> logger,
    INewsControllerService newsService) : ControllerBase
{
    [HttpGet("all")]
    public async Task<IActionResult> GetAllNewsAsync()
    {
        try
        {
            var news = await newsService.GetAllNewsAsync();
            return Ok(news.Select(NewsResponseDto.From));
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении новостей: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetNewsByIdAsync([FromRoute] int id)
    {
        try
        {
            var news = await newsService.GetNewsByIdAsync(id);
            if (news == null)
                return NotFound(new { message = "Новость не найдена" });

            return Ok(NewsResponseDto.From(news));
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении новости: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    [HttpGet("filter")]
    public async Task<IActionResult> GetNewsByFilterAsync([FromQuery] string? category, [FromQuery] DateOnly? date)
    {
        try
        {
            var news = await newsService.GetNewsByFilterAsync(category, date);
            var newsModels = news.ToList();
            if (newsModels.Count == 0)
                return NotFound(new { message = "По заданным фильтрам новостей нет" });

            return Ok(newsModels.Select(NewsResponseDto.From));
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при фильтрации новостей: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    [HttpPost("save")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> SaveNewsAsync([FromQuery] int? newsId, [FromBody] NewsRequestDto dto)
    {
        try
        {
            var savedId = await newsService.SaveNewsAsync(newsId, dto);
            if (savedId > 0)
                return Ok(new { id = savedId, message = "Новость успешно сохранена" });

            return BadRequest(new { message = "Не удалось сохранить новость" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при сохранении новости: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteNewsAsync([FromRoute] int id)
    {
        try
        {
            var success = await newsService.DeleteNewsAsync(id);
            if (success)
                return Ok(new { message = "Новость успешно удалена" });

            return NotFound(new { message = "Новость не найдена" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при удалении новости: {Message}", ex.Message);
            return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
        }
    }
}