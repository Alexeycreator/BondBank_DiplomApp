using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Services.Interfaces;

public interface IPortfoliosControllerService
{
    Task<IEnumerable<PortfoliosModel>> GetAllPortfoliosAsync();
    Task<IEnumerable<PortfoliosModel>> GetAllPortfoliosByUserAsync(int userId);
}