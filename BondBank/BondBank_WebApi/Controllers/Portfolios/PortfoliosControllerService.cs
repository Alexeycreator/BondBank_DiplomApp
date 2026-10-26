using BondBank_WebApi.Models.DataBase;
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

    private async Task<List<PortfoliosModel>> LoadPortfoliosAsync()
    {
        try
        {
            var portfoliosData = await dbContext.Portfolios.ToListAsync();
            if (portfoliosData.Any())
            {
                return portfoliosData;
            }

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
        {
            logger.LogWarning("Данных о портфелях пользователя ID = {UserId} нет", userId);
        }

        return userPortfolios;
    }
}