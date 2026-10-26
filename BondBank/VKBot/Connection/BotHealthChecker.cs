using Microsoft.Extensions.Logging;
using VkNet;
using VkNet.Exception;
using VkNet.Model;

namespace VKBot.Connection;

public sealed class BotHealthChecker(ILogger<BotHealthChecker> logger)
{
    private string accessToken;
    private long adminId;
    private ulong groupId;
    private bool isActiveBot;

    public void SetAccessToken(string accessToken) => this.accessToken = accessToken;
    public void SetAdminId(long adminId) => this.adminId = adminId;
    public void SetGroupId(ulong groupId) => this.groupId = groupId;

    public async Task<bool> IsBotActiveAsync(VkApi vkApi, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(accessToken))
        {
            logger.LogWarning("Токен доступа к сообществу пустой: {AccessToken}", accessToken);
            return false;
        }

        try
        {
            return CheckingResponseMessageForUser(vkApi) || CheckingLongPollServer(vkApi);
        }

        #region SpecificBlocksCatch

        catch (VkApiException ex) when (ex.ErrorCode == 901)
        {
            // Пользователь не начал диалог с ботом
            logger.LogError("Ошибка {ExErrorCode}: Пользователь {AdminId} не начал диалог с ботом", ex.ErrorCode, adminId);
            return false;
        }
        catch (VkApiException ex) when (ex.ErrorCode == 902)
        {
            // Пользователь запретил отправку сообщений
            logger.LogError("Ошибка {ExErrorCode}: Пользователь {AdminId} запретил отправку сообщений", ex.ErrorCode, adminId);
            return false;
        }
        catch (VkApiException ex) when (ex.ErrorCode == 913)
        {
            // Сообщение слишком длинное
            logger.LogError("Ошибка {ExErrorCode}: Сообщение слишком длинное", ex.ErrorCode);
            return false;
        }
        catch (VkApiException ex) when (ex.ErrorCode == 14)
        {
            // Требуется капча
            logger.LogError("Ошибка {ExErrorCode}: Требуется капча", ex.ErrorCode);
            return false;
        }
        catch (VkApiException ex) when (ex.ErrorCode == 5)
        {
            // Неверная авторизация
            logger.LogError("Ошибка {ExErrorCode}: Неверная авторизация. Проверьте токен", ex.ErrorCode);
            return false;
        }
        catch (VkApiException ex) when (ex.ErrorCode == 6)
        {
            // Слишком много запросов
            logger.LogError("Ошибка {ExErrorCode}: Слишком много запросов (флуд)", ex.ErrorCode);
            return false;
        }
        catch (VkApiException ex) when (ex.ErrorCode == 7)
        {
            // Нет прав на выполнение действия
            logger.LogError("Ошибка {ExErrorCode}: Нет прав на получение Long Poll сервера", ex.ErrorCode);
            return false;
        }
        catch (VkApiException ex) when (ex.ErrorCode == 9)
        {
            // Слишком много однотипных действий
            logger.LogError("Ошибка {ExErrorCode}: Слишком много однотипных действий", ex.ErrorCode);
            return false;
        }
        catch (VkApiException ex) when (ex.ErrorCode == 10)
        {
            // Внутренняя ошибка сервера
            logger.LogError("Ошибка {ExErrorCode}: Внутренняя ошибка сервера ВК", ex.ErrorCode);
            return false;
        }
        catch (AccessTokenInvalidException ex)
        {
            // Неверный или истекший токен
            logger.LogError("Ошибка авторизации: {ExMessage}", ex.Message);
            return false;
        }
        catch (VkApiException ex)
        {
            // Любая другая ошибка VK API
            logger.LogError("Ошибка VK API: {ExMessage} (Код: {ExErrorCode})", ex.Message, ex.ErrorCode);
            return false;
        }
        catch (HttpRequestException ex)
        {
            // Проблемы с интернет-соединением
            logger.LogError("Ошибка соединения: {ExMessage}", ex.Message);
            return false;
        }
        catch (TaskCanceledException ex)
        {
            // Таймаут запроса
            logger.LogError("Таймаут запроса: {ExMessage}", ex.Message);
            return false;
        }

        #endregion

        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка: {ExMessage}", ex.Message);
            return false;
        }
    }

    private bool CheckingResponseMessageForUser(VkApi vkApi)
    {
        var result = vkApi.Messages.Send(new MessagesSendParams()
        {
            UserId = adminId,
            Message = "✅ Бот работает!",
            RandomId = new Random().Next(0, int.MaxValue)
        });
        logger.LogInformation("Бот активен. Сообщение отправлено! Id: {Result}", result);
        isActiveBot = true;
        return true;
    }

    private bool CheckingLongPollServer(VkApi vkApi)
    {
        logger.LogWarning(
            $"Попытка отправки сообщения боту оказались безуспешными, попытка проверки работы сервера Long Poll...");
        var server = vkApi.Groups.GetLongPollServer(groupId);
        logger.LogInformation($"Long Poll сервер запущен!" + Environment.NewLine + $"Server: {server.Server}" +
                              Environment.NewLine + $"Key: {server.Key}" + Environment.NewLine + $"Ts: {server.Ts}");
        isActiveBot = true;
        return true;
    }

    public async Task<string> GetStatusAsync()
    {
        return isActiveBot ? $"Да-да. Я вас слушаю." : $"Статус бота: {isActiveBot}";
    }
}