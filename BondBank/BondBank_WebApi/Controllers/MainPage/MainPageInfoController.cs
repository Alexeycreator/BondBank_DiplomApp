using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Models.DTOs.Bonds;
using BondBank_WebApi.Models.DTOs.MainPage;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.MainPage;

[ApiController]
[Route("api/[controller]")]
public sealed class MainPageInfoController(
    ILogger<MainPageInfoController> logger,
    IBondControllerService bondService,
    IUsersControllerService usersService,
    IBondHistoriesControllerService bondHistoryService) : ControllerBase
{
    [HttpGet("get-info-statistics-block")]
    public async Task<IActionResult> GetInfoStatisticsBlock()
    {
        try
        {
            var allBonds = await bondService.GetAllBondsAsync();
            var allUsers = await usersService.GetAllUsersInfoAsync();
            var allBondHistories = await bondHistoryService.GetTypeBondHistoriesAsync();

            var bonds = allBonds?.ToList() ?? new List<BondDto>();
            var users = allUsers?.ToList() ?? new List<UsersModel>();
            var typeBonds = allBondHistories?.ToList() ?? new List<string>();

            var infoStatisticsBlock = new MainInfoDto
            {
                ActiveUsers = users.Count,
                TotalBonds = bonds.Count,
                Exchanges = typeBonds.Count,
            };

            return Ok(infoStatisticsBlock);
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении информации для блока статистики: {ExMessage}", ex.Message);
            return StatusCode(500, $"Неизвестная ошибка при получении информации для блока статистики: {ex.Message}");
        }
    }
}