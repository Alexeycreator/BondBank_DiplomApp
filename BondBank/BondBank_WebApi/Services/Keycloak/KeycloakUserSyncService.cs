using System.Net.Http.Headers;
using System.Text.Json;
using BondBank_WebApi.Models.DTOs.Users;
using BondBank_WebApi.Services.Interfaces;

namespace BondBank_WebApi.Services.Keycloak;

public class KeycloakUserSyncService
{
    private readonly HttpClient httpClient;
    private readonly IUsersControllerService usersService;
    private readonly ILogger<KeycloakUserSyncService> logger;
    private readonly string realm;
    private readonly string adminUsername;
    private readonly string adminPassword;

    public KeycloakUserSyncService(
        IConfiguration configuration,
        IUsersControllerService usersService,
        ILogger<KeycloakUserSyncService> logger,
        HttpClient httpClient)
    {
        var baseUrl = configuration["Keycloak:Url"];
        realm = "bondbank";
        adminUsername = configuration["Keycloak:AdminUsername"] ?? "";
        adminPassword = configuration["Keycloak:AdminPassword"] ?? "";

        this.httpClient = httpClient;
        if (baseUrl != null) this.httpClient.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");
        this.usersService = usersService;
        this.logger = logger;
    }

    // Вспомогательный метод для получения токена администратора
    private async Task<string> GetAdminTokenAsync()
    {
        var tokenUrl = $"realms/master/protocol/openid-connect/token";
        var content = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("client_id", "admin-cli"),
            new KeyValuePair<string, string>("username", adminUsername),
            new KeyValuePair<string, string>("password", adminPassword),
            new KeyValuePair<string, string>("grant_type", "password")
        });

        var response = await httpClient.PostAsync(tokenUrl, content);
        response.EnsureSuccessStatusCode();
        
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        return json.GetProperty("access_token").GetString() ?? throw new Exception("Failed to get admin token");
    }

    private async Task SyncUserFromKeycloakAsync(string keycloakUserId)
    {
        try
        {
            var token = await GetAdminTokenAsync();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await httpClient.GetAsync($"admin/realms/{realm}/users/{keycloakUserId}");
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning($"User {keycloakUserId} not found in Keycloak");
                return;
            }

            var keycloakUser = await response.Content.ReadFromJsonAsync<JsonElement>();
            var email = keycloakUser.GetProperty("email").GetString() ?? "";
            var firstName = keycloakUser.GetProperty("firstName").GetString() ?? "";
            var lastName = keycloakUser.GetProperty("lastName").GetString() ?? "";
            var username = keycloakUser.GetProperty("username").GetString() ?? "";

            var existingUser = await usersService.GetInfoByKeycloakIdAsync(keycloakUserId);

            if (existingUser == null)
            {
                await usersService.CreateUserFromKeycloakAsync(new CreateUserFromKeycloakDto(
                    KeycloakId: keycloakUserId,
                    EmailAddress: email,
                    FirstName: firstName,
                    SecondName: lastName,
                    Login: username
                ));

                logger.LogInformation($"User {email} synced from Keycloak to local DB");
            }
        }
        catch (Exception ex)
        {
            logger.LogError($"Error syncing user from Keycloak: {ex.Message}");
            throw;
        }
    }

    public async Task<string> CreateUserInKeycloakAsync(CreateUserRequestDto request)
    {
        try
        {
            var token = await GetAdminTokenAsync();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // 1. Создаем пользователя
            var userPayload = new
            {
                username = request.EmailAddress,
                email = request.EmailAddress,
                firstName = request.FirstName,
                lastName = request.SecondName,
                enabled = true,
                emailVerified = true,
                credentials = new[]
                {
                    new { type = "password", value = request.Password, temporary = false }
                }
            };

            var createResponse = await httpClient.PostAsJsonAsync($"admin/realms/{realm}/users", userPayload);
            
            if (!createResponse.IsSuccessStatusCode)
            {
                var errorBody = await createResponse.Content.ReadAsStringAsync();
                throw new Exception($"Failed to create user in Keycloak: {errorBody}");
            }

            // Keycloak возвращает ID в заголовке Location
            var location = createResponse.Headers.Location?.ToString() ?? "";
            var userId = location.Split('/').Last();

            // 2. Назначаем роль (если роль существует)
            var roleResponse = await httpClient.GetAsync($"admin/realms/{realm}/roles/{request.Role}");
            if (roleResponse.IsSuccessStatusCode)
            {
                var roleRepresentation = await roleResponse.Content.ReadFromJsonAsync<JsonElement>();
                
                var roleMappingPayload = new[] { roleRepresentation };
                var roleMappingResponse = await httpClient.PostAsJsonAsync(
                    $"admin/realms/{realm}/users/{userId}/role-mappings/realm", 
                    roleMappingPayload);
                
                if (!roleMappingResponse.IsSuccessStatusCode)
                {
                    logger.LogWarning($"Failed to assign role {request.Role} to user {userId}");
                }
            }

            await SyncUserFromKeycloakAsync(userId);

            return userId;
        }
        catch (Exception ex)
        {
            logger.LogError($"Error creating user in Keycloak: {ex.Message}");
            throw;
        }
    }

    public async Task UpdateUserInKeycloakAsync(UpdateUserRequestDto request)
    {
        try
        {
            var token = await GetAdminTokenAsync();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var userPayload = new
            {
                email = request.EmailAddress,
                firstName = request.FirstName,
                lastName = request.SecondName,
                username = request.EmailAddress
            };

            var updateResponse = await httpClient.PutAsJsonAsync(
                $"admin/realms/{realm}/users/{request.KeycloakUserId}", 
                userPayload);

            if (!updateResponse.IsSuccessStatusCode)
            {
                var errorBody = await updateResponse.Content.ReadAsStringAsync();
                throw new Exception($"Failed to update user in Keycloak: {errorBody}");
            }

            await usersService.UpdateUserFromKeycloakAsync(request.KeycloakUserId, new UpdateUserFromKeycloakDto(
                EmailAddress: request.EmailAddress,
                FirstName: request.FirstName,
                SecondName: request.SecondName,
                PhoneNumber: request.PhoneNumber,
                TIN: request.TIN
            ));
        }
        catch (Exception ex)
        {
            logger.LogError($"Error updating user in Keycloak: {ex.Message}");
            throw;
        }
    }

    public async Task DeleteUserFromKeycloakAsync(string keycloakUserId)
    {
        try
        {
            var token = await GetAdminTokenAsync();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var deleteResponse = await httpClient.DeleteAsync($"admin/realms/{realm}/users/{keycloakUserId}");
            
            if (!deleteResponse.IsSuccessStatusCode)
            {
                var errorBody = await deleteResponse.Content.ReadAsStringAsync();
                throw new Exception($"Failed to delete user in Keycloak: {errorBody}");
            }

            await usersService.DeleteUserByKeycloakIdAsync(keycloakUserId);
        }
        catch (Exception ex)
        {
            logger.LogError($"Error deleting user from Keycloak: {ex.Message}");
            throw;
        }
    }
}