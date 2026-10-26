using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Models.DTOs.Portfolios;

namespace BondBank_WebApi.Services.Interfaces;

public interface IPortfoliosControllerService
{
    Task<IEnumerable<PortfoliosModel>> GetAllPortfoliosAsync();
    Task<IEnumerable<PortfoliosModel>> GetAllPortfoliosByUserAsync(int userId);
    Task<IEnumerable<HistoryPortfoliosModel>> GetPortfolioHistoryAsync(int portfolioId);
    Task<int> SavePortfolioAsync(string keycloakId, int? portfolioId, PortfolioRequestDto dto);
    Task<bool> DeletePortfolioAsync(string keycloakId, int portfolioId);
}