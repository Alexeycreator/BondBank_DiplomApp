import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiRequestError } from "../../shared/api/client";
import { getAllNews } from "../../entities/news/api/newsApi";
import { News } from "../../entities/news/model/types";
import NewsCard from "./ui/NewsCard";
import styles from "./NewsPage.module.css";

const NewsPage = () => {
  const [news, setNews] = useState<News[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setNews(await getAllNews());
    } catch (requestError: unknown) {
      if (requestError instanceof ApiRequestError && requestError.statusCode === 404) {
        setNews([]);
        return;
      }
      setError(
        requestError instanceof ApiRequestError
          ? requestError.serverMessage || requestError.message
          : requestError instanceof Error
            ? requestError.message
            : "Не удалось загрузить новости",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNews();
  }, [loadNews]);

  const categories = useMemo(
    () => ["Все", ...new Set(news.map((item) => item.category).filter(Boolean))],
    [news],
  );
  const visibleNews = useMemo(
    () => selectedCategory === "Все"
      ? news
      : news.filter((item) => item.category === selectedCategory),
    [news, selectedCategory],
  );

  return (
    <section className={styles.newsPage}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>BondBank · Обзор рынка</span>
          <h1 className={styles.pageTitle}>Новости рынка</h1>
          <p className={styles.pageDescription}>
            Актуальные публикации об облигациях, биржах и финансовых рынках.
          </p>
        </div>
        <span className={styles.newsCount} aria-live="polite">
          {isLoading ? "Загрузка…" : `${visibleNews.length} публикаций`}
        </span>
      </header>

      {news.length > 0 && (
        <nav className={styles.categories} aria-label="Фильтр новостей по категории">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`${styles.categoryBtn} ${selectedCategory === category ? styles.activeCategory : ""}`}
              aria-pressed={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </nav>
      )}

      {error && (
        <div className={styles.stateCard} role="alert">
          <p>{error}</p>
          <button type="button" className={styles.retryButton} onClick={() => void loadNews()}>
            Повторить загрузку
          </button>
        </div>
      )}

      {isLoading && <div className={styles.stateCard} role="status">Загружаем публикации…</div>}

      {!isLoading && !error && visibleNews.length > 0 && (
        <div className={styles.newsGrid}>
          {visibleNews.map((item) => <NewsCard key={item.id} news={item} />)}
        </div>
      )}

      {!isLoading && !error && visibleNews.length === 0 && (
        <div className={styles.stateCard} role="status">
          {news.length === 0 ? "Публикаций пока нет." : "В этой категории пока нет публикаций."}
        </div>
      )}
    </section>
  );
};

export default NewsPage;
