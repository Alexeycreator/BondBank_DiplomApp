import { Carousel, Table } from "react-bootstrap";
import styles from "../MainPage.module.css";
import { HOME_SHOWCASE_BARS, HOME_SHOWCASE_BONDS } from "../model/content";

const MainShowcase = () => (
  <section className={styles.carouselSection}>
    <Carousel fade interval={6000} indicators controls>
      <Carousel.Item>
        <div className={`${styles.carouselSlide} ${styles.slide1Bg}`}>
          <h2 className={styles.slideTitle}>📊 Добро пожаловать в BondBank</h2>
          <p className={styles.slideSubtitle}>
            Единая платформа для мониторинга, глубокого анализа и удобного
            управления портфелем облигаций с ведущих бирж.
          </p>
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <div className={`${styles.carouselSlide} ${styles.slide2Bg}`}>
          <div className={styles.mockupWindow}>
            <h3 className={styles.mockupHeader} style={{ color: "#4fc3f7" }}>
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
                {HOME_SHOWCASE_BONDS.map((bond) => (
                  <tr key={bond.isin}>
                    <td>{bond.name}</td>
                    <td style={{ color: "#4fc3f7" }}>{bond.isin}</td>
                    <td>
                      <span
                        style={{
                          background: bond.color,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {bond.type}
                      </span>
                    </td>
                    <td style={{ color: "#2ecc71" }}>{bond.price}</td>
                    <td style={bond.yield !== "—" ? { color: "#2ecc71" } : {}}>
                      {bond.yield}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <div className={`${styles.carouselSlide} ${styles.slide3Bg}`}>
          <div className={styles.mockupWindow}>
            <h3 className={styles.mockupHeader} style={{ color: "#818cf8" }}>
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
                  style={{ color: "#2ecc71", fontSize: "24px", fontWeight: "bold" }}
                >
                  + 4.2%
                </div>
                <div className={styles.barChart}>
                  {HOME_SHOWCASE_BARS.map((height, index) => (
                    <div
                      key={index}
                      className={styles.bar}
                      style={{ height: `${height}%` }}
                    />
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
                  <div className={styles.pieChart} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Carousel.Item>
    </Carousel>
  </section>
);

export default MainShowcase;
