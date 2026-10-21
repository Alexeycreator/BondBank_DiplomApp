import { useEffect, useState } from "react";
import { Carousel, Table } from "react-bootstrap";
import styles from "./MainPage.module.css";
import { getInfoStatisticsBlockData } from "../../data/mainPageApi";
import ErrorCard from "../../errorCard/ErrorCard";
import { InfoStatisticsBlock } from "../../data/types";
import { FeatureCard } from "../../infoCards/FeatureCard";

const MainPage = () => {
  const [infoStatisticsBlockData, setInfoStatisticsBlockData] =
    useState<InfoStatisticsBlock | null>(null);
  const [loadingInfoStatisticsBlockData, setLoadingInfoStatisticsBlockData] =
    useState(true);
  const [error, setError] = useState<{
    message: string;
    isNetwork: boolean;
  } | null>(null);

  const fetchInfoStatisticsBlockData = async () => {
    try {
      setLoadingInfoStatisticsBlockData(true);
      setError(null);
      const data = await getInfoStatisticsBlockData();
      setInfoStatisticsBlockData(data);
    } catch (err: any) {
      console.error("Ошибка загрузки статистики:", err);
      const isNetwork = Boolean(err?.isNetworkError);
      const message =
        err?.serverMessage ||
        err?.message ||
        "Не удалось загрузить статистику. Попробуйте позже.";
      setError({ message, isNetwork });
    } finally {
      setLoadingInfoStatisticsBlockData(false);
    }
  };

  useEffect(() => {
    fetchInfoStatisticsBlockData();
  }, []);

  const stats = [
    {
      label: "Всего облигаций",
      value:
        infoStatisticsBlockData?.totalBonds?.toLocaleString("ru-RU") ?? "—",
      icon: "📄",
    },
    {
      label: "Активных пользователей",
      value:
        infoStatisticsBlockData?.activeUsers?.toLocaleString("ru-RU") ?? "—",
      icon: "👥",
    },
    {
      label: "Бирж",
      value: infoStatisticsBlockData?.exchanges?.toLocaleString("ru-RU") ?? "—",
      icon: "🏛️",
    },
  ];

  const features = [
    {
      icon: "📈",
      title: "Анализ в реальном времени",
      description:
        "Отслеживайте изменения цен облигаций в режиме реального времени",
    },
    {
      icon: "📊",
      title: "Наглядная аналитика",
      description:
        "Стройте графики доходности и анализируйте исторические данные по облигациям",
    },
    {
      icon: "📥",
      title: "Импорт файлов",
      description:
        "Загружайте облигации из CSV-файлов с автоматической проверкой дубликатов и валидацией данных",
    },
    {
      icon: "📤",
      title: "Экспорт файлов",
      description:
        "Выгружайте данные об облигациях в CSV для работы в Excel или других аналитических программах",
    },
    {
      icon: "💼",
      title: "Разные виды портфелей",
      description:
        "Создавайте портфели под разные стратегии: консервативные, сбалансированные, агрессивные — и управляйте ими",
    },
    {
      icon: "🛟",
      title: "Поддержка 24/7",
      description:
        "Наша команда поддержки доступна круглосуточно и готова помочь с любым вопросом по платформе",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Авторизуйтесь",
      description:
        "Войдите в систему через Keycloak. Это обеспечит безопасность ваших данных.",
    },
    {
      step: "2",
      title: "Заполните профиль",
      description:
        "Укажите паспортные данные, ИНН и СНИЛС, чтобы получить доступ к созданию портфелей.",
    },
    {
      step: "3",
      title: "Изучите облигации",
      description:
        "Перейдите в раздел «Облигации», чтобы увидеть доступные бумаги и графики их цен.",
    },
    {
      step: "4",
      title: "Создайте портфель",
      description:
        "Выберите тип портфеля (консервативный, агрессивный, сбалансированный) и добавьте облигации.",
    },
    {
      step: "5",
      title: "Следите за доходностью",
      description:
        "Анализируйте графики стоимости вашего портфеля и распределение активов.",
    },
  ];

  return (
    <div className={styles.mainPage}>
      {/* ==================== 1. КАРУСЕЛЬ ==================== */}
      <section className={styles.carouselSection}>
        <Carousel fade interval={6000} indicators={true} controls={true}>
          <Carousel.Item>
            <div className={`${styles.carouselSlide} ${styles.slide1Bg}`}>
              <h2 className={styles.slideTitle}>
                📊 Добро пожаловать в BondBank
              </h2>
              <p className={styles.slideSubtitle}>
                Единая платформа для мониторинга, глубокого анализа и удобного
                управления портфелем облигаций с ведущих бирж.
              </p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <div className={`${styles.carouselSlide} ${styles.slide2Bg}`}>
              <div className={styles.mockupWindow}>
                <h3
                  className={styles.mockupHeader}
                  style={{ color: "#4fc3f7" }}
                >
                  📈 Каталог облигаций
                </h3>
                <Table
                  striped
                  bordered
                  hover
                  variant="dark"
                  size="sm"
                  style={{ marginBottom: 0 }}
                >
                  <thead>
                    <tr style={{ color: "#a0aabf" }}>
                      <th>Название</th>
                      <th>ISIN</th>
                      <th>Тип</th>
                      <th>Цена (RUB)</th>
                      <th>Доходность</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>SIJ 4. IZDAJA</td>
                      <td style={{ color: "#4fc3f7" }}>SI0032103580</td>
                      <td>
                        <span
                          style={{
                            background: "#0ea5e9",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          LSE
                        </span>
                      </td>
                      <td style={{ color: "#2ecc71" }}>98.50 ₽</td>
                      <td>—</td>
                    </tr>
                    <tr>
                      <td>TELEKOM SLOVENIJE</td>
                      <td style={{ color: "#4fc3f7" }}>SI0032103630</td>
                      <td>
                        <span
                          style={{
                            background: "#10b981",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          SG
                        </span>
                      </td>
                      <td style={{ color: "#2ecc71" }}>101.50 ₽</td>
                      <td style={{ color: "#2ecc71" }}>3.2%</td>
                    </tr>
                    <tr>
                      <td>SDH 3. IZDAJA</td>
                      <td style={{ color: "#4fc3f7" }}>SI0002103529</td>
                      <td>
                        <span
                          style={{
                            background: "#8b5cf6",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          WB
                        </span>
                      </td>
                      <td style={{ color: "#2ecc71" }}>97.80 ₽</td>
                      <td>—</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <div className={`${styles.carouselSlide} ${styles.slide3Bg}`}>
              <div className={styles.mockupWindow}>
                <h3
                  className={styles.mockupHeader}
                  style={{ color: "#818cf8" }}
                >
                  💼 Аналитика портфеля
                </h3>
                <div className={styles.mockupGrid}>
                  <div className={styles.mockupCard}>
                    <div
                      style={{
                        color: "#a0aabf",
                        fontSize: "12px",
                        marginBottom: "8px",
                      }}
                    >
                      Стоимость портфеля
                    </div>
                    <div
                      style={{
                        color: "#2ecc71",
                        fontSize: "24px",
                        fontWeight: "bold",
                      }}
                    >
                      + 4.2%
                    </div>
                    <div className={styles.barChart}>
                      {[40, 50, 45, 60, 70, 65, 80, 90, 85, 100].map((h, i) => (
                        <div
                          key={i}
                          className={styles.bar}
                          style={{ height: `${h}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.mockupCard}>
                    <div
                      style={{
                        color: "#a0aabf",
                        fontSize: "12px",
                        marginBottom: "8px",
                      }}
                    >
                      Распределение активов
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100px",
                      }}
                    >
                      <div className={styles.pieChart}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Carousel.Item>
        </Carousel>
      </section>

      {/* ==================== 2. СТАТИСТИКА ==================== */}
      <section className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>Платформа в цифрах</h2>
        {error ? (
          <ErrorCard
            icon={error.isNetwork ? "🛰️" : "⚠️"}
            title={
              error.isNetwork
                ? "Сервер недоступен"
                : "Не удалось загрузить данные"
            }
            message={error.message}
            retryLabel="Повторить"
            onRetry={fetchInfoStatisticsBlockData}
          />
        ) : (
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCardNew}>
                <div className={styles.statIcon}>{stat.icon}</div>
                <div className={styles.statLabelNew}>{stat.label}</div>
                <div className={styles.statValueNew}>
                  {loadingInfoStatisticsBlockData ? "..." : stat.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==================== 3. С ЧЕГО НАЧАТЬ ==================== */}
      <section className={styles.startSection}>
        <h2 className={styles.startTitle}>🚀 С чего начать?</h2>
        <p className={styles.startSubtitle}>
          Всего 5 простых шагов от регистрации до первого анализа
        </p>

        <div className={styles.stepsGrid}>
          {steps.map((item, index) => (
            <div key={index} className={styles.stepCard}>
              <div className={styles.stepNumber}>{item.step}</div>
              <h3 className={styles.stepTitle}>{item.title}</h3>
              <p className={styles.stepDesc}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 4. ВОЗМОЖНОСТИ ==================== */}
      <section className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>Возможности платформы</h2>
        <div className={styles.infoGrid}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>

      {/* ==================== 5. ПЛЮСЫ И МИНУСЫ ==================== */}
      <section className={styles.prosConsSection}>
        <h2 className={styles.sectionTitle}>Плюсы и минусы</h2>
        <div className={styles.prosConsGrid}>
          <div className={styles.prosCard}>
            <h3 className={`${styles.listTitle} ${styles.listTitlePros}`}>
              <span style={{ fontSize: "28px" }}>✅</span> Преимущества
            </h3>
            <ul className={styles.list}>
              <li>
                <b>Интуитивный интерфейс:</b> Понятные таблицы и графики, не
                требующие глубоких технических знаний.
              </li>
              <li>
                <b>Бесплатный доступ к данным:</b> Актуальная информация о
                торгах с крупнейших бирж.
              </li>
              <li>
                <b>Удобное управление портфелем:</b> Создавайте портфели разных
                типов и следите за доходностью.
              </li>
              <li>
                <b>Импорт и экспорт:</b> Быстрая загрузка данных из CSV и
                выгрузка для анализа.
              </li>
              <li>
                <b>Безопасность:</b> Надежная авторизация через Keycloak.
              </li>
            </ul>
          </div>
          <div className={styles.consCard}>
            <h3 className={`${styles.listTitle} ${styles.listTitleCons}`}>
              <span style={{ fontSize: "28px" }}>⚠️</span> Ограничения
            </h3>
            <ul className={styles.list}>
              <li>
                <b>Не брокер:</b> Платформа предназначена для аналитики. Вы не
                можете совершать сделки напрямую.
              </li>
              <li>
                <b>Задержка данных:</b> Данные обновляются с периодичностью
                парсинга, а не в режиме реального времени.
              </li>
              <li>
                <b>Ограниченный список бирж:</b> В данный момент поддерживаются
                только 4 биржи.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainPage;
