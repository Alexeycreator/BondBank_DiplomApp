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
        logger.LogInformation($"Процесс получения портфеля пользователя с ID = {userId}");
        return await LoadPortfoliosAsync(userId);
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
            logger.LogError($"Ошибка при работе с Npgsql: {ex.Message}. Code: {ex.ErrorCode}");
            return new List<PortfoliosModel>();
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при получении информации о пользователях: {ex.Message}");
            return new List<PortfoliosModel>();
        }
    }

    private async Task<List<PortfoliosModel>> LoadPortfoliosAsync(int userId)
    {
        try
        {
            var userPortfolios = await dbContext.Portfolios.Where(p => p.UserId == userId).ToListAsync();
            if (userPortfolios.Any())
            {
                return userPortfolios;
            }

            logger.LogWarning($"Данных о портфелях пользователя ID = {userId} нет");
            return new List<PortfoliosModel>();
        }
        catch (NpgsqlException ex)
        {
            logger.LogError($"Ошибка при работе Npgsql: {ex.Message}. Code: {ex.ErrorCode}");
            return new List<PortfoliosModel>();
        }
        catch (Exception ex)
        {
            logger.LogError(
                $"Неизвестная ошибка при получении информации о пользователе с ID = {userId}. {ex.Message}");
            return new List<PortfoliosModel>();
        }
    }
}