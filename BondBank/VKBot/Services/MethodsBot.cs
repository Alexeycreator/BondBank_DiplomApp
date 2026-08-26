using Microsoft.Extensions.Logging;
using VkNet;
using VkNet.Exception;
using VkNet.Model;

namespace VKBot.Services;

public sealed class MethodsBot(ILogger<MethodsBot> logger, VkApi vkApi)
{
    private ulong groupId;
    private long adminId;
    private string nameCommunity;

    public ulong SetGroupId(ulong groupId) => this.groupId = groupId;
    public long? SetAdminId(long adminId) => this.adminId = adminId;

    public async Task Run()
    {
        try
        {
            ObtainingCommunityData();
            SendWelcomeMessageForUser();

            var longPollServer = vkApi.Groups.GetLongPollServer(groupId);

            while (true)
            {
                try
                {
                    var poll = vkApi.Groups.GetBotsLongPollHistory(
                        new BotsLongPollHistoryParams
                        {
                            Server = longPollServer.Server,
                            Ts = longPollServer.Ts,
                            Key = longPollServer.Key,
                            Wait = 25
                        });

                    if (poll?.Updates != null)
                    {
                        foreach (var update in poll.Updates)
                        {
                            //ProcessUpdate(vkApi, update);
                        }

                        longPollServer.Ts = poll.Ts;
                    }
                }
                catch (LongPollOutdateException ex) when (ex.Ts != 0)
                {
                    logger.LogWarning($"Ts устарел, обновляем на {ex.Ts}");
                    longPollServer.Ts = ex.Ts;
                }
                catch (LongPollOutdateException ex) when (ex.Ts == 0)
                {
                    logger.LogWarning($"Ts устарел, но новый Ts = 0. Пересоздаем Long Poll сервер...");
                    longPollServer = vkApi.Groups.GetLongPollServer(groupId);
                }
                catch (LongPollException ex)
                {
                    logger.LogError($"Long Poll ошибка: {ex.Message}");
                    longPollServer = vkApi.Groups.GetLongPollServer(groupId);
                }
                catch (Exception ex)
                {
                    logger.LogError($"Неизвестная ошибка: {ex.Message}");
                    await Task.Delay(TimeSpan.FromMinutes(30));
                    throw;
                }
            }
        }
        catch (AccessTokenInvalidException ex)
        {
            logger.LogError($"Неверный токен api: {ex.Message}");
            throw;
        }
        catch (VkApiException ex)
        {
            logger.LogError($"Неизвестная ошибка: {ex.Message}");
            throw;
        }
    }

    // private void SendMessage(VkApi api, long userId, string message)
    // {
    //     try
    //     {
    //         api.Messages.Send(new MessagesSendParams
    //         {
    //             UserId = userId,
    //             Message = message,
    //             RandomId = new Random().Next(0, int.MaxValue)
    //         });
    //
    //         Console.WriteLine($"📤 Ответ отправлен пользователю {userId}");
    //     }
    //     catch (VkApiException ex)
    //     {
    //         Console.WriteLine($"⚠️ Ошибка при отправке: {ex.Message}");
    //     }
    // }

    private void ObtainingCommunityData()
    {
        var groups = vkApi.Groups.GetById(null, groupId.ToString(), null);
        var groupInfo = groups.FirstOrDefault();

        if (groupInfo == null)
        {
            return;
        }

        nameCommunity = groupInfo.Name;
    }

    private void SendWelcomeMessageForUser()
    {
        var message = vkApi.Messages.Send(new MessagesSendParams
        {
            UserId = adminId,
            Message = $"Вас приветствует бот сообщества '{nameCommunity}'." + Environment.NewLine +
                      $"Я предоставляю информацию о работе парсеров.",
            RandomId = new Random().Next(0, int.MaxValue)
        });
    }
}