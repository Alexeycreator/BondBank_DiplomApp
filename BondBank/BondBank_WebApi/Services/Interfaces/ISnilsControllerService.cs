using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Services.Interfaces;

public interface ISnilsControllerService
{
    Task<SnilsModel?> GetAllInfoByIdAsync(int snilsId);
}