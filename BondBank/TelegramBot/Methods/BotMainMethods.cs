using Microsoft.Extensions.Logging;
using Telegram.Bot;
using Telegram.Bot.Exceptions;
using Telegram.Bot.Polling;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Telegram.Bot.Types.ReplyMarkups;

namespace TelegramBot.Methods;

public sealed class BotMainMethods(ILogger<BotMainMethods> logger)
{
    // общения с пользователями (чтобы бот сам писал при запуске)
    private static readonly long[] usersChatId = [5545044026, 5784948066, 814366416];
    private static ITelegramBotClient botTelegramClient;
    private static ReceiverOptions receiverOptions;

    public void RunBot(string? botToken, int timeOutBot)
    {
        try
        {
            logger.LogInformation($"Запуск бота...");
            botTelegramClient = new TelegramBotClient($"{botToken}");
            receiverOptions = new ReceiverOptions
            {
                AllowedUpdates =
                    new
                        [] // Тут указываем типы получаемых Update`ов, о них подробнее расказано тут https://core.telegram.org/bots/api#update
                        {
                            UpdateType.Message,
                            UpdateType.CallbackQuery,
                        },
            };
            using var receiveCts = new CancellationTokenSource();
            botTelegramClient.StartReceiving(UpdateHandlerAsync, ErrorHandler, receiverOptions, receiveCts.Token);
            using var getBotMeCts = new CancellationTokenSource(TimeSpan.FromMinutes(timeOutBot));
            try
            {
                var bot = botTelegramClient.GetMe(getBotMeCts.Token);
                logger.LogInformation("Бот {ResultFirstName} запущен", bot.Result.FirstName);
                SendWelcomeMessage($"{bot.Result.FirstName}");
            }
            catch (OperationCanceledException)
            {
                logger.LogError("Бот не отвечает более {TimeOutBot} минут. Пересоздайте токен бота.", timeOutBot);
            }

            Task.Delay(-1, getBotMeCts.Token);
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка: {ExMessage}", ex.Message);
        }
    }

    public void SendMessageToUsers(string message)
    {
        foreach (var user in usersChatId)
        {
            try
            {
                botTelegramClient?.SendMessage(user, message);
                logger.LogInformation("Сообщение '{Message}' отправлено пользователю '{User}'", message, user);
            }
            catch (Exception ex)
            {
                logger.LogInformation("Ошибка отправки сообщения '{Message}' пользователю '{User}': {ExMessage}", message, user, ex.Message);
            }
        }
    }

    private void SendWelcomeMessage(string botName)
    {
        foreach (var user in usersChatId)
        {
            try
            {
                botTelegramClient.SendMessage(
                    user, $"Вас приветствует информатор {botName} !" + Environment.NewLine +
                          $"Я отвечаю за предоставление информации о работе приложения для получения облигаций." +
                          Environment.NewLine + $"Мои команды:" + Environment.NewLine + $"/start" +
                          Environment.NewLine + $"/inline" + Environment.NewLine + $"/help"
                );
                logger.LogInformation("Сообщение отправлено пользователю '{User}'", user);
            }
            catch (Exception ex)
            {
                logger.LogInformation("Ошибка отправки пользователю '{User}': {ExMessage}", user, ex.Message);

                if (ex.Message.Contains("Forbidden"))
                {
                    logger.LogInformation("Forbidden: Пользователь {User} заблокировал бота или не начинал диалог", user);
                }
                else if (ex.Message.Contains("Bad Request: chat not found"))
                {
                    logger.LogInformation("Bad Request: chat not found. Неверный Chat ID: {User}", user);
                }
                else if (ex.Message.Contains("bots can't send messages to bots"))
                {
                    logger.LogInformation("bots can't send messages to bots. {User} является ботом", user);
                }
            }
        }
    }

    private async Task UpdateHandlerAsync(ITelegramBotClient botClient, Update update,
        CancellationToken cancellationToken)
    {
        try
        {
            switch (update.Type)
            {
                case UpdateType.Message:
                {
                    var message = update.Message;

                    var user = message?.From;
                    logger.LogInformation("{UserFirstName} ({UserId}) написал сообщение: {MessageText}", user?.FirstName, user?.Id, message?.Text);
                    var chat = message?.Chat;
                    if (chat != null)
                    {
                        switch (message?.Type)
                        {
                            case MessageType.Text:
                                switch (message.Text)
                                {
                                    case "/start":
                                        await botClient.SendMessage(
                                            chat.Id,
                                            $"Вас приветствует информатор {botClient.GetMyName(cancellationToken: cancellationToken)} !" +
                                            Environment.NewLine +
                                            $"Я отвечаю за предоставление информации о работе приложения для получения облигаций." +
                                            Environment.NewLine + $"Мои команды: " + Environment.NewLine + $"/start" +
                                            Environment.NewLine + $"/inline" + Environment.NewLine + $"/help",
                                            cancellationToken: cancellationToken);
                                        break;
                                    case "/inline":
                                        var inlineKeyboard = new InlineKeyboardMarkup(
                                            new
                                                List<InlineKeyboardButton[]>()
                                                // здесь создаем лист (массив), который содрежит в себе массив из класса кнопок
                                                {
                                                    // Каждый новый массив - это дополнительные строки,
                                                    // а каждая дополнительная строка (кнопка) в массиве - это добавление ряда

                                                    new InlineKeyboardButton[] // тут создаем массив кнопок
                                                    {
                                                        InlineKeyboardButton.WithCallbackData(
                                                            "Перезапустить приложение",
                                                            "reloadApp"),
                                                    }
                                                });
                                        break;
                                    case "/help":
                                        await botClient.SendMessage(
                                            chat.Id,
                                            $"Информация о боте",
                                            cancellationToken: cancellationToken);
                                        break;
                                }

                                break;
                            default:
                            {
                                await botClient.SendMessage(
                                    chat.Id,
                                    "Используй только текст!", cancellationToken: cancellationToken);
                                break;
                            }
                        }
                    }

                    break;
                }
                case UpdateType.CallbackQuery:
                {
                    var callbackQuery = update.CallbackQuery;
                    var user = callbackQuery?.From;
                    logger.LogInformation("Пользователь '{UserId}' нажал на кнопку {CallbackQuery}", user?.Id, callbackQuery);
                    var chat = callbackQuery?.Message?.Chat;
                    switch (callbackQuery?.Data)
                    {
                        case "reloadApp":
                        {
                            await botClient.AnswerCallbackQuery(callbackQuery.Id, cancellationToken: cancellationToken);
                            if (chat != null)
                                await botClient.SendMessage(chat.Id,
                                    $"Вы нажали на {callbackQuery.Data}.\nПерезапуск...",
                                    cancellationToken: cancellationToken);
                            await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
                            /*string currentExe = Process.GetCurrentProcess().MainModule.FileName;
                            Process.Start(currentExe);
                            Thread.Sleep(5000); // Короткая задержка чтобы гарантировать запуск
                            Environment.Exit(0);*/

                            break;
                        }
                    }

                    break;
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка: {ExMessage}", ex.Message);
        }
    }

    private Task ErrorHandler(ITelegramBotClient botClient, Exception error, CancellationToken cancellationToken)
    {
        var errorMessage = error switch
        {
            ApiRequestException apiRequestException
                => $"Telegram API Error:\n[{apiRequestException.ErrorCode}]\n{apiRequestException.Message}",
            _ => error.ToString()
        };

        logger.LogError(errorMessage);
        return Task.CompletedTask;
    }
}