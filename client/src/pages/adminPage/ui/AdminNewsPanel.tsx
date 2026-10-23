import { News } from "../../../entities/news/model/types";
import styles from "../AdminPage.module.css";

interface AdminNewsPanelProps {
    news: News[];
    editingNews: News | null;
    isEditorOpen: boolean;
    formatDate: (date: string) => string;
    onCreate: () => void;
    onEdit: (news: News) => void;
    onRequestDelete: (id: number) => void;
    onEditingNewsChange: (news: News) => void;
    onCloseEditor: () => void;
    onSave: () => void;
}

export function AdminNewsPanel({
    news,
    editingNews,
    isEditorOpen,
    formatDate,
    onCreate,
    onEdit,
    onRequestDelete,
    onEditingNewsChange,
    onCloseEditor,
    onSave,
}: AdminNewsPanelProps) {
    return (
        <>
            <section className={styles.section}>
                <div className={styles.controls}>
                    <button className={styles.createButton} onClick={onCreate}>
                        + Создать новость
                    </button>
                </div>
                <div className={styles.newsGrid}>
                    {news.length > 0 ? (
                        news.map((item) => (
                            <div key={item.id} className={styles.newsCard}>
                                <div className={styles.newsHeader}>
                                    <span className={styles.newsCategory}>{item.category}</span>
                                    <span className={styles.newsDate}>{formatDate(item.date)}</span>
                                </div>
                                <h3 className={styles.newsTitle}>{item.title}</h3>
                                <p className={styles.newsContent}>{item.content}</p>
                                <div className={styles.newsFooter}>
                                    <span className={styles.newsAuthor}>✍️ {item.author}</span>
                                    <div className={styles.actionButtons}>
                                        <button
                                            className={styles.iconButton}
                                            onClick={() => onEdit(item)}
                                            title="Редактировать"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className={styles.iconButtonDanger}
                                            onClick={() => onRequestDelete(item.id)}
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

            {isEditorOpen && editingNews && (
                <div className={styles.modalOverlay} onClick={onCloseEditor}>
                    <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
                        <h2 className={styles.modalTitle}>
                            {news.some((item) => item.id === editingNews.id)
                                ? "Редактирование новости"
                                : "Новая новость"}
                        </h2>
                        <div className={styles.formGroup}>
                            <label>Заголовок *</label>
                            <input
                                value={editingNews.title}
                                onChange={(event) =>
                                    onEditingNewsChange({ ...editingNews, title: event.target.value })
                                }
                                placeholder="Введите заголовок"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Категория</label>
                            <select
                                value={editingNews.category}
                                onChange={(event) =>
                                    onEditingNewsChange({ ...editingNews, category: event.target.value })
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
                                onChange={(event) =>
                                    onEditingNewsChange({ ...editingNews, content: event.target.value })
                                }
                                rows={6}
                                placeholder="Введите текст новости"
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelButton} onClick={onCloseEditor}>
                                Отмена
                            </button>
                            <button className={styles.saveButton} onClick={onSave}>
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
