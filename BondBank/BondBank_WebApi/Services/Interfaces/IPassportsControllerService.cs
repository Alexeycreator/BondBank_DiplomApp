using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Models.DTOs.Passports;

namespace BondBank_WebApi.Services.Interfaces;

public interface IPassportsControllerService
{
    Task<PassportsModel?> GetAllInfoByIdAsync(int passportId);
    Task<bool> SavePassportAsync(string keycloakId, PassportRequestDto dto);
    Task<bool> DeletePassportAsync(string keycloakId);
}