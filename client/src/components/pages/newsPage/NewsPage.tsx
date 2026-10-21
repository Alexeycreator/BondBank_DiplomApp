import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { MOCK_NEWS } from "../../data/mockData";
import { News } from "../../types";
import styles from "./NewsPage.module.css";
import { NewsCard } from "../../infoCards/NewsCard";

const NewsPage = () => {
  const { isAdmin } = useAuth();
  const [news, setNews] = useState<News[]>(MOCK_NEWS);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("");

  const categories = ["Все", "Биржи", "Облигации", "Аналитика"];

  const filteredNews =
    filterCategory === "" || filterCategory === "Все"
      ? news
      : news.filter((n) => n.category === filterCategory);

  const handleCreateNews = () => {
    setEditingNews({
      id: news.length > 0 ? Math.max(...news.map((n) => n.id)) + 1 : 1,
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
            <div
              key={item.id}
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                background: "rgba(255, 255, 255, 0.03)", // Легкий фон для всей карточки
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              {/* Сама карточка новости */}
              <div style={{ flexGrow: 1, padding: "4px" }}>
                <NewsCard news={item} />
              </div>

              {/* Панель управления для админа (внизу) */}
              {isAdmin && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    padding: "12px 16px",
                    background: "rgba(0, 0, 0, 0.2)",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditNews(item)}
                    style={{
                      background: "rgba(79, 195, 247, 0.15)",
                      border: "none",
                      color: "#4fc3f7",
                      cursor: "pointer",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "13px",
                      fontWeight: 500,
                      transition: "background 0.2s",
                    }}
                    title="Редактировать"
                  >
                    ✏️ Изменить
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteNews(item.id)}
                    style={{
                      background: "rgba(231, 76, 60, 0.15)",
                      border: "none",
                      color: "#e74c3c",
                      cursor: "pointer",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "13px",
                      fontWeight: 500,
                      transition: "background 0.2s",
                    }}
                    title="Удалить"
                  >
                    🗑️ Удалить
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
        <div
          className={styles.modalOverlay}
          onClick={() => setShowEditor(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {news.find((n) => n.id === editingNews.id)
                ? "Редактирование"
                : "Новая новость"}
            </h2>

            <div className={styles.formGroup}>
              <label>Заголовок</label>
              <input
                value={editingNews.title}
                onChange={(e) =>
                  setEditingNews({ ...editingNews, title: e.target.value })
                }
                placeholder="Введите заголовок"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Категория</label>
              <select
                value={editingNews.category}
                onChange={(e) =>
                  setEditingNews({ ...editingNews, category: e.target.value })
                }
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
                onChange={(e) =>
                  setEditingNews({ ...editingNews, content: e.target.value })
                }
                rows={6}
                placeholder="Введите текст новости"
              />
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowEditor(false)}
              >
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
