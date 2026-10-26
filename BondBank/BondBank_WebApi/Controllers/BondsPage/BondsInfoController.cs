using BondBank_WebApi.Models.DTOs.Bonds;
using BondBank_WebApi.Models.DTOs.CurrencyRates;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.BondsPage;

[ApiController]
[Route("api/bonds-page")]
public sealed class BondsInfoController(
    ILogger<BondsInfoController> logger,
    IBondControllerService bondService,
    IBondHistoriesControllerService bondHistoriesService,
    ICurrencyRatesControllerService currencyRatesService) : ControllerBase
{
    [HttpGet("bonds-info")]
    [Authorize]
    public async Task<IActionResult> GetBondsInfo()
    {
        try
        {
            var allBonds = await bondService.GetAllBondsAsync();
            var typeBonds = await bondHistoriesService.GetTypeBondHistoriesAsync();
            var currencyRates = await currencyRatesService.GetAllCurrencyRatesAsync();
            
            var bondsTableList = allBonds?
                .Where(bond => bond.Bond is not null && bond.Type is not null)
                .Select(BondDtoMapper.ToResponseDto)
                .ToList() ?? new List<BondResponseDto>();
            var typesFilterList = typeBonds?.ToList() ?? new List<string>();
            var currencyRatesList = currencyRates?.Select(CurrencyRateDto.From).ToList() ?? new List<CurrencyRateDto>();

            var bondsInfo = new BondsInfoDto()
            {
                BondsByTable = bondsTableList,
                TypeBondsByFilter = typesFilterList,
                CurrencyRates = currencyRatesList
            };
            
            return Ok(bondsInfo);
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при передачи данных для страницы облигаций: {ExMessage}", ex.Message);
            return StatusCode(500, $"Неизвестная ошибка при передачи данных для страницы облигаций: {ex.Message}");
        }
    }

}