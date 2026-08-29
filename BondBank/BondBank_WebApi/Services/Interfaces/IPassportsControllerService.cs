using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Services.Interfaces;

public interface IPassportsControllerService
{
    Task<PassportsModel?> GetAllInfoByIdAsync(int passportId);
}