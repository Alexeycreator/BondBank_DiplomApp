import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { User } from "../../types/index";
import styles from "./AuthPage.module.css";

/**
 * Режим страницы: вход или регистрация
 */
type AuthMode = "login" | "register" | "terms" | "privacy";

/**
 * Страница авторизации и регистрации
 */
const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register } = useAuth();

    const [mode, setMode] = useState<AuthMode>("login");
    const [error, setError] = useState<string>("");
    const [blockedUser, setBlockedUser] = useState<User | null>(null);

    // ✅ Согласие с условиями и политикой
    const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
    const [agreePrivacy, setAgreePrivacy] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        login: "",
        password: "",
        confirmPassword: "",
        email: "",
        phoneNumber: "",
        secondName: "",
        firstName: "",
        surName: "",
    });

    const from = (location.state as any)?.from?.pathname || "/portfolios";

    /**
     * Обработка входа
     */
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setBlockedUser(null);

        const result = login(formData.login, formData.password);

        if (result.success) {
            navigate(from, { replace: true });
        } else if (result.blockedUser) {
            setBlockedUser(result.blockedUser);
        } else {
            setError(result.message);
        }
    };

    /**
     * Обработка регистрации
     */
    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // ✅ Проверка согласия
        if (!agreeTerms) {
            setError("Необходимо согласиться с условиями использования");
            return;
        }
        if (!agreePrivacy) {
            setError("Необходимо согласиться с обработкой персональных данных");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }

        if (formData.password.length < 4) {
            setError("Пароль должен содержать минимум 4 символа");
            return;
        }

        const result = register({
            login: formData.login,
            password: formData.password,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            secondName: formData.secondName,
            firstName: formData.firstName,
            surName: formData.surName,
        });

        if (result.success) {
            navigate("/profile", { replace: true });
        } else {
            setError(result.message);
        }
    };

    // ==================== ЭКРАН БЛОКИРОВКИ ====================
    if (blockedUser) {
        return (
            <div className={styles.authPage}>
                <div className={styles.blockedCard}>
                    <div className={styles.blockedIcon}>🚫</div>
                    <h1 className={styles.blockedTitle}>Аккаунт заблокирован</h1>
                    <p className={styles.blockedMessage}>
                        Ваш аккаунт был заблокирован по требованию администратора.
                    </p>

                    <div className={styles.blockedInfo}>
                        <div className={styles.blockedRow}>
                            <span className={styles.blockedLabel}>Заблокирован:</span>
                            <span className={styles.blockedValue}>
                                {blockedUser.blockedAt
                                    ? new Date(blockedUser.blockedAt).toLocaleDateString("ru-RU")
                                    : "—"}
                            </span>
                        </div>
                        <div className={styles.blockedRow}>
                            <span className={styles.blockedLabel}>Кем:</span>
                            <span className={styles.blockedValue}>
                                {blockedUser.blockedBy || "Администратор"}
                            </span>
                        </div>
                    </div>

                    <p className={styles.blockedHint}>
                        Для восстановления доступа обратитесь в службу поддержки:
                    </p>
                    <a
                        href={`mailto:${blockedUser.blockedBy || "admin@bondbank.com"}`}
                        className={styles.supportEmail}
                    >
                        📧 {blockedUser.blockedBy || "admin@bondbank.com"}
                    </a>

                    <button
                        className={styles.backButton}
                        onClick={() => {
                            setBlockedUser(null);
                            setFormData({ ...formData, login: "", password: "" });
                        }}
                    >
                        ← Вернуться ко входу
                    </button>
                </div>
            </div>
        );
    }

    // ==================== ЭКРАН УСЛОВИЙ ИСПОЛЬЗОВАНИЯ ====================
    if (mode === "terms") {
        return (
            <div className={styles.authPage}>
                <div className={styles.documentCard}>
                    <div className={styles.documentHeader}>
                        <h1 className={styles.documentTitle}>📄 Условия использования</h1>
                        <button
                            className={styles.documentClose}
                            onClick={() => setMode("register")}
                        >
                            ✕
                        </button>
                    </div>

                    <div className={styles.documentContent}>
                        <h2>1. Общие положения</h2>
                        <p>
                            Настоящие Условия использования (далее — «Условия») регулируют порядок
                            использования платформы BondBank (далее — «Платформа»), предоставляемой
                            для мониторинга, анализа и прогнозирования облигаций.
                        </p>

                        <h2>2. Принятие условий</h2>
                        <p>
                            Используя Платформу, вы подтверждаете, что ознакомились с настоящими
                            Условиями, принимаете их в полном объёме и обязуетесь их соблюдать.
                            Если вы не согласны с Условиями, пожалуйста, прекратите использование
                            Платформы.
                        </p>

                        <h2>3. Регистрация и аккаунт</h2>
                        <p>
                            Для доступа к функциональности Платформы необходима регистрация.
                            Вы обязуетесь предоставлять достоверные данные при регистрации и
                            своевременно их обновлять. Вы несёте ответственность за сохранность
                            своих учётных данных.
                        </p>

                        <h2>4. Использование Платформы</h2>
                        <p>
                            Платформа предоставляется «как есть» для информационных и аналитических
                            целей. Запрещается:
                        </p>
                        <ul>
                            <li>Использовать Платформу в противоправных целях;</li>
                            <li>Пытаться получить несанкционированный доступ к данным;</li>
                            <li>Распространять вредоносное ПО через Платформу;</li>
                            <li>Копировать и распространять материалы без разрешения.</li>
                        </ul>

                        <h2>5. Интеллектуальная собственность</h2>
                        <p>
                            Все материалы Платформы, включая данные, аналитику, дизайн и код,
                            являются интеллектуальной собственностью BondBank и защищены
                            законодательством об авторском праве.
                        </p>

                        <h2>6. Ограничение ответственности</h2>
                        <p>
                            BondBank не несёт ответственности за возможные убытки, возникшие в
                            результате использования Платформы. Данные о котировках и прогнозы
                            носят информационный характер и не являются инвестиционной рекомендацией.
                        </p>

                        <h2>7. Изменение условий</h2>
                        <p>
                            BondBank оставляет за собой право изменять настоящие Условия.
                            Актуальная версия всегда доступна на этой странице.
                        </p>

                        <p className={styles.documentDate}>
                            Последнее обновление: 15 сентября 2026 г.
                        </p>
                    </div>

                    <div className={styles.documentActions}>
                        <button
                            className={styles.documentBackButton}
                            onClick={() => setMode("register")}
                        >
                            ← Вернуться к регистрации
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ==================== ЭКРАН ПОЛИТИКИ ПЕРСОНАЛЬНЫХ ДАННЫХ ====================
    if (mode === "privacy") {
        return (
            <div className={styles.authPage}>
                <div className={styles.documentCard}>
                    <div className={styles.documentHeader}>
                        <h1 className={styles.documentTitle}>🔒 Политика обработки персональных данных</h1>
                        <button
                            className={styles.documentClose}
                            onClick={() => setMode("register")}
                        >
                            ✕
                        </button>
                    </div>

                    <div className={styles.documentContent}>
                        <h2>1. Общие положения</h2>
                        <p>
                            Настоящая Политика определяет порядок обработки персональных данных
                            пользователей платформы BondBank (далее — «Оператор») в соответствии
                            с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».
                        </p>

                        <h2>2. Состав персональных данных</h2>
                        <p>Оператор обрабатывает следующие персональные данные:</p>
                        <ul>
                            <li>Фамилия, имя, отчество;</li>
                            <li>Адрес электронной почты;</li>
                            <li>Номер телефона;</li>
                            <li>Паспортные данные (серия, номер, кем выдан);</li>
                            <li>ИНН;</li>
                            <li>СНИЛС;</li>
                            <li>Технические данные (IP-адрес, cookies, данные о браузере).</li>
                        </ul>

                        <h2>3. Цели обработки</h2>
                        <p>Персональные данные обрабатываются в следующих целях:</p>
                        <ul>
                            <li>Идентификация пользователя на Платформе;</li>
                            <li>Предоставление доступа к функциональности;</li>
                            <li>Формирование и управление инвестиционными портфелями;</li>
                            <li>Направление уведомлений и информационных сообщений;</li>
                            <li>Улучшение качества сервиса.</li>
                        </ul>

                        <h2>4. Правовые основания</h2>
                        <p>
                            Обработка персональных данных осуществляется на основании согласия
                            субъекта персональных данных, предоставляемого при регистрации.
                        </p>

                        <h2>5. Хранение и защита данных</h2>
                        <p>
                            Оператор принимает необходимые организационные и технические меры для
                            защиты персональных данных от неправомерного доступа, уничтожения,
                            изменения, блокирования и распространения. Данные хранятся на
                            защищённых серверах с использованием шифрования.
                        </p>

                        <h2>6. Передача третьим лицам</h2>
                        <p>
                            Оператор не передаёт персональные данные третьим лицам, за исключением
                            случаев, предусмотренных законодательством РФ.
                        </p>

                        <h2>7. Права субъекта персональных данных</h2>
                        <p>Вы имеете право:</p>
                        <ul>
                            <li>Получить информацию об обработке ваших данных;</li>
                            <li>Требовать уточнения, блокирования или уничтожения данных;</li>
                            <li>Отозвать согласие на обработку персональных данных;</li>
                            <li>Обжаловать действия Оператора в Роскомнадзоре или суде.</li>
                        </ul>

                        <h2>8. Контакты</h2>
                        <p>
                            По вопросам обработки персональных данных обращайтесь:
                            <br />
                            📧 <a href="mailto:privacy@bondbank.com">privacy@bondbank.com</a>
                        </p>

                        <p className={styles.documentDate}>
                            Последнее обновление: 15 сентября 2026 г.
                        </p>
                    </div>

                    <div className={styles.documentActions}>
                        <button
                            className={styles.documentBackButton}
                            onClick={() => setMode("register")}
                        >
                            ← Вернуться к регистрации
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ==================== ФОРМА ВХОДА / РЕГИСТРАЦИИ ====================
    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <h1 className={styles.authTitle}>
                    {mode === "login" ? "🔐 Вход" : "📝 Регистрация"}
                </h1>

                {error && <div className={styles.errorMessage}>{error}</div>}

                {mode === "login" ? (
                    <form onSubmit={handleLogin} className={styles.authForm}>
                        <div className={styles.formGroup}>
                            <label>Логин</label>
                            <input
                                type="text"
                                value={formData.login}
                                onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                                placeholder="user1"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Пароль</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            Войти
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className={styles.authForm}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Фамилия *</label>
                                <input
                                    type="text"
                                    value={formData.secondName}
                                    onChange={(e) => setFormData({ ...formData, secondName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Имя *</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Отчество</label>
                            <input
                                type="text"
                                value={formData.surName}
                                onChange={(e) => setFormData({ ...formData, surName: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Телефон *</label>
                            <input
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                placeholder="89123456789"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Логин *</label>
                            <input
                                type="text"
                                value={formData.login}
                                onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Пароль *</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Подтверждение *</label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* ==================== ЧЕК-ЛИСТЫ СОГЛАСИЯ ==================== */}
                        <div className={styles.agreements}>
                            {/* Условия использования */}
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className={styles.checkbox}
                                />
                                <span className={styles.checkboxText}>
                                    Я согласен с{" "}
                                    <button
                                        type="button"
                                        className={styles.linkButton}
                                        onClick={() => setMode("terms")}
                                    >
                                        условиями использования
                                    </button>
                                </span>
                            </label>

                            {/* Политика персональных данных */}
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={agreePrivacy}
                                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                                    className={styles.checkbox}
                                />
                                <span className={styles.checkboxText}>
                                    Я согласен на{" "}
                                    <button
                                        type="button"
                                        className={styles.linkButton}
                                        onClick={() => setMode("privacy")}
                                    >
                                        обработку персональных данных
                                    </button>
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={!agreeTerms || !agreePrivacy}
                        >
                            Зарегистрироваться
                        </button>
                    </form>
                )}

                <p className={styles.switchMode}>
                    {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
                    <span onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
                        {mode === "login" ? "Зарегистрироваться" : "Войти"}
                    </span>
                </p>

                <div className={styles.hint}>
                    <p><strong>Тестовые аккаунты:</strong></p>
                    <p>👤 user1 / user1</p>
                    <p>👤 user2 / user2</p>
                    <p>👑 admin / admin</p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;