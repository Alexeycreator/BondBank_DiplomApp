import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { User, News } from "../../types/index";
import styles from "./AdminPage.module.css";
import {
  Alert,
  Toast,
  ToastContainer,
  Modal,
  Button,
  Form,
} from "react-bootstrap";
import { DataTable, TableColumn } from "../../table/DataTable";
import { StatusBadge } from "../../infoCards/StatusBadge";
import ImportBonds from "../../importExport/ImportBonds";

interface FileData {
  id: number;
  name: string;
  type: string;
  size: string;
  date: string;
}

const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"users" | "files" | "news">(
    "users",
  );

  // --- Состояния для пользователей ---
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showSlowWarning, setShowSlowWarning] = useState(false);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pendingChanges, setPendingChanges] = useState<Set<string | number>>(
    new Set(),
  );
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState<string>("");
  const [inactiveDays, setInactiveDays] = useState<number>(30);

  // --- Состояния для файлов ---
  const [files, setFiles] = useState<FileData[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [showFilesSlowWarning, setShowFilesSlowWarning] = useState(false);
  const [showFilesEmptyWarning, setShowFilesEmptyWarning] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const fileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Состояния для модальных окон ---
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | number | null>(
    null,
  );
  const [newsToDelete, setNewsToDelete] = useState<number | null>(null);

  // --- Состояния для новостей ---
  const [news, setNews] = useState<News[]>([]);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [showNewsEditor, setShowNewsEditor] = useState(false);

  // Симуляция загрузки пользователей
  useEffect(() => {
    setLoadingUsers(true);
    setShowSlowWarning(false);
    setShowEmptyWarning(false);
    timerRef.current = setTimeout(() => setShowSlowWarning(true), 5000);

    const fetchTimer = setTimeout(() => {
      const loadedUsers: User[] = [];
      setUsers(loadedUsers);
      if (loadedUsers.length === 0) setShowEmptyWarning(true);
      setLoadingUsers(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearTimeout(fetchTimer);
    };
  }, [currentUser?.id]);

  // Симуляция загрузки файлов
  useEffect(() => {
    if (activeTab !== "files") return;

    setLoadingFiles(true);
    setShowFilesSlowWarning(false);
    setShowFilesEmptyWarning(false);
    fileTimerRef.current = setTimeout(
      () => setShowFilesSlowWarning(true),
      5000,
    );

    const fetchTimer = setTimeout(() => {
      // TODO: Заменить на реальный запрос к API
      const loadedFiles: FileData[] = []; // Пока пусто
      setFiles(loadedFiles);
      if (loadedFiles.length === 0) setShowFilesEmptyWarning(true);
      setLoadingFiles(false);
      if (fileTimerRef.current) clearTimeout(fileTimerRef.current);
    }, 1000);

    return () => {
      if (fileTimerRef.current) clearTimeout(fileTimerRef.current);
      clearTimeout(fetchTimer);
    };
  }, [activeTab]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        (u.login?.toLowerCase() || "").includes(query) ||
        (u.email?.toLowerCase() || "").includes(query) ||
        u.phoneNumber?.includes(query) ||
        (u.secondName?.toLowerCase() || "").includes(query) ||
        (u.firstName?.toLowerCase() || "").includes(query),
    );
  }, [users, userSearch]);

  const isInactive = (lastSeen: string, days: number): boolean => {
    if (!lastSeen) return false;
    const last = new Date(lastSeen);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays > days;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("ru-RU");
  };

  // --- Обработчики пользователей ---
  const handleToggleBlock = (userId: number | string) => {
    setUsers(
      users.map((u) => {
        if (u.id === userId) {
          const willBlock = !u.isBlocked;
          return {
            ...u,
            isBlocked: willBlock,
            blockedBy: willBlock ? currentUser?.email : undefined,
            blockedAt: willBlock
              ? new Date().toISOString().split("T")[0]
              : undefined,
          };
        }
        return u;
      }),
    );
    setPendingChanges((prev) => new Set(prev).add(userId));
    setHasChanges(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete !== null) {
      setUsers(users.filter((u) => u.id !== userToDelete));
      setHasChanges(true);
      showToast("Успешно", "Пользователь удален", "success");
      setUserToDelete(null);
    }
  };

  const handleSaveChanges = () => {
    setPendingChanges(new Set());
    setHasChanges(false);
    showToast("Успешно", "Все изменения сохранены", "success");
  };

  const confirmCancelChanges = () => {
    setPendingChanges(new Set());
    setHasChanges(false);
    setShowCancelModal(false);
    showToast("Информация", "Изменения отменены", "info");
  };

  const handleDeleteInactive = () => {
    const inactive = users.filter((u) => isInactive(u.lastSeen, inactiveDays));
    if (inactive.length === 0) {
      showToast("Информация", "Неактивных пользователей нет", "info");
      return;
    }
    if (
      window.confirm(`Удалить ${inactive.length} неактивных пользователей?`)
    ) {
      const inactiveIds = inactive.map((u) => u.id);
      setUsers(users.filter((u) => !inactiveIds.includes(u.id)));
      setHasChanges(true);
      showToast(
        "Успешно",
        `Удалено ${inactive.length} пользователей`,
        "success",
      );
    }
  };

  // --- Обработчики файлов ---
  const handleSelectFile = (id: number) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((f) => f.id)));
    }
  };

  const handleDownloadSelected = () => {
    if (selectedFiles.size === 0) {
      showToast("Внимание", "Выберите файлы для скачивания", "warning");
      return;
    }
    // Симуляция скачивания
    showToast(
      "Успешно",
      `Скачивание ${selectedFiles.size} файлов началось`,
      "success",
    );
    setSelectedFiles(new Set()); // Сбрасываем выбор
  };

  const handleImport = async () => {
    showToast("Успешно", "Файл импортирован", "success");
  };

  // --- Колонки таблиц ---
  const userColumns: TableColumn<User>[] = [
    { key: "id", title: "ID", render: (u) => u.id },
    {
      key: "fio",
      title: "ФИО",
      render: (u) => (
        <div className={styles.fioCell}>
          <span>
            {u.secondName} {u.firstName} {u.surName}
          </span>
          {pendingChanges.has(u.id) && (
            <StatusBadge variantType="status" value="modified" />
          )}
        </div>
      ),
    },
    {
      key: "login",
      title: "Логин",
      render: (u) => <span className={styles.mono}>{u.login}</span>,
    },
    { key: "email", title: "Email", render: (u) => u.email },
    {
      key: "phone",
      title: "Телефон",
      render: (u) => <span className={styles.mono}>{u.phoneNumber}</span>,
    },
    {
      key: "role",
      title: "Роль",
      render: (u) => <StatusBadge variantType="role" value={u.role} />,
    },
    {
      key: "lastSeen",
      title: "Последний вход",
      render: (u) => {
        const inactive = isInactive(u.lastSeen, inactiveDays);
        return (
          <div className={styles.fioCell}>
            <span className={inactive ? styles.inactiveDateText : ""}>
              {formatDate(u.lastSeen)}
            </span>
            {inactive && <StatusBadge variantType="status" value="inactive" />}
          </div>
        );
      },
    },
    {
      key: "status",
      title: "Статус",
      render: (u) => (
        <div className={styles.statusCell}>
          <StatusBadge
            variantType="status"
            value={u.isBlocked ? "blocked" : "active"}
          />
          {u.blockedBy && (
            <span className={styles.blockedByText}>({u.blockedBy})</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Действия",
      render: (u) => (
        <div className={styles.actionButtons}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleBlock(u.id);
            }}
            className={styles.iconButton}
            title={u.isBlocked ? "Разблокировать" : "Заблокировать"}
          >
            {u.isBlocked ? "🔓" : "🔒"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setUserToDelete(u.id);
            }}
            className={styles.iconButtonDanger}
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  const fileColumns: TableColumn<FileData>[] = [
    {
      key: "checkbox",
      title: (
        <Form.Check
          type="checkbox"
          checked={files.length > 0 && selectedFiles.size === files.length}
          onChange={handleSelectAll}
        />
      ),
      render: (f) => (
        <Form.Check
          type="checkbox"
          checked={selectedFiles.has(f.id)}
          onChange={() => handleSelectFile(f.id)}
        />
      ),
    },
    { key: "name", title: "Название файла", render: (f) => f.name },
    { key: "type", title: "Тип", render: (f) => f.type },
    { key: "size", title: "Размер", render: (f) => f.size },
    { key: "date", title: "Дата", render: (f) => formatDate(f.date) },
    {
      key: "actions",
      title: "Действие",
      render: (f) => (
        <button
          onClick={() =>
            showToast("Успешно", `Скачивание файла ${f.name}`, "success")
          }
          className={styles.iconButton}
          title="Скачать"
        >
          ⬇️
        </button>
      ),
    },
  ];

  // --- Методы для новостей ---
  const handleCreateNews = () => {
    setEditingNews({
      id: news.length + 1,
      title: "",
      content: "",
      author: currentUser?.login || "admin",
      date: new Date().toISOString().split("T")[0],
      category: "Биржи",
    });
    setShowNewsEditor(true);
  };

  const handleEditNews = (item: News) => {
    setEditingNews({ ...item });
    setShowNewsEditor(true);
  };

  const handleSaveNews = () => {
    if (!editingNews) return;
    if (!editingNews.title.trim() || !editingNews.content.trim()) {
      showToast("Ошибка", "Заполните заголовок и содержание", "warning");
      return;
    }
    const exists = news.find((n) => n.id === editingNews.id);
    if (exists)
      setNews(news.map((n) => (n.id === editingNews.id ? editingNews : n)));
    else setNews([editingNews, ...news]);
    setShowNewsEditor(false);
    setEditingNews(null);
    showToast("Успешно", "Новость сохранена", "success");
  };

  const confirmDeleteNews = () => {
    if (newsToDelete !== null) {
      setNews(news.filter((n) => n.id !== newsToDelete));
      showToast("Успешно", "Новость удалена", "success");
      setNewsToDelete(null);
    }
  };

  return (
    <div className={styles.adminPage}>
      {/* Уведомления для пользователей */}
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ position: "fixed", zIndex: 9999 }}
      >
        <Toast
          show={showSlowWarning}
          onClose={() => setShowSlowWarning(false)}
          bg="warning"
          delay={15000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">⏳ Загрузка пользователей...</strong>
          </Toast.Header>
          <Toast.Body className="text-dark">
            Данных слишком много. Пожалуйста, подождите.
          </Toast.Body>
        </Toast>
        <Toast
          show={showEmptyWarning}
          onClose={() => setShowEmptyWarning(false)}
          bg="primary"
          delay={15000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">📭 Пользователей не найдено</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            В системе пока нет зарегистрированных пользователей (кроме вас).
          </Toast.Body>
        </Toast>

        {/* Уведомления для файлов */}
        <Toast
          show={showFilesSlowWarning}
          onClose={() => setShowFilesSlowWarning(false)}
          bg="warning"
          delay={15000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">⏳ Загрузка файлов...</strong>
          </Toast.Header>
          <Toast.Body className="text-dark">
            Файлов слишком много. Пожалуйста, подождите.
          </Toast.Body>
        </Toast>
        <Toast
          show={showFilesEmptyWarning}
          onClose={() => setShowFilesEmptyWarning(false)}
          bg="primary"
          delay={15000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">📁 Файлов не найдено</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            В системе нет загруженных файлов. Импортируйте первый файл!
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <h1 className={styles.pageTitle}>Панель администратора</h1>
      <p className={styles.pageDescription}>
        Управление пользователями, файлами и новостями системы
      </p>

      {hasChanges && (
        <Alert variant="warning" className={styles.saveAlert}>
          <span>⚠️ Есть несохранённые изменения</span>
          <div className={styles.saveAlertActions}>
            <button
              className={styles.cancelButton}
              onClick={() => setShowCancelModal(true)}
            >
              Отменить
            </button>
            <button className={styles.saveButton} onClick={handleSaveChanges}>
              💾 Сохранить
            </button>
          </div>
        </Alert>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "users" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Пользователи
        </button>
        <button
          className={`${styles.tab} ${activeTab === "files" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("files")}
        >
          📁 Файлы
        </button>
        <button
          className={`${styles.tab} ${activeTab === "news" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("news")}
        >
          📰 Новости
        </button>
      </div>

      {activeTab === "users" && (
        <section className={styles.section}>
          <div className={styles.controls}>
            <input
              type="text"
              placeholder="🔍 Поиск по ФИО, логину, email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.inactiveControl}>
              <label>Неактивны более:</label>
              <input
                type="number"
                min="1"
                value={inactiveDays}
                onChange={(e) => setInactiveDays(Number(e.target.value))}
                className={styles.daysInput}
              />
              <span>дней</span>
              <button
                className={styles.dangerButton}
                onClick={handleDeleteInactive}
              >
                🗑️ Удалить неактивных
              </button>
            </div>
          </div>

          <DataTable
            data={filteredUsers}
            columns={userColumns}
            keyExtractor={(u) => u.id}
            emptyMessage="Пользователи не найдены"
            isLoading={loadingUsers}
          />

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{users.length}</span>
              <span className={styles.statLabel}>Всего (без вас)</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {users.filter((u) => u.role === "admin").length}
              </span>
              <span className={styles.statLabel}>Админов</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {
                  users.filter((u) => isInactive(u.lastSeen, inactiveDays))
                    .length
                }
              </span>
              <span className={styles.statLabel}>Неактивных</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {users.filter((u) => u.isBlocked).length}
              </span>
              <span className={styles.statLabel}>Заблокировано</span>
            </div>
          </div>
        </section>
      )}

      {activeTab === "files" && (
        <section className={styles.section}>
          <div
            className={styles.controls}
            style={{ justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <ImportBonds onImport={handleImport} />
              <button
                className={styles.actionButton}
                onClick={handleDownloadSelected}
                disabled={selectedFiles.size === 0}
                style={{
                  background: selectedFiles.size === 0 ? "#2d3b5e" : "#2ecc71",
                  color: selectedFiles.size === 0 ? "#a0aabf" : "#fff",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: selectedFiles.size === 0 ? "not-allowed" : "pointer",
                }}
              >
                ⬇️ Скачать выбранные ({selectedFiles.size})
              </button>
            </div>
          </div>

          <DataTable
            data={files}
            columns={fileColumns}
            keyExtractor={(f) => f.id}
            emptyMessage="Файлы не найдены"
            isLoading={loadingFiles}
          />
        </section>
      )}

      {activeTab === "news" && (
        <section className={styles.section}>
          <div className={styles.controls}>
            <button className={styles.createButton} onClick={handleCreateNews}>
              + Создать новость
            </button>
          </div>
          <div className={styles.newsGrid}>
            {news.length > 0 ? (
              news.map((item) => (
                <div key={item.id} className={styles.newsCard}>
                  <div className={styles.newsHeader}>
                    <span className={styles.newsCategory}>{item.category}</span>
                    <span className={styles.newsDate}>
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <h3 className={styles.newsTitle}>{item.title}</h3>
                  <p className={styles.newsContent}>{item.content}</p>
                  <div className={styles.newsFooter}>
                    <span className={styles.newsAuthor}>✍️ {item.author}</span>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.iconButton}
                        onClick={() => handleEditNews(item)}
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button
                        className={styles.iconButtonDanger}
                        onClick={() => setNewsToDelete(item.id)}
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noData}>Новостей нет</div>
            )}
          </div>
        </section>
      )}

      {/* РЕДАКТОР НОВОСТИ */}
      {showNewsEditor && editingNews && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowNewsEditor(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {news.find((n) => n.id === editingNews.id)
                ? "Редактирование новости"
                : "Новая новость"}
            </h2>
            <div className={styles.formGroup}>
              <label>Заголовок *</label>
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
              <label>Содержание *</label>
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
                onClick={() => setShowNewsEditor(false)}
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

      {/* МОДАЛЬНЫЕ ОКНА */}
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
        contentClassName="bg-dark text-white border-secondary"
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          className="border-secondary"
        >
          <Modal.Title>Отмена изменений</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Вы уверены, что хотите отменить все несохранённые изменения?
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button
            variant="outline-secondary"
            onClick={() => setShowCancelModal(false)}
          >
            Нет, продолжить
          </Button>
          <Button variant="danger" onClick={confirmCancelChanges}>
            Да, отменить
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={userToDelete !== null}
        onHide={() => setUserToDelete(null)}
        centered
        contentClassName="bg-dark text-white border-secondary"
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          className="border-secondary"
        >
          <Modal.Title>Удаление пользователя</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Вы уверены, что хотите удалить этого пользователя? Это действие
          необратимо.
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button
            variant="outline-secondary"
            onClick={() => setUserToDelete(null)}
          >
            Отмена
          </Button>
          <Button variant="danger" onClick={confirmDeleteUser}>
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={newsToDelete !== null}
        onHide={() => setNewsToDelete(null)}
        centered
        contentClassName="bg-dark text-white border-secondary"
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          className="border-secondary"
        >
          <Modal.Title>Удаление новости</Modal.Title>
        </Modal.Header>
        <Modal.Body>Вы уверены, что хотите удалить эту новость?</Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button
            variant="outline-secondary"
            onClick={() => setNewsToDelete(null)}
          >
            Отмена
          </Button>
          <Button variant="danger" onClick={confirmDeleteNews}>
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPage;
