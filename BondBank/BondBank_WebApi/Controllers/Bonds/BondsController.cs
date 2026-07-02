using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.Bonds;

[ApiController]
[Route("api/[controller]")]
public sealed class BondsController(ILogger<BondsController> logger, IBondControllerService bondService) : ControllerBase
{
    [HttpGet("get-all-bonds")]
    public async Task<IActionResult> GetAllBondsAsync()
    {
        var bonds = await bondService.GetAllBondsAsync();
        if (bonds != null && bonds.Any())
        {
            return Ok(bonds);
        }

        logger.LogError($"Облигаций нет в системе");
        return NotFound(new { message = $"Облигаций нет в системе" });
    }

    [HttpGet("get-bonds-by-type")]
    public async Task<IActionResult> GetBondsByTypeAsync(string typeBond)
    {
        var bonds = await bondService.GetBondsByTypeAsync(typeBond);
        if (bonds != null && bonds.Any())
        {
            return Ok(bonds);
        }

        logger.LogError($"Облигаций типа: '{typeBond}' нет в системе");
        return NotFound(new { message = $"Облигаций типа: '{typeBond}' нет в системе" });
    }

    [HttpGet("get-bond-by-isin")]
    public async Task<IActionResult> GetBondByIsinAsync(string isin)
    {
        var bond = await bondService.GetBondByIsinAsync(isin);
        if (bond != null)
        {
            return Ok(bond);
        }

        logger.LogError($"Облигации с isin: '{isin}' нет в системе");
        return NotFound(new { message = $"Облигации с isin: '{isin}' нет в системе" });
    }
}