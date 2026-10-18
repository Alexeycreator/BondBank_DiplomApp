import React, { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { MOCK_USERS } from "../../data/mockData";
import { User, News } from "../../types/index";
import styles from "./AdminPage.module.css";
import { useToast } from "../../context/ToastContext";
import { Alert } from "react-bootstrap";

const AdminPage = () => {
    const { user: currentUser } = useAuth();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<"users" | "news">("users");
    const [users, setUsers] = useState<User[]>([...MOCK_USERS]);
    const [pendingChanges, setPendingChanges] = useState<Set<number>>(new Set());
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [userSearch, setUserSearch] = useState<string>("");
    const [inactiveDays, setInactiveDays] = useState<number>(30);

    const [news, setNews] = useState<News[]>([
        { id: 1, title: "Московская биржа запустила новый тип облигаций", content: "Московская биржа объявила о запуске нового типа облигаций с плавающей ставкой...", author: "admin", date: "2026-09-10", category: "Биржи" },
    ]);
    const [editingNews, setEditingNews] = useState<News | null>(null);
    const [showNewsEditor, setShowNewsEditor] = useState(false);

    const filteredUsers = useMemo(() => {
        const query = userSearch.toLowerCase();
        return users.filter((u) =>
            u.login.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            u.phoneNumber.includes(query) ||
            u.secondName.toLowerCase().includes(query) ||
            u.firstName.toLowerCase().includes(query)
        );
    }, [users, userSearch]);

    const isInactive = (lastSeen: string, days: number): boolean => {
        const last = new Date(lastSeen);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > days;
    };

    const formatDate = (dateStr: string): string => new Date(dateStr).toLocaleDateString("ru-RU");

    const handleToggleBlock = (userId: number) => {
        if (userId === currentUser?.id) {
            showToast("Ошибка", "Нельзя заблокировать свой аккаунт", "danger");
            return;
        }

        setUsers(users.map((u) => {
            if (u.id === userId) {
                const willBlock = !u.isBlocked;
                return { ...u, isBlocked: willBlock, blockedBy: willBlock ? currentUser?.email : undefined, blockedAt: willBlock ? new Date().toISOString().split("T")[0] : undefined };
            }
            return u;
        }));

        setPendingChanges(prev => new Set(prev).add(userId));
        setHasChanges(true);
    };

    const handleDeleteUser = (userId: number) => {
        if (userId === currentUser?.id) {
            showToast("Ошибка", "Нельзя удалить свой аккаунт", "danger");
            return;
        }
        if (window.confirm("Удалить пользователя? Это действие необратимо.")) {
            setUsers(users.filter((u) => u.id !== userId));
            setHasChanges(true);
            showToast("Успешно", "Пользователь удален", "success");
        }
    };

    const handleSaveChanges = () => {
        MOCK_USERS.length = 0;
        MOCK_USERS.push(...users);
        setPendingChanges(new Set());
        setHasChanges(false);
        showToast("Успешно", "Все изменения сохранены", "success");
    };

    const handleCancelChanges = () => {
        if (window.confirm("Отменить все несохранённые изменения?")) {
            setUsers([...MOCK_USERS]);
            setPendingChanges(new Set());
            setHasChanges(false);
            showToast("Информация", "Изменения отменены", "info");
        }
    };

    const handleDeleteInactive = () => {
        const inactive = users.filter((u) => u.id !== currentUser?.id && isInactive(u.lastSeen, inactiveDays));
        if (inactive.length === 0) {
            showToast("Информация", "Неактивных пользователей нет", "info");
            return;
        }
        if (window.confirm(`Удалить ${inactive.length} неактивных пользователей?`)) {
            const inactiveIds = inactive.map((u) => u.id);
            setUsers(users.filter((u) => !inactiveIds.includes(u.id)));
            setHasChanges(true);
            showToast("Успешно", `Удалено ${inactive.length} пользователей`, "success");
        }
    };

    const handleCreateNews = () => {
        setEditingNews({ id: news.length + 1, title: "", content: "", author: currentUser?.login || "admin", date: new Date().toISOString().split("T")[0], category: "Биржи" });
        setShowNewsEditor(true);
    };

    const handleEditNews = (item: News) => { setEditingNews({ ...item }); setShowNewsEditor(true); };

    const handleSaveNews = () => {
        if (!editingNews) return;
        if (!editingNews.title.trim() || !editingNews.content.trim()) {
            showToast("Ошибка", "Заполните заголовок и содержание", "warning");
            return;
        }
        const exists = news.find((n) => n.id === editingNews.id);
        if (exists) setNews(news.map((n) => (n.id === editingNews.id ? editingNews : n)));
        else setNews([editingNews, ...news]);
        setShowNewsEditor(false);
        setEditingNews(null);
        showToast("Успешно", "Новость сохранена", "success");
    };

    const handleDeleteNews = (id: number) => {
        if (window.confirm("Удалить новость?")) {
            setNews(news.filter((n) => n.id !== id));
            showToast("Успешно", "Новость удалена", "success");
        }
    };

    return (
        <div className={styles.adminPage}>
            <h1 className={styles.pageTitle}>👑 Панель администратора</h1>
            <p className={styles.pageDescription}>Управление пользователями и новостями системы</p>

            {/* ✅ Блок несохраненных изменений */}
            {hasChanges && (
                <Alert variant="warning" className="d-flex justify-content-between align-items-center mb-4">
                    <span>⚠️ Есть несохранённые изменения</span>
                    <div className="d-flex gap-2">
                        <button className={styles.cancelButton} onClick={handleCancelChanges}>Отменить</button>
                        <button className={styles.saveButton} onClick={handleSaveChanges}>💾 Сохранить</button>
                    </div>
                </Alert>
            )}

            {/* Табы */}
            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === "users" ? styles.activeTab : ""}`} onClick={() => setActiveTab("users")}>👥 Пользователи ({users.length})</button>
                <button className={`${styles.tab} ${activeTab === "news" ? styles.activeTab : ""}`} onClick={() => setActiveTab("news")}>📰 Новости ({news.length})</button>
            </div>

            {/* ПОЛЬЗОВАТЕЛИ */}
            {activeTab === "users" && (
                <section className={styles.section}>
                    <div className={styles.controls}>
                        <input type="text" placeholder="🔍 Поиск по ФИО, логину, email, телефону..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className={styles.searchInput} />
                        <div className={styles.inactiveControl}>
                            <label>Неактивны более:</label>
                            <input type="number" min="1" value={inactiveDays} onChange={(e) => setInactiveDays(Number(e.target.value))} className={styles.daysInput} />
                            <span>дней</span>
                            <button className={styles.dangerButton} onClick={handleDeleteInactive}>🗑️ Удалить неактивных</button>
                        </div>
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th><th>ФИО</th><th>Логин</th><th>Email</th><th>Телефон</th><th>Роль</th><th>Последний вход</th><th>Статус</th><th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((u) => {
                                        const inactive = isInactive(u.lastSeen, inactiveDays);
                                        const isMe = u.id === currentUser?.id;
                                        const isPending = pendingChanges.has(u.id);
                                        return (
                                            <tr key={u.id} className={`${inactive ? styles.inactiveRow : ""} ${isPending ? styles.pendingRow : ""}`}>
                                                <td>{u.id}</td>
                                                <td>{u.secondName} {u.firstName} {u.surName} {isMe && <span className={styles.meBadge}>Вы</span>} {isPending && <span className={styles.pendingBadge}>изменено</span>}</td>
                                                <td className={styles.mono}>{u.login}</td>
                                                <td>{u.email}</td>
                                                <td className={styles.mono}>{u.phoneNumber}</td>
                                                <td><span className={`${styles.roleBadge} ${u.role === "admin" ? styles.adminBadge : ""}`}>{u.role === "admin" ? "👑 Админ" : "👤 Пользователь"}</span></td>
                                                <td><span className={inactive ? styles.inactiveDate : ""}>{formatDate(u.lastSeen)}</span>{inactive && <span className={styles.inactiveMark}>⚠️</span>}</td>
                                                <td>{u.isBlocked ? <span className={styles.blockedBadge}>🚫 Заблокирован {u.blockedBy && <span className={styles.blockedBy}>({u.blockedBy})</span>}</span> : <span className={styles.activeBadge}>✅ Активен</span>}</td>
                                                <td>
                                                    <div className={styles.actions}>
                                                        <button className={styles.blockButton} onClick={() => handleToggleBlock(u.id)} disabled={isMe} title={u.isBlocked ? "Разблокировать" : "Заблокировать"}>{u.isBlocked ? "🔓" : "🔒"}</button>
                                                        <button className={styles.deleteButton} onClick={() => handleDeleteUser(u.id)} disabled={isMe} title="Удалить">🗑️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan={9} className={styles.noData}>Пользователи не найдены</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.stats}>
                        <div className={styles.statItem}><span className={styles.statValue}>{users.length}</span><span className={styles.statLabel}>Всего</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>{users.filter((u) => u.role === "admin").length}</span><span className={styles.statLabel}>Админов</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>{users.filter((u) => isInactive(u.lastSeen, inactiveDays)).length}</span><span className={styles.statLabel}>Неактивных</span></div>
                        <div className={styles.statItem}><span className={styles.statValue}>{users.filter((u) => u.isBlocked).length}</span><span className={styles.statLabel}>Заблокировано</span></div>
                    </div>
                </section>
            )}

            {/* НОВОСТИ */}
            {activeTab === "news" && (
                <section className={styles.section}>
                    <div className={styles.controls}>
                        <button className={styles.createButton} onClick={handleCreateNews}>+ Создать новость</button>
                    </div>
                    <div className={styles.newsGrid}>
                        {news.length > 0 ? (
                            news.map((item) => (
                                <div key={item.id} className={styles.newsCard}>
                                    <div className={styles.newsHeader}><span className={styles.newsCategory}>{item.category}</span><span className={styles.newsDate}>{formatDate(item.date)}</span></div>
                                    <h3 className={styles.newsTitle}>{item.title}</h3>
                                    <p className={styles.newsContent}>{item.content}</p>
                                    <div className={styles.newsFooter}>
                                        <span className={styles.newsAuthor}>✍️ {item.author}</span>
                                        <div className={styles.actions}>
                                            <button className={styles.editButton} onClick={() => handleEditNews(item)} title="Редактировать">✏️</button>
                                            <button className={styles.deleteButton} onClick={() => handleDeleteNews(item.id)} title="Удалить">🗑️</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (<div className={styles.noData}>Новостей нет</div>)}
                    </div>
                </section>
            )}

            {/* РЕДАКТОР НОВОСТИ */}
            {showNewsEditor && editingNews && (
                <div className={styles.modalOverlay} onClick={() => setShowNewsEditor(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>{news.find((n) => n.id === editingNews.id) ? "Редактирование новости" : "Новая новость"}</h2>
                        <div className={styles.formGroup}><label>Заголовок *</label><input value={editingNews.title} onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })} placeholder="Введите заголовок" /></div>
                        <div className={styles.formGroup}><label>Категория</label><select value={editingNews.category} onChange={(e) => setEditingNews({ ...editingNews, category: e.target.value })}><option value="Биржи">Биржи</option><option value="Облигации">Облигации</option><option value="Аналитика">Аналитика</option></select></div>
                        <div className={styles.formGroup}><label>Содержание *</label><textarea value={editingNews.content} onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })} rows={6} placeholder="Введите текст новости" /></div>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelButton} onClick={() => setShowNewsEditor(false)}>Отмена</button>
                            <button className={styles.saveButton} onClick={handleSaveNews}>Сохранить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;