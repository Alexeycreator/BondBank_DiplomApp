using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;

namespace BondBank_WebApi.Services.Keycloak;

public class KeycloakRolesClaimsTransformation(
    ILogger<KeycloakRolesClaimsTransformation> logger) : IClaimsTransformation
{
    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        var identity = (ClaimsIdentity)principal.Identity;

        // Проверяем, не добавились ли уже роли (чтобы не дублировать при повторном вызове)
        if (identity.HasClaim(c => c.Type == ClaimTypes.Role))
            return Task.FromResult(principal);

        // Ищем claim с типом "realm_access"
        var realmAccessClaim = identity.FindFirst("realm_access");
        if (realmAccessClaim != null)
        {
            try
            {
                // Парсим JSON, чтобы достать массив ролей
                using var doc = JsonDocument.Parse(realmAccessClaim.Value);
                if (doc.RootElement.TryGetProperty("roles", out var rolesElement))
                {
                    foreach (var role in rolesElement.EnumerateArray())
                    {
                        var roleName = role.GetString();
                        if (!string.IsNullOrEmpty(roleName))
                        {
                            identity.AddClaim(new Claim(ClaimTypes.Role, roleName));
                        }
                    }
                }
            }
            catch (JsonException ex)
            {
                logger.LogError("Ошибка при парсинге: {ExMessage}", ex.Message);
            }
        }

        return Task.FromResult(principal);
    }
}