using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Models.DTOs.Portfolios;
using BondBank_WebApi.Services.DataContext;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BondBank_WebApi.Controllers.Portfolios;

public sealed class PortfoliosControllerService(
    ILogger<PortfoliosControllerService> logger,
    ApplicationContext dbContext) : IPortfoliosControllerService
{
    public async Task<IEnumerable<PortfoliosModel>> GetAllPortfoliosAsync()
    {
        logger.LogInformation($"Процесс получения всех портфелей");
        return await LoadPortfoliosAsync();
    }

    public async Task<IEnumerable<PortfoliosModel>> GetAllPortfoliosByUserAsync(int userId)
    {
        logger.LogInformation("Процесс получения портфеля пользователя с ID = {UserId}", userId);
        return await LoadPortfoliosAsync(userId);
    }

    public async Task<IEnumerable<HistoryPortfoliosModel>> GetPortfolioHistoryAsync(int portfolioId)
    {
        logger.LogInformation("Получение истории портфеля ID = {PortfolioId}", portfolioId);
        return await dbContext.HistoryPortfolios
            .AsNoTracking()
            .Where(history => history.PortfoliosId == portfolioId)
            .OrderBy(history => history.DateSavePortfolioUser)
            .ToListAsync();
    }

    public async Task<int> SavePortfolioAsync(string keycloakId, int? portfolioId, PortfolioRequestDto dto)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.KeycloakId == keycloakId);
            if (user == null)
                return 0;

            PortfoliosModel? portfolio;

            if (portfolioId is > 0)
            {
                portfolio = await dbContext.Portfolios.FirstOrDefaultAsync(p => p.Id == portfolioId.Value);

                if (portfolio == null || portfolio.UserId != user.Id)
                {
                    logger.LogWarning("Попытка обновить чужой портфель ID={PortfolioId} пользователем {Email}",
                        portfolioId, user.EmailAddress);
                    return 0;
                }
            }
            else
            {
                portfolio = new PortfoliosModel
                {
                    UserId = user.Id
                };
                await dbContext.Portfolios.AddAsync(portfolio);
            }

            portfolio.Name = dto.Name;
            portfolio.Description = dto.Description;
            portfolio.Type = dto.Type;

            if (portfolioId is null or 0)
                portfolio.CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow);

            await dbContext.SaveChangesAsync();
            logger.LogInformation("Портфель ID={Id} успешно сохранен для {Email}", portfolio.Id, user.EmailAddress);
            return portfolio.Id;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка БД при сохранении портфеля: {ExMessage}. Код: {ExErrorCode}", ex.Message,
                ex.ErrorCode);
            return 0;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при сохранении портфеля: {ExMessage}", ex.Message);
            return 0;
        }
    }

    public async Task<bool> DeletePortfolioAsync(string keycloakId, int portfolioId)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.KeycloakId == keycloakId);
            if (user == null)
                return false;

            var portfolio = await dbContext.Portfolios.FirstOrDefaultAsync(p => p.Id == portfolioId);

            if (portfolio == null || portfolio.UserId != user.Id)
                return false;

            dbContext.Portfolios.Remove(portfolio);
            await dbContext.SaveChangesAsync();

            logger.LogInformation("Портфель ID={PortfolioId} удален пользователем {Email}", portfolioId,
                user.EmailAddress);
            return true;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка БД при удалении портфеля: {ExMessage}. Код: {ExErrorCode}", ex.Message,
                ex.ErrorCode);
            return false;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при удалении портфеля: {ExMessage}", ex.Message);
            return false;
        }
    }

    private async Task<List<PortfoliosModel>> LoadPortfoliosAsync()
    {
        try
        {
            var portfoliosData = await dbContext.Portfolios.ToListAsync();
            if (portfoliosData.Count != 0)
                return portfoliosData;

            logger.LogWarning($"Данных о портфелях нет");
            return new List<PortfoliosModel>();
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе с Npgsql: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            return new List<PortfoliosModel>();
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении информации о пользователях: {ExMessage}", ex.Message);
            return new List<PortfoliosModel>();
        }
    }

    private async Task<List<PortfoliosModel>> LoadPortfoliosAsync(int userId)
    {
        var userPortfolios = await dbContext.Portfolios
            .Where(portfolio => portfolio.UserId == userId)
            .ToListAsync();
        if (userPortfolios.Count == 0)
            logger.LogWarning("Данных о портфелях пользователя ID = {UserId} нет", userId);

        return userPortfolios;
    }
}