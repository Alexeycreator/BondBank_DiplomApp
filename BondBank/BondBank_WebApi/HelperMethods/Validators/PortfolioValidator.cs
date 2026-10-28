using System.Security.Claims;

namespace BondBank_WebApi.HelperMethods.Validators;

public sealed class PortfolioValidator
{
    public string? GetEmail(ClaimsPrincipal user)
    {
        return user.FindFirst("email")?.Value 
               ?? user.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;
    }
}