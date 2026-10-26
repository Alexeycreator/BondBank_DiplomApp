using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Models.DTOs.Portfolios;

public sealed record PortfolioHistoryDto(
    int Id,
    DateTime DateSavePortfolioUser,
    decimal TotalValue,
    decimal TotalYield,
    int PortfoliosId)
{
    public static PortfolioHistoryDto From(HistoryPortfoliosModel model) =>
        new(
            model.Id,
            model.DateSavePortfolioUser,
            model.TotalValue,
            model.TotalYield,
            model.PortfoliosId);
}
