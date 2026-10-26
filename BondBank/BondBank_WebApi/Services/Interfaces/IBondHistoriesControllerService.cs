using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Services.Interfaces;

public interface IBondHistoriesControllerService
{
    Task<IEnumerable<BondHistoryModel>> GetAllBondHistoriesAsync();
    Task<IEnumerable<BondHistoryModel>> GetBondHistoriesByRecordedDateAsync(DateOnly date);
    Task<IEnumerable<BondHistoryModel>> GetBondHistoriesByTypeAsync(string type);
    Task<IEnumerable<BondHistoryModel>> GetBondHistoriesByIsinAsync(string isin);
    Task<IEnumerable<string>> GetTypeBondHistoriesAsync();
    Task<IEnumerable<BondHistoryModel>> GetByFilterAsync(string? isin, string? type, DateOnly? date);
}