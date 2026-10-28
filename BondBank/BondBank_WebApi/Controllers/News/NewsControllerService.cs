using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Models.DTOs.News;
using BondBank_WebApi.Services.DataContext;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BondBank_WebApi.Controllers.News;

public sealed class NewsControllerService(
    ILogger<NewsControllerService> logger,
    ApplicationContext dbContext) : INewsControllerService
{
    public async Task<IEnumerable<NewsModel>> GetAllNewsAsync()
    {
        logger.LogInformation("Получение всех новостей");
        return await dbContext.News.OrderByDescending(n => n.Date).ToListAsync();
    }

    public async Task<NewsModel?> GetNewsByIdAsync(int id)
    {
        logger.LogInformation("Получение новости ID={NewsId}", id);
        return await dbContext.News.FindAsync(id);
    }

    public async Task<IEnumerable<NewsModel>> GetNewsByFilterAsync(string? category, DateOnly? date)
    {
        logger.LogInformation("Фильтрация новостей");
        var query = dbContext.News.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(n => n.Category == category);

        if (date.HasValue)
            query = query.Where(n => n.Date == date.Value);

        return await query.OrderByDescending(n => n.Date).ToListAsync();
    }

    public async Task<int> SaveNewsAsync(int? newsId, NewsRequestDto dto)
    {
        try
        {
            NewsModel? news;

            if (newsId.HasValue && newsId.Value > 0)
            {
                news = await dbContext.News.FindAsync(newsId.Value);
                if (news == null) return 0;
            }
            else
            {
                news = new NewsModel();
                await dbContext.News.AddAsync(news);
            }

            news.Category = dto.Category;
            news.Title = dto.Title;
            news.Image = dto.Image;
            news.Body = dto.Body;
            news.Date = dto.Date ?? DateOnly.FromDateTime(DateTime.UtcNow); // Если даты нет, ставим сегодня

            await dbContext.SaveChangesAsync();
            logger.LogInformation("Новость ID={NewsId} сохранена", news.Id);
            return news.Id;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка БД при сохранении новости: {Message}", ex.Message);
            return 0;
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при сохранении новости: {Message}", ex.Message);
            return 0;
        }
    }

    public async Task<bool> DeleteNewsAsync(int newsId)
    {
        try
        {
            var news = await dbContext.News.FindAsync(newsId);
            if (news == null) return false;

            dbContext.News.Remove(news);
            await dbContext.SaveChangesAsync();
            logger.LogInformation("Новость ID={NewsId} удалена", newsId);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при удалении новости: {Message}", ex.Message);
            return false;
        }
    }
}