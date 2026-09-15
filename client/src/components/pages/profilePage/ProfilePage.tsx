import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./ProfilePage.module.css";

/**
 * Страница профиля пользователя
 * Позволяет редактировать паспортные данные, СНИЛС, ИНН, менять пароль, удалять аккаунт
 */
const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, updateUser, deleteAccount, logout, hasCompleteProfile } = useAuth();

    const [activeTab, setActiveTab] = useState<"personal" | "passport" | "security">("personal");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Личные данные
    const [personalData, setPersonalData] = useState({
        secondName: user?.secondName || "",
        firstName: user?.firstName || "",
        surName: user?.surName || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        tin: user?.tin || "",
    });

    // Паспорт
    const [passportData, setPassportData] = useState({
        series: user?.passport?.series || "",
        number: user?.passport?.number || "",
        issuedBy: user?.passport?.issuedBy || "",
        dateOfIssue: user?.passport?.dateOfIssue || "",
        departmentCode: user?.passport?.departmentCode || "",
    });

    // СНИЛС
    const [snilsData, setSnilsData] = useState({
        number: user?.snils?.number || "",
        registrationDate: user?.snils?.registrationDate || "",
    });

    // Смена пароля
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    if (!user) {
        navigate("/auth");
        return null;
    }

    /**
     * Сохранение личных данных
     */
    const handleSavePersonal = () => {
        updateUser({ ...personalData });
        setMessage({ type: "success", text: "Личные данные сохранены" });
        setTimeout(() => setMessage(null), 3000);
    };

    /**
     * Сохранение паспортных данных
     */
    const handleSavePassport = () => {
        updateUser({ passport: passportData, snils: snilsData });
        setMessage({ type: "success", text: "Документы сохранены" });
        setTimeout(() => setMessage(null), 3000);
    };

    /**
     * Смена пароля
     */
    const handleChangePassword = () => {
        if (passwordData.currentPassword !== user.password) {
            setMessage({ type: "error", text: "Текущий пароль неверен" });
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: "error", text: "Пароли не совпадают" });
            return;
        }
        if (passwordData.newPassword.length < 4) {
            setMessage({ type: "error", text: "Пароль должен быть минимум 4 символа" });
            return;
        }

        updateUser({ password: passwordData.newPassword });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setMessage({ type: "success", text: "Пароль изменён" });
        setTimeout(() => setMessage(null), 3000);
    };

    /**
     * Удаление аккаунта
     */
    const handleDeleteAccount = () => {
        if (window.confirm("Вы уверены, что хотите удалить аккаунт? Это действие необратимо.")) {
            deleteAccount();
            navigate("/");
        }
    };

    /**
     * Выход
     */
    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className={styles.profilePage}>
            <div className={styles.profileHeader}>
                <div className={styles.avatar}>
                    {user.firstName[0]}{user.secondName[0]}
                </div>
                <div>
                    <h1 className={styles.userName}>
                        {user.secondName} {user.firstName} {user.surName}
                    </h1>
                    <span className={`${styles.roleBadge} ${user.role === "admin" ? styles.adminBadge : ""}`}>
                        {user.role === "admin" ? "👑 Администратор" : "👤 Пользователь"}
                    </span>
                </div>
                <button className={styles.logoutButton} onClick={handleLogout}>
                    Выйти
                </button>
            </div>

            {message && (
                <div className={`${styles.message} ${message.type === "error" ? styles.errorMsg : styles.successMsg}`}>
                    {message.text}
                </div>
            )}

            {/* Статус профиля */}
            <div className={`${styles.profileStatus} ${hasCompleteProfile ? styles.complete : styles.incomplete}`}>
                {hasCompleteProfile
                    ? "✅ Профиль заполнен полностью — вы можете создавать портфели"
                    : "⚠️ Заполните паспортные данные, ИНН и СНИЛС, чтобы создавать портфели"
                }
            </div>

            {/* Табы */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === "personal" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("personal")}
                >
                    📋 Личные данные
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "passport" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("passport")}
                >
                    🪪 Документы
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "security" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("security")}
                >
                    🔒 Безопасность
                </button>
            </div>

            {/* ==================== ЛИЧНЫЕ ДАННЫЕ ==================== */}
            {activeTab === "personal" && (
                <div className={styles.tabContent}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Фамилия</label>
                            <input
                                value={personalData.secondName}
                                onChange={(e) => setPersonalData({ ...personalData, secondName: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Имя</label>
                            <input
                                value={personalData.firstName}
                                onChange={(e) => setPersonalData({ ...personalData, firstName: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Отчество</label>
                            <input
                                value={personalData.surName}
                                onChange={(e) => setPersonalData({ ...personalData, surName: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                value={personalData.email}
                                onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Телефон</label>
                            <input
                                value={personalData.phoneNumber}
                                onChange={(e) => setPersonalData({ ...personalData, phoneNumber: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>ИНН</label>
                            <input
                                value={personalData.tin}
                                onChange={(e) => setPersonalData({ ...personalData, tin: e.target.value })}
                                placeholder="10 или 12 цифр"
                            />
                        </div>
                    </div>
                    <button className={styles.saveButton} onClick={handleSavePersonal}>
                        Сохранить
                    </button>
                </div>
            )}

            {/* ==================== ДОКУМЕНТЫ ==================== */}
            {activeTab === "passport" && (
                <div className={styles.tabContent}>
                    <h2 className={styles.sectionTitle}>🪪 Паспорт</h2>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Серия</label>
                            <input
                                value={passportData.series}
                                onChange={(e) => setPassportData({ ...passportData, series: e.target.value })}
                                placeholder="4510"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Номер</label>
                            <input
                                value={passportData.number}
                                onChange={(e) => setPassportData({ ...passportData, number: e.target.value })}
                                placeholder="123456"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Кем выдан</label>
                            <input
                                value={passportData.issuedBy}
                                onChange={(e) => setPassportData({ ...passportData, issuedBy: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Дата выдачи</label>
                            <input
                                type="date"
                                value={passportData.dateOfIssue}
                                onChange={(e) => setPassportData({ ...passportData, dateOfIssue: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Код подразделения</label>
                            <input
                                value={passportData.departmentCode}
                                onChange={(e) => setPassportData({ ...passportData, departmentCode: e.target.value })}
                                placeholder="770-001"
                            />
                        </div>
                    </div>

                    <h2 className={styles.sectionTitle}>🔢 СНИЛС</h2>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Номер СНИЛС</label>
                            <input
                                value={snilsData.number}
                                onChange={(e) => setSnilsData({ ...snilsData, number: e.target.value })}
                                placeholder="123-456-789 00"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Дата регистрации</label>
                            <input
                                type="date"
                                value={snilsData.registrationDate}
                                onChange={(e) => setSnilsData({ ...snilsData, registrationDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <button className={styles.saveButton} onClick={handleSavePassport}>
                        Сохранить документы
                    </button>
                </div>
            )}

            {/* ==================== БЕЗОПАСНОСТЬ ==================== */}
            {activeTab === "security" && (
                <div className={styles.tabContent}>
                    <h2 className={styles.sectionTitle}>🔒 Смена пароля</h2>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Текущий пароль</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Новый пароль</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Подтверждение</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>
                    <button className={styles.saveButton} onClick={handleChangePassword}>
                        Сменить пароль
                    </button>

                    <div className={styles.dangerZone}>
                        <h2 className={styles.dangerTitle}>⚠️ Опасная зона</h2>
                        <p className={styles.dangerText}>
                            Удаление аккаунта приведёт к потере всех данных и портфелей. Это действие необратимо.
                        </p>
                        <button className={styles.deleteButton} onClick={handleDeleteAccount}>
                            🗑️ Удалить аккаунт
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;