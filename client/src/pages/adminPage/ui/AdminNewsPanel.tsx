import { News } from "../../../entities/news/model/types";
import { NewsRequestDto } from "../../../entities/news/model/types";
import styles from "../AdminPage.module.css";

type NewsDraft = NewsRequestDto & { id: number | null };

interface AdminNewsPanelProps {
    news: News[];
    editingNews: NewsDraft | null;
    isEditorOpen: boolean;
    formatDate: (date: string) => string;
    onCreate: () => void;
    onEdit: (news: News) => void;
    onRequestDelete: (id: number) => void;
    onEditingNewsChange: (news: NewsDraft) => void;
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
                                <p className={styles.newsContent}>{item.body}</p>
                                <div className={styles.newsFooter}>
                                    <span className={styles.newsAuthor}>{item.body.length} символов</span>
                                    <div className={styles.actionButtons}>
                                        <button
                                            className={styles.iconButton}
                                            onClick={() => onEdit(item)}
                                            title="Редактировать"
                                            aria-label={`Редактировать новость: ${item.title}`}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className={styles.iconButtonDanger}
                                            onClick={() => onRequestDelete(item.id)}
                                            title="Удалить"
                                            aria-label={`Удалить новость: ${item.title}`}
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
                            {editingNews.id !== null
                                ? "Редактирование новости"
                                : "Новая новость"}
                        </h2>
                        <div className={styles.formGroup}>
                            <label htmlFor="news-title">Заголовок *</label>
                            <input
                                id="news-title"
                                value={editingNews.title}
                                onChange={(event) =>
                                    onEditingNewsChange({ ...editingNews, title: event.target.value })
                                }
                                placeholder="Введите заголовок"
                                maxLength={150}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="news-category">Категория *</label>
                            <input
                                id="news-category"
                                value={editingNews.category}
                                onChange={(event) =>
                                    onEditingNewsChange({ ...editingNews, category: event.target.value })
                                }
                                maxLength={50}
                                placeholder="Например, Облигации"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="news-image">Ссылка на изображение</label>
                            <input
                                id="news-image"
                                type="url"
                                value={editingNews.image ?? ""}
                                onChange={(event) =>
                                    onEditingNewsChange({
                                        ...editingNews,
                                        image: event.target.value || null,
                                    })
                                }
                                maxLength={500}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="news-date">Дата публикации</label>
                            <input
                                id="news-date"
                                type="date"
                                value={editingNews.date ?? ""}
                                onChange={(event) =>
                                    onEditingNewsChange({ ...editingNews, date: event.target.value || null })
                                }
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="news-body">Текст новости *</label>
                            <textarea
                                id="news-body"
                                value={editingNews.body}
                                onChange={(event) =>
                                    onEditingNewsChange({ ...editingNews, body: event.target.value })
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
