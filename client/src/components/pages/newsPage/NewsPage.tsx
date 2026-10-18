import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { MOCK_NEWS } from "../../data/mockData";
import { News } from "../../types";
import styles from "./NewsPage.module.css";
// ✅ Импортируем компонент карточки из правильного места
import { NewsCard } from "../../infoCards/NewsCard";

const NewsPage = () => {
    const { isAdmin } = useAuth();
    const [news, setNews] = useState<News[]>(MOCK_NEWS);
    const [editingNews, setEditingNews] = useState<News | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>("");

    const categories = ["Все", "Биржи", "Облигации", "Аналитика"];

    const filteredNews = filterCategory === "" || filterCategory === "Все"
        ? news
        : news.filter((n) => n.category === filterCategory);

    const handleCreateNews = () => {
        setEditingNews({
            id: news.length + 1,
            title: "",
            content: "",
            author: "admin",
            date: new Date().toISOString().split("T")[0],
            category: "Биржи",
        });
        setShowEditor(true);
    };

    const handleEditNews = (item: News) => {
        setEditingNews({ ...item });
        setShowEditor(true);
    };

    const handleSaveNews = () => {
        if (!editingNews) return;

        const exists = news.find((n) => n.id === editingNews.id);
        if (exists) {
            setNews(news.map((n) => (n.id === editingNews.id ? editingNews : n)));
        } else {
            setNews([editingNews, ...news]);
        }
        setShowEditor(false);
        setEditingNews(null);
    };

    const handleDeleteNews = (id: number) => {
        if (window.confirm("Удалить новость?")) {
            setNews(news.filter((n) => n.id !== id));
        }
    };

    return (
        <div className={styles.newsPage}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>📰 Новости</h1>
                    <p className={styles.pageDescription}>
                        Последние новости о биржах, облигациях и аналитике
                    </p>
                </div>
                {isAdmin && (
                    <button className={styles.createButton} onClick={handleCreateNews}>
                        + Создать новость
                    </button>
                )}
            </div>

            {/* Фильтр по категориям */}
            <div className={styles.categories}>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`${styles.categoryBtn} ${
                            (cat === "Все" && filterCategory === "") || filterCategory === cat
                                ? styles.activeCategory
                                : ""
                        }`}
                        onClick={() => setFilterCategory(cat === "Все" ? "" : cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Список новостей */}
            <div className={styles.newsGrid}>
                {filteredNews.length > 0 ? (
                    filteredNews.map((item) => (
                        <div key={item.id} style={{ position: "relative" }}>
                            <NewsCard news={item} />
                            
                            {isAdmin && (
                                <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", gap: "8px" }}>
                                    <button
                                        className={styles.editButton}
                                        onClick={() => handleEditNews(item)}
                                        style={{ background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", cursor: "pointer", borderRadius: "4px", padding: "4px" }}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={() => handleDeleteNews(item.id)}
                                        style={{ background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", cursor: "pointer", borderRadius: "4px", padding: "4px" }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className={styles.noNews}>Новостей нет</div>
                )}
            </div>

            {/* РЕДАКТОР НОВОСТИ */}
            {showEditor && editingNews && (
                <div className={styles.modalOverlay} onClick={() => setShowEditor(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>
                            {news.find((n) => n.id === editingNews.id) ? "Редактирование" : "Новая новость"}
                        </h2>

                        <div className={styles.formGroup}>
                            <label>Заголовок</label>
                            <input
                                value={editingNews.title}
                                onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                                placeholder="Введите заголовок"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Категория</label>
                            <select
                                value={editingNews.category}
                                onChange={(e) => setEditingNews({ ...editingNews, category: e.target.value })}
                            >
                                <option value="Биржи">Биржи</option>
                                <option value="Облигации">Облигации</option>
                                <option value="Аналитика">Аналитика</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Содержание</label>
                            <textarea
                                value={editingNews.content}
                                onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                                rows={6}
                                placeholder="Введите текст новости"
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.cancelButton} onClick={() => setShowEditor(false)}>
                                Отмена
                            </button>
                            <button className={styles.saveButton} onClick={handleSaveNews}>
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsPage;