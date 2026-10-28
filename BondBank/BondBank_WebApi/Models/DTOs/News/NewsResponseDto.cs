using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Models.DTOs.News;

public sealed record NewsResponseDto(
    int Id,
    string Category,
    DateOnly Date,
    string Title,
    string? Image,
    string Body)
{
    public static NewsResponseDto From(NewsModel model) =>
        new(model.Id, model.Category, model.Date, model.Title, model.Image, model.Body);
}