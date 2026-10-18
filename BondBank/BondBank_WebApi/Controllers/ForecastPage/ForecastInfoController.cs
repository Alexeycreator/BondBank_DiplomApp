using BondBank_WebApi.Models.DTOs;
using BondBank_WebApi.Models.DTOs.ForecastPage;
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
            var currencyRates = await currencyRatesService.GetCurrencyRateByDateReceiptAsync(date, currency);
            var typeBonds = await bondHistoriesService.GetTypeBondHistoriesAsync();
            var bondsForecast = await bondService.GetForecastBondsAsync();

            var bondsList = allBonds?.ToList() ?? new List<BondDto>();
            var typeBondsList = typeBonds?.ToList() ?? new List<string>();
            var bondsForecastDict = bondsForecast?.ToDictionary() ?? new Dictionary<string, double[]>();

            var bondsForForecast = new List<BondForForecastDto>();
            var currencyRatesForForecast = new List<CurrencyRatesForForecastDto>();
            var resultForecastPage = new ForecastInfoDto();

            foreach (var bond in bondsList.ToList())
            {
                if (bond.Bond != null)
                {
                    bondsForForecast.Add(new BondForForecastDto()
                    {
                        Isin = bond.Bond.Isin,
                        Name = bond.Bond.Name,
                    });
                }
            }

            currencyRatesForForecast.Add(new CurrencyRatesForForecastDto()
            {
                Id = currencyRates.Id,
                LetterCode = currencyRates.LetterCode,
                Rate = currencyRates.Rate
            });

            foreach (var bond in bondsForForecast)
            {
                if (bondsForecastDict.TryGetValue(bond.Isin, out var forecast))
                {
                    resultForecastPage.BondsForForecastChart = forecast;
                }
            }

            resultForecastPage.TotalBonds = bondsList.Count;
            resultForecastPage.TypeBonds = typeBondsList;
            resultForecastPage.BondsForForecast = bondsForForecast;
            resultForecastPage.CurrencyRates = currencyRatesForForecast;
            
            return Ok(resultForecastPage);
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при передаче данных на страницу прогнозов: {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}