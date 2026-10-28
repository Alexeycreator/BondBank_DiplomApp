import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
import { useToast } from "../../shared/notifications/ToastContext";
import { deleteNews, getAllNews, saveNews } from "../../entities/news/api/newsApi";
import { ApiRequestError } from "../../shared/api/client";
import { News, NewsRequestDto } from "../../entities/news/model/types";
import { useAdminUsers } from "../../entities/user/model/useAdminUsers";
import styles from "./AdminPage.module.css";
import { AdminUsersPanel } from "./ui/AdminUsersPanel";
import { AdminNewsPanel } from "./ui/AdminNewsPanel";

type AdminTab = "users" | "files" | "news";
type NewsDraft = NewsRequestDto & { id: number | null };

const AdminPage = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [userSearch, setUserSearch] = useState("");
  const { users, isLoading, error } = useAdminUsers(isAdmin);

  const [news, setNews] = useState<News[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [editingNews, setEditingNews] = useState<NewsDraft | null>(null);
  const [showNewsEditor, setShowNewsEditor] = useState(false);

  const formatDate = (date: string): string =>
    date ? new Date(date).toLocaleDateString("ru-RU") : "—";

  const loadNews = useCallback(async () => {
    setNewsLoading(true);
    setNewsError(null);
    try {
      setNews(await getAllNews());
    } catch (requestError: unknown) {
      if (requestError instanceof ApiRequestError && requestError.statusCode === 404) {
        setNews([]);
        return;
      }
      const message = requestError instanceof ApiRequestError
        ? requestError.serverMessage || requestError.message
        : requestError instanceof Error
          ? requestError.message
          : "Не удалось загрузить новости";
      setNewsError(message);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "news") void loadNews();
  }, [activeTab, loadNews]);

  const handleCreateNews = () => {
    setEditingNews({
      id: null,
      title: "",
      body: "",
      image: null,
      date: new Date().toISOString().slice(0, 10),
      category: "Биржи",
    });
    setShowNewsEditor(true);
  };

  const handleSaveNews = async () => {
    if (!editingNews?.title.trim() || !editingNews.body.trim() || !editingNews.category.trim()) {
      showToast("Ошибка", "Заполните категорию, заголовок и текст новости", "warning");
      return;
    }
    try {
      await saveNews(editingNews.id, {
        category: editingNews.category.trim(),
        title: editingNews.title.trim(),
        image: editingNews.image?.trim() || null,
        body: editingNews.body.trim(),
        date: editingNews.date || null,
      });
      setShowNewsEditor(false);
      setEditingNews(null);
      await loadNews();
      showToast("Готово", "Новость сохранена", "success");
    } catch (requestError: unknown) {
      const message = requestError instanceof ApiRequestError
        ? requestError.serverMessage || requestError.message
        : requestError instanceof Error ? requestError.message : "Не удалось сохранить новость";
      showToast("Ошибка", message, "danger");
    }
  };

  const handleDeleteNews = async (id: number) => {
    if (!window.confirm("Удалить эту новость?")) return;
    try {
      await deleteNews(id);
      setNews((current) => current.filter((item) => item.id !== id));
      showToast("Готово", "Новость удалена", "success");
    } catch (requestError: unknown) {
      const message = requestError instanceof ApiRequestError
        ? requestError.serverMessage || requestError.message
        : requestError instanceof Error ? requestError.message : "Не удалось удалить новость";
      showToast("Ошибка", message, "danger");
    }
  };

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.pageTitle}>Панель администратора</h1>
      <p className={styles.pageDescription}>Управление пользователями и публикациями.</p>

      <div className={styles.tabs}>
        {([
          ["users", "👥 Пользователи"],
          ["files", "📁 Файлы"],
          ["news", "📰 Новости"],
        ] as const).map(([tab, title]) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {title}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <AdminUsersPanel
          users={users}
          isLoading={isLoading}
          error={error}
          search={userSearch}
          onSearchChange={setUserSearch}
        />
      )}

      {activeTab === "files" && (
        <section className={styles.section}>
          <h2>Список файлов недоступен</h2>
          <p>
            В API нет GET-метода для списка файлов. Здесь не показываются фиктивные записи;
            доступны только серверные операции импорта и экспорта конкретного файла.
          </p>
        </section>
      )}

      {activeTab === "news" && (
        <section className={styles.section}>
          {newsError && <p role="alert" className={styles.noData}>{newsError}</p>}
          {newsLoading && <p role="status">Загружаем новости…</p>}
          <AdminNewsPanel
            news={news}
            editingNews={editingNews}
            isEditorOpen={showNewsEditor}
            formatDate={formatDate}
            onCreate={handleCreateNews}
            onEdit={(item) => {
              setEditingNews({
                id: item.id,
                category: item.category,
                date: item.date,
                title: item.title,
                image: item.image,
                body: item.body,
              });
              setShowNewsEditor(true);
            }}
            onRequestDelete={handleDeleteNews}
            onEditingNewsChange={(draft) => setEditingNews(draft)}
            onCloseEditor={() => setShowNewsEditor(false)}
            onSave={() => void handleSaveNews()}
          />
        </section>
      )}
    </div>
  );
};

export default AdminPage;
