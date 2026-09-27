using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Models.DTOs;
using BondBank_WebApi.Models.DTOs.BondsPage;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.BondsPage;

[ApiController]
[Route("api/[controller]")]
public sealed class BondsInfoController(
    ILogger<BondsInfoController> logger,
    IBondControllerService bondService,
    IBondHistoriesControllerService bondHistoriesService,
    ICurrencyRatesControllerService currencyRatesService) : ControllerBase
{
    [HttpGet("get-bonds-info")]
    public async Task<IActionResult> GetBondsInfo()
    {
        try
        {
            var allBonds = await bondService.GetAllBondsAsync();
            var typeBonds = await bondHistoriesService.GetTypeBondHistoriesAsync();
            var bondHistories = await bondHistoriesService.GetAllBondHistoriesAsync();
            var currencyRates = await currencyRatesService.GetAllCurrencyRatesAsync();
            
            var bondsTableList = allBonds?.ToList() ?? new List<BondDto>();
            var typesFilterList = typeBonds?.ToList() ?? new List<string>();
            var bondHistoriesList = bondHistories?.ToList() ?? new List<BondHistoryModel>();
            var currencyRatesList = currencyRates?.ToList() ?? new List<CurrencyRatesModel>();

            var bondsInfo = new BondsInfoDto()
            {
                BondsByTable = bondsTableList,
                TypeBondsByFilter = typesFilterList,
                BondByChart = bondHistoriesList,
                CurrencyRates = currencyRatesList
            };
            
            return Ok(bondsInfo);
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при передачи данных для страницы облигаций: {ex.Message}");
            return StatusCode(500, $"Неизвестная ошибка при передачи данных для страницы облигаций: {ex.Message}");
        }
    }
}