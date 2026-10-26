using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Models.DTOs.Snils;

namespace BondBank_WebApi.Services.Interfaces;

public interface ISnilsControllerService
{
    Task<SnilsModel?> GetAllInfoByIdAsync(int snilsId);
    Task<bool> SaveSnilsAsync(string keycloakId, SnilsRequestDto dto);
    Task<bool> DeleteSnilsAsync(string keycloakId);
}