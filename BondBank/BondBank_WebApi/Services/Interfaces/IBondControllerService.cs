using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Models.DTOs;

namespace BondBank_WebApi.Services.Interfaces;

public interface IBondControllerService
{
    Task<IEnumerable<BondDto>?> GetAllBondsAsync();
    Task<BondsBaseModel?> GetBondByIsinAsync(string isin);
    Task<IEnumerable<BondDto>?> GetBondsByTypeAsync(string typeBond);
}