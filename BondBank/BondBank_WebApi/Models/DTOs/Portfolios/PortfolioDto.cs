using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Models.DTOs.Portfolios;

public sealed record PortfolioDto(int Id, string Name, int UserId)
{
    public static PortfolioDto From(PortfoliosModel model) => new(model.Id, model.Name, model.UserId);
}
