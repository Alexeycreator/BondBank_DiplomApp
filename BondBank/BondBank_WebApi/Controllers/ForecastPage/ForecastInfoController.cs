using BondBank_WebApi.Models.DTOs.Bonds;
using BondBank_WebApi.Models.DTOs.CurrencyRates;
using BondBank_WebApi.Models.DTOs.Forecasts;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.ForecastPage;

[ApiController]
[Route("api/[controller]")]
public sealed class ForecastInfoController(
    ILogger<ForecastInfoController> logger,
    IBondHistoriesControllerService bondHistoriesService,
    IBondControllerService bondService,
    ICurrencyRatesControllerService currencyRatesService) : ControllerBase
{
    [HttpGet("get-forecast-info")]
    public async Task<IActionResult> GetForecastInfoAsync([FromQuery] DateOnly date, [FromQuery] string currency)
    {
        try
        {
            var allBonds = await bondService.GetAllBondsAsync();
            var currencyRate = await currencyRatesService.GetCurrencyRateByDateReceiptAsync(date, currency);
            var typeBonds = await bondHistoriesService.GetTypeBondHistoriesAsync();
            var bondsForecast = await bondService.GetForecastBondsAsync();

            var bondsList = allBonds?.ToList() ?? new List<BondDto>();
            var typeBondsList = typeBonds?.ToList() ?? new List<string>();
            var bondsForecastDict = bondsForecast ?? new Dictionary<string, double[]>();

            var bondsForForecast = bondsList
                .Where(bond => bond.Bond is not null &&
                               bondsForecastDict.ContainsKey(bond.Bond.Isin))
                .Select(bond => new BondForForecastDto
                {
                    Isin = bond.Bond!.Isin,
                    Name = bond.Bond.Name,
                    Type = bond.Type ?? string.Empty,
                    Forecast = bondsForecastDict[bond.Bond.Isin]
                })
                .ToList();

            var resultForecastPage = new ForecastInfoDto
            {
                TotalBonds = bondsList.Count,
                TypeBonds = typeBondsList,
                BondsForForecast = bondsForForecast,
                CurrencyRates = currencyRate.Id > 0
                    ? new List<CurrencyRateDto>
                    {
                        CurrencyRateDto.From(currencyRate)
                    }
                    : new List<CurrencyRateDto>()
            };
            
            return Ok(resultForecastPage);
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при передаче данных на страницу прогнозов: {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}