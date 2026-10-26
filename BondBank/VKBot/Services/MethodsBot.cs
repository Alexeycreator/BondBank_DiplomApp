using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using VKBot.Config;
using VkNet;
using VkNet.Enums.StringEnums;
using VkNet.Exception;
using VkNet.Model;

namespace VKBot.Services;

public sealed class MethodsBot(ILogger<MethodsBot> logger, VkApi vkApi)
{
    private ulong groupId;
    private string nameCommunity;
    private Dictionary<long, bool> welcomeFromUser = new Dictionary<long, bool>();
    private Dictionary<long, bool> isAwaitingParserChoice = new Dictionary<long, bool>();
    private HashSet<long> usersIdListHashSet = new HashSet<long>();

    private readonly string ConfigFilePath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory,
        "..", "..", "..", "Config", "bot_config.json"));

    private readonly string ConfigFileBaseDirectoryPath = $"Config/bot_config.json";

    public void SetGroupId(ulong groupId) => this.groupId = groupId;

    /// <summary>
    /// Метод запуска бота
    /// </summary>
    public async Task RunAsync()
    {
        try
        {
            ObtainingCommunityData();
            FillingUsersIdListHashSet();
            logger.LogInformation(
                $"Информация успешно получена." + Environment.NewLine + $"Создание Long Poll сервера.");
            var longPollServer = vkApi.Groups.GetLongPollServer(groupId);

            while (true)
            {
                try
                {
                    // Создаем Long Poll сервер
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
                            // Анализируем сообщения
                            ProcessUpdate(update);
                        }

                        logger.LogInformation($"Обновляем ts, после прихода сообщения...");
                        longPollServer.Ts = poll.Ts;
                    }
                }
                catch (LongPollOutdateException ex) when (ex.Ts != 0)
                {
                    logger.LogWarning("Ts устарел, обновляем на {ExTs}", ex.Ts);
                    longPollServer.Ts = ex.Ts;
                }
                catch (LongPollOutdateException ex) when (ex.Ts == 0)
                {
                    logger.LogWarning($"Ts устарел, но новый Ts = 0. Пересоздаем Long Poll сервер...");
                    longPollServer = vkApi.Groups.GetLongPollServer(groupId);
                }
                catch (LongPollException ex)
                {
                    logger.LogError("Long Poll ошибка: {ExMessage}", ex.Message);
                    longPollServer = vkApi.Groups.GetLongPollServer(groupId);
                }
                catch (Exception ex)
                {
                    logger.LogError("Неизвестная ошибка: {ExMessage}", ex.Message);
                    await Task.Delay(TimeSpan.FromMinutes(30));
                    throw;
                }
            }
        }
        catch (AccessTokenInvalidException ex)
        {
            logger.LogError("Неверный токен api: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            throw;
        }
        catch (VkApiException ex)
        {
            logger.LogError("Неизвестная ошибка: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            throw;
        }
    }

    private void ObtainingCommunityData()
    {
        logger.LogInformation($"Получение информации о сообществе...");
        var groups = vkApi.Groups.GetById(null, groupId.ToString(), null);
        var groupInfo = groups.FirstOrDefault();

        if (groupInfo == null)
        {
            return;
        }

        nameCommunity = groupInfo.Name;
    }

    private void FillingUsersIdListHashSet()
    {
        var json = CheckExistingFileConfig();

        if (string.IsNullOrEmpty(json))
        {
            logger.LogWarning("Не удалось прочитать файл конфигурации");
        }

        logger.LogInformation($"Файл конфигурации успешно прочитан. Десериализация данных...");
        var config = JsonSerializer.Deserialize<ServiceConfig>(json);
        if (config != null)
        {
            logger.LogInformation($"Данные успешно десериализованы.");
            if (config.Bot.UsersId.Count > 0)
            {
                usersIdListHashSet.UnionWith(config.Bot.UsersId);
                logger.LogInformation("Загружено {UsersIdCount} пользователей в коллекцию", config.Bot.UsersId.Count);
            }

            logger.LogWarning($"Информации о пользователях еще нет в системе. Ожидаю...");
        }

        logger.LogWarning($"Файл конфигурации не удалось десериализовать");
    }

    private string CheckExistingFileConfig()
    {
        try
        {
            if (File.Exists(ConfigFilePath))
            {
                return File.ReadAllText(ConfigFilePath);
            }

            logger.LogWarning("Файл не найден: {ConfigFilePath}", ConfigFilePath);
            return "";
        }
        catch (FileNotFoundException ex)
        {
            logger.LogError("Файл не найден: {ExMessage}", ex.Message);
            return "";
        }
        catch (IOException ex)
        {
            logger.LogError("Ошибка при работе с файлом: {ExMessage}", ex.Message);
            return "";
        }
    }

    /// <summary>
    /// Получаем какое-то обновление (сообщение), проверяем группу обновления и работаем с ней
    /// </summary>
    /// <param name="update">Группа обновления</param>
    private void ProcessUpdate(GroupUpdate update)
    {
        if (update.Type.Value == GroupUpdateType.MessageNew)
        {
            /*
             В данной версии VkNet 1.78.0 лучше использовать приведение типа
             для получения данных о сообщении и пользователе
            */
            var message = update.Instance as MessageNew;
            if (message == null)
            {
                logger.LogWarning($"Сообщение пустое или не получилось его десериализовать.");
            }
            else
            {
                if (message.Message.FromId != null)
                {
                    // Заполняем словарь с пользователями и после успеха заполняем коллекцию
                    var userId = message.Message.FromId.Value;
                    FillDictionary(userId);
                    FillingInfoForUserId(userId);

                    // Проверяем тип сообщения, пришел текст или цифра
                    if (welcomeFromUser.TryGetValue(userId, out _))
                    {
                        logger.LogInformation(
                            "Обработка входящего сообщения: '{MessageNew}', полученного от пользователя '{UserId}'.", message, userId);
                        CheckTypeMessage(userId, message);
                    }
                }
            }
        }
    }

    /// <summary>
    /// Пытаемся заполнить словарь, но если что-то не так, то удаляем ключ (id)
    /// </summary>
    /// <param name="userId">id пользователя</param>
    private void FillDictionary(long userId)
    {
        logger.LogInformation("Добавление id: '{UserId}' в словарь.", userId);
        if (welcomeFromUser.TryAdd(userId, false))
        {
            try
            {
                logger.LogInformation($"Добавление прошло успешно." + Environment.NewLine +
                                      $"Отправка приветственного сообщения для пользователя '{userId}'.");
                SendWelcomeMessageForUser(userId);
                welcomeFromUser[userId] = true;
                logger.LogInformation($"Приветственное сообщение доставлено.");
            }
            catch (Exception ex)
            {
                welcomeFromUser.Remove(userId);
                logger.LogWarning(
                    "Не получилось добавить пользователя в словарь. Его id: '{UserId}' удален. Пробуем снова... Информация об ошибке: {ExMessage}", userId, ex.Message);
            }
        }
    }

    /// <summary>
    /// Приветственное сообщение для каждого пользователя, кто впервые что-то написал боту
    /// </summary>
    /// <param name="userId">id пользователя</param>
    private void SendWelcomeMessageForUser(long userId)
    {
        vkApi.Messages.Send(new MessagesSendParams
        {
            UserId = userId,
            Message = $"Вас приветствует бот сообщества '{nameCommunity}'." + Environment.NewLine +
                      $"Я предоставляю информацию о работе парсеров." + Environment.NewLine +
                      $"Вы хотите получить информацию о состоянии парсеров?" + Environment.NewLine + $"- Да" +
                      Environment.NewLine + $"- Нет",
            RandomId = new Random().Next(0, int.MaxValue)
        });
    }

    private void FillingInfoForUserId(long userId)
    {
        try
        {
            if (!usersIdListHashSet.Add(userId))
            {
                logger.LogInformation("Пользователь '{UserId}' уже существует в коллекции", userId);
                return;
            }

            logger.LogInformation("Пользователь '{UserId}' добавлен в коллекцию. Добавление в конфигурацию...", userId);
            SaveUsersToConfig(userId);
        }
        catch (InvalidOperationException ex)
        {
            logger.LogError("Во время перебора коллекции, что-то пошло не так: {ExMessage}", ex.Message);
        }
        catch (NullReferenceException ex)
        {
            logger.LogError("Ошибка с инициализацией коллекции: {ExMessage}. Создаю новую...", ex.Message);
            usersIdListHashSet = new HashSet<long>();
            usersIdListHashSet.Add(userId);
            logger.LogInformation("Пользователь '{UserId}' добавлен после восстановления", userId);
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка: {ExMessage}", ex.Message);
        }
    }

    private void SaveUsersToConfig(long userId)
    {
        try
        {
            var json = CheckExistingFileConfig();
            if (string.IsNullOrEmpty(json))
            {
                logger.LogWarning("Не удалось прочитать файл конфигурации");
                return;
            }

            logger.LogInformation($"Json файл конфигурации успешно считан. Десериализация данных...");
            var config = JsonSerializer.Deserialize<ServiceConfig>(json);
            if (config != null)
            {
                logger.LogInformation($"Данные успешно десериализованы.");
                if (!(config.Bot.UsersId.Count > 0 && config.Bot.UsersId.Contains(userId)))
                {
                    config.Bot.UsersId = usersIdListHashSet;
                    var updatedJson = JsonSerializer.Serialize(config, new JsonSerializerOptions
                    {
                        WriteIndented = true
                    });

                    File.WriteAllText(ConfigFilePath, updatedJson);
                    File.WriteAllText(ConfigFileBaseDirectoryPath, updatedJson);
                    logger.LogInformation("Конфиг обновлен. Всего пользователей: {UsersIdCount}", config.Bot.UsersId.Count);
                }

                logger.LogInformation($"Конфигурацию обновлять не нужно, данные не обновились.");
            }
            else
            {
                logger.LogWarning($"Не удалось десериализовать файл конфигурации");
            }
        }
        catch (JsonException ex)
        {
            logger.LogError("Ошибка парсинга JSON: {ExMessage}", ex.Message);
        }
    }

    private void CheckTypeMessage(long userId, MessageNew message)
    {
        var text = message.Message.Text.Trim();
        if (int.TryParse(text, out int number) && number >= 1 && number <= 4)
        {
            ResponseMessageToUserIsNumber(userId, number);
        }
        else
        {
            ResponseMessageToUserIsText(userId, text);
        }
    }

    /// <summary>
    /// Проверяем какое число ввел пользователь и выводим ему нужное сообщение
    /// </summary>
    /// <param name="userId">id пользователя</param>
    /// <param name="number">Номер, введенный пользователем</param>
    private void ResponseMessageToUserIsNumber(long userId, int number)
    {
        isAwaitingParserChoice[userId] = false;

        switch (number)
        {
            case 1:
                SendMessageToUser(userId,
                    "Уточняю информацию... Подождите минутку");
                SendMessageToUser(userId,
                    "Данный парсер еще в разработке" + Environment.NewLine + $"Могу ли еще чем-нибудь вам помочь?" +
                    Environment.NewLine + $"- Да" + Environment.NewLine + $"- Нет");
                return;
            case 2:
                SendMessageToUser(userId,
                    "Данный парсер еще в разработке" + Environment.NewLine + $"Могу ли еще чем-нибудь вам помочь?" +
                    Environment.NewLine + $"- Да" + Environment.NewLine + $"- Нет");
                return;
            case 3:
                SendMessageToUser(userId,
                    "Данный парсер еще в разработке" + Environment.NewLine + $"Могу ли еще чем-нибудь вам помочь?" +
                    Environment.NewLine + $"- Да" + Environment.NewLine + $"- Нет");
                return;
            case 4:
                SendMessageToUser(userId,
                    "Данный парсер еще в разработке" + Environment.NewLine + $"Могу ли еще чем-нибудь вам помочь?" +
                    Environment.NewLine + $"- Да" + Environment.NewLine + $"- Нет");
                return;
        }
    }

    /// <summary>
    /// Проверяем какое слово указал пользователь и выводим нужное сообщение для него
    /// </summary>
    /// <param name="userId">id пользователя</param>
    /// <param name="text">сообщение</param>
    private void ResponseMessageToUserIsText(long userId, string? text)
    {
        bool isAwaiting = isAwaitingParserChoice.TryGetValue(userId, out bool value) && value;

        if (text != null)
        {
            var match = Regex.Match(text,
                @"(WienerBoerse|WienerBoerseParser|LjubljanaStockExchange|LjubljanaStockExchangeParser|MoscowExchange|MoscowExchangeParser|SixGroup|SixGroupParser|парсер(а|ов|ы)?|команд(а|у|ы)?|да|нет)",
                RegexOptions.IgnoreCase);

            string messageCommand =
                $"Мои команды: " + Environment.NewLine + $"/start" + Environment.NewLine +
                $"/help" + Environment.NewLine + $"/status";

            if (match.Success)
            {
                switch (match.Value.ToLower())
                {
                    case "парсер":
                    case "да":
                        isAwaitingParserChoice[userId] = true;
                        string messageParserCase = $"Какой именно парсер вас интересует?" + Environment.NewLine +
                                                   $"Я предоставляю информацию только по следующим парсерам:" +
                                                   Environment.NewLine + $"1) WienerBoerseParser" +
                                                   Environment.NewLine +
                                                   $"2) LjubljanaStockExchangeParser" + Environment.NewLine +
                                                   $"3) MoscowExchangeParser" + Environment.NewLine +
                                                   $"4) SixGroupParser";
                        SendMessageToUser(userId, messageParserCase);
                        break;
                    case "wienerboerse":
                    case "wienerboerseparser":
                        isAwaitingParserChoice[userId] = true;
                        string messageWienerBoerseParser =
                            "Данный парсер еще в разработке" + Environment.NewLine +
                            $"Могу ли еще чем-нибудь вам помочь?" +
                            Environment.NewLine + $"- Да" + Environment.NewLine + $"- Нет";
                        SendMessageToUser(userId, messageWienerBoerseParser);
                        break;
                    case "ljubljanastockexchange":
                    case "ljubljanastockexchangeparser":
                        isAwaitingParserChoice[userId] = true;
                        string messageLjubljanaStockExchangeParser =
                            "Данный парсер еще в разработке" + Environment.NewLine +
                            $"Могу ли еще чем-нибудь вам помочь?" +
                            Environment.NewLine + $"- Да" + Environment.NewLine + $"- Нет";
                        SendMessageToUser(userId, messageLjubljanaStockExchangeParser);
                        break;
                    case "moscowexchange":
                    case "moscowexchangeparser":
                        isAwaitingParserChoice[userId] = true;
                        string messageMoscowExchangeParser =
                            "Данный парсер еще в разработке" + Environment.NewLine +
                            $"Могу ли еще чем-нибудь вам помочь?" +
                            Environment.NewLine + $"- Да" + Environment.NewLine + $"- Нет";
                        SendMessageToUser(userId, messageMoscowExchangeParser);
                        break;
                    case "sixgroup":
                    case "sixgroupparser":
                        isAwaitingParserChoice[userId] = true;
                        string messageSixGroupParser =
                            "Данный парсер еще в разработке" + Environment.NewLine +
                            $"Могу ли еще чем-нибудь вам помочь?" +
                            Environment.NewLine + $"- Да" + Environment.NewLine + $"- Нет";
                        SendMessageToUser(userId, messageSixGroupParser);
                        break;
                    case "команды":
                    case "команду":
                    case "команда":
                        isAwaitingParserChoice[userId] = true;
                        SendMessageToUser(userId, messageCommand);
                        break;
                    case "нет":
                        isAwaitingParserChoice[userId] = false;
                        string messageNo = $"Хорошо. Обращайтесь, если будет нужно!";
                        SendMessageToUser(userId, messageNo);
                        break;
                }
            }
            else if (isAwaiting)
            {
                string messageDefault = $"Не могу распознать ваше сообщение: '{text}'" +
                                        Environment.NewLine + $"К сожалению у меня нет указаний на ваш вопрос." +
                                        Environment.NewLine + Environment.NewLine + $"{messageCommand}";
                SendMessageToUser(userId, messageDefault);
            }
        }
    }

    /// <summary>
    /// Метод вывода сообщения пользователю, в качестве параметров передаем id пользователя и сообщение для него
    /// </summary>
    /// <param name="userId">id пользователя</param>
    /// <param name="message">сообщение</param>
    private void SendMessageToUser(long userId, string message)
    {
        vkApi.Messages.Send(new MessagesSendParams()
        {
            UserId = userId,
            Message = message,
            RandomId = new Random().Next(0, int.MaxValue)
        });
    }

    public void SendMessageToUser(string message)
    {
        foreach (var userId in usersIdListHashSet)
        {
            try
            {
                SendMessageToUser(userId, message);
            }
            catch (AccessTokenInvalidException ex)
            {
                logger.LogError("Неверный токен api: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            }
            catch (VkApiException ex)
            {
                logger.LogError("Ошибка библиотеки VkApi: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            }
            catch (Exception ex)
            {
                logger.LogError("Неизвестная ошибка: {ExMessage}", ex.Message);
            }
        }
    }
}