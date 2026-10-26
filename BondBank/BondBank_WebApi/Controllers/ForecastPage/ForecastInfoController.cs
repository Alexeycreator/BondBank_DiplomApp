using BondBank_WebApi.HelperMethods.Validators;
using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Models.DTOs.Bonds;
using BondBank_WebApi.Models.DTOs.CurrencyRates;
using BondBank_WebApi.Models.DTOs.Forecasts;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.ForecastPage;

[ApiController]
[Route("api/forecast")]
public sealed class ForecastInfoController(
    ILogger<ForecastInfoController> logger,
    IBondHistoriesControllerService bondHistoriesService,
    IBondControllerService bondService,
    ICurrencyRatesControllerService currencyRatesService,
    CommonValidator commonValidator,
    CurrencyRateValidator validator) : ControllerBase
{
    [HttpGet("info")]
    [Authorize]
    public async Task<IActionResult> GetForecastInfoAsync([FromQuery] DateOnly date, [FromQuery] string currency)
    {
        try
        {
            var dateValidationResult = commonValidator.ValidateDate(date);
            if (dateValidationResult != null)
                return dateValidationResult;

            var currencyValidationResult = validator.ValidateCurrency(currency);
            if (currencyValidationResult != null)
                return currencyValidationResult;

            var allBonds = await bondService.GetAllBondsAsync();
            var currencyRatesData = await currencyRatesService.GetCurrencyRatesByFilterAsync(currency, date);
            var currencyRateList = currencyRatesData?.ToList() ?? new List<CurrencyRatesModel>();
            var currencyRate = currencyRateList.FirstOrDefault();

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
                CurrencyRates = currencyRate != null
                    ? new List<CurrencyRateDto> { CurrencyRateDto.From(currencyRate) }
                    : new List<CurrencyRateDto>()
            };

            return Ok(resultForecastPage);
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при передаче данных на страницу прогнозов: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}