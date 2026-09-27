using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class HealthController : ControllerBase
{
    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new { status = "healthy", timestamp = DateTime.Now });
    }
}