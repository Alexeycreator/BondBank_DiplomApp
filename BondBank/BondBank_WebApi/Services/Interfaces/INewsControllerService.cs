using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Services.Interfaces;

public interface INewsControllerService
{
    Task<IEnumerable<NewsModel>> GetAllNewsAsync();
    Task<NewsModel?> GetNewsByIdAsync(int id);
    Task<IEnumerable<NewsModel>> GetNewsByFilterAsync(string? category, DateOnly? date);
    Task<int> SaveNewsAsync(int? newsId, Models.DTOs.News.NewsRequestDto dto);
    Task<bool> DeleteNewsAsync(int newsId);
}