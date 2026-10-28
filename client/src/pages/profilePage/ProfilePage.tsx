import { useState, useEffect } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
import { Tabs, Tab, Form, Button, Accordion, Spinner } from "react-bootstrap";
import styles from "./ProfilePage.module.css";
import { useToast } from "../../shared/notifications/ToastContext";
import { usersApi } from "../../entities/user/api/usersApi";
import { getPassportById, getSnilsById } from "../../entities/user/api/securityDataApi";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);

  // Данные формы
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    email: "",
    phone: "",
  });

  // Данные документов
  const [docData, setDocData] = useState({
    inn: "",
    passportSeries: "",
    passportNumber: "",
    passportIssuedBy: "",
    passportIssueDate: "",
    snils: "",
  });

  // Данные для смены пароля
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await usersApi.getMyProfile();
        setFormData({
          lastName: data.secondName || "",
          firstName: data.firstName || "",
          middleName: data.surName || "",
          email: data.emailAddress || "",
          phone: data.phoneNumber || "",
        });
        setDocData((current) => ({ ...current, inn: data.tin || "" }));

        const [passportResult, snilsResult] = await Promise.allSettled([
          data.passportId !== null ? getPassportById(data.passportId) : Promise.resolve(null),
          data.snilsId !== null ? getSnilsById(data.snilsId) : Promise.resolve(null),
        ]);
        const passport = passportResult.status === "fulfilled" ? passportResult.value : null;
        const snils = snilsResult.status === "fulfilled" ? snilsResult.value : null;
        if (passportResult.status === "rejected" || snilsResult.status === "rejected") {
          console.error("Не удалось загрузить данные документов профиля:", {
            passportError: passportResult.status === "rejected" ? passportResult.reason : undefined,
            snilsError: snilsResult.status === "rejected" ? snilsResult.reason : undefined,
          });
          showToast("Предупреждение", "Не удалось загрузить данные документов профиля", "warning");
        }

        setDocData({
          inn: data.tin || "",
          passportSeries: passport ? String(passport.series).padStart(4, "0") : "",
          passportNumber: passport ? String(passport.number).padStart(6, "0") : "",
          passportIssuedBy: passport?.issuedBy || "",
          passportIssueDate: passport?.dateOfIssue || "",
          snils: snils?.number || "",
        });
      } catch (error: unknown) {
        console.error("Ошибка загрузки профиля:", error);
        showToast("Ошибка", "Не удалось загрузить данные профиля", "danger");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [showToast]);

  const handleSaveProfile = () => {
    showToast(
      "Сохранение недоступно",
      "Сервер пока не предоставляет API для обновления профиля.",
      "info",
    );
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      showToast("Ошибка", "Пароли не совпадают", "danger");
      return;
    }
    if (passwords.new.length < 6) {
      showToast("Ошибка", "Пароль должен быть не менее 6 символов", "danger");
      return;
    }

    showToast(
      "Смена пароля недоступна",
      "Для этой операции ещё не подключён запрос к Keycloak.",
      "info",
    );
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          color: "white",
        }}
      >
        <Spinner animation="border" variant="info" />
        <span style={{ marginLeft: "16px" }}>Загрузка профиля...</span>
      </div>
    );
  }

  const initials =
    `${formData.lastName.charAt(0)}${formData.firstName.charAt(0)}`.toUpperCase() ||
    "??";

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.userInfo}>
          <h1 className={styles.userName}>
            {formData.lastName} {formData.firstName} {formData.middleName}
          </h1>
          <span className={styles.userRole}>👤 Пользователь</span>
        </div>
        <Button
          variant="outline-danger"
          className={styles.logoutButton}
          onClick={logout}
        >
          Выйти
        </Button>
      </div>

      <Tabs
        defaultActiveKey="personal"
        id="profile-tabs"
        className="custom-tabs mb-4"
        fill
      >
        <Tab eventKey="personal" title="👤 Личные данные">
          <div className="pt-3">
            <div className={styles.formContainer}>
              <Form>
                <div className={styles.formRow}>
                  <Form.Group className="mb-3" controlId="lastName">
                    <Form.Label>Фамилия</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className={styles.darkInput}
                      placeholder="Не указана"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="firstName">
                    <Form.Label>Имя</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className={styles.darkInput}
                      placeholder="Не указано"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="middleName">
                    <Form.Label>Отчество</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.middleName}
                      onChange={(e) =>
                        setFormData({ ...formData, middleName: e.target.value })
                      }
                      className={styles.darkInput}
                      placeholder="Не указано"
                    />
                  </Form.Group>
                </div>
                <div className={styles.formRow}>
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={styles.darkInput}
                      disabled
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="phone">
                    <Form.Label>Телефон</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className={styles.darkInput}
                      placeholder="Не указан"
                    />
                  </Form.Group>
                </div>
                <div className={styles.formActionsRight}>
                  <Button
                    variant="info"
                    onClick={handleSaveProfile}
                    className="text-dark fw-bold"
                  >
                    Сохранить
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </Tab>

        <Tab eventKey="documents" title="📄 Документы">
          <div className="pt-3">
            <div className={styles.formContainer}>
              <Accordion defaultActiveKey="0" className={styles.darkAccordion}>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>📄 ИНН</Accordion.Header>
                  <Accordion.Body>
                    <Form.Group className="mb-3" controlId="innDoc">
                      <Form.Label>Номер ИНН</Form.Label>
                      <Form.Control
                        type="text"
                        value={docData.inn}
                        onChange={(e) =>
                          setDocData({ ...docData, inn: e.target.value })
                        }
                        className={styles.darkInput}
                        placeholder="Не указан"
                      />
                    </Form.Group>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>📕 Паспорт</Accordion.Header>
                  <Accordion.Body>
                    <Form>
                      <div className={styles.formRow}>
                        <Form.Group className="mb-3" controlId="passportSeries">
                          <Form.Label>Серия</Form.Label>
                          <Form.Control
                            type="text"
                            value={docData.passportSeries}
                            onChange={(e) =>
                              setDocData({
                                ...docData,
                                passportSeries: e.target.value,
                              })
                            }
                            className={styles.darkInput}
                            placeholder="Не указана"
                          />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="passportNumber">
                          <Form.Label>Номер</Form.Label>
                          <Form.Control
                            type="text"
                            value={docData.passportNumber}
                            onChange={(e) =>
                              setDocData({
                                ...docData,
                                passportNumber: e.target.value,
                              })
                            }
                            className={styles.darkInput}
                            placeholder="Не указан"
                          />
                        </Form.Group>
                      </div>
                      <Form.Group className="mb-3" controlId="passportIssuedBy">
                        <Form.Label>Кем выдан</Form.Label>
                        <Form.Control
                          type="text"
                          value={docData.passportIssuedBy}
                          onChange={(e) =>
                            setDocData({
                              ...docData,
                              passportIssuedBy: e.target.value,
                            })
                          }
                          className={styles.darkInput}
                          placeholder="Не указано"
                        />
                      </Form.Group>
                      <Form.Group
                        className="mb-3"
                        controlId="passportIssueDate"
                      >
                        <Form.Label>Дата выдачи</Form.Label>
                        <Form.Control
                          type="date"
                          value={docData.passportIssueDate}
                          onChange={(e) =>
                            setDocData({
                              ...docData,
                              passportIssueDate: e.target.value,
                            })
                          }
                          className={styles.darkInput}
                          // ✅ Добавляем плейсхолдер для даты через CSS (в modules это делается классом)
                        />
                      </Form.Group>
                    </Form>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header>🪪 СНИЛС</Accordion.Header>
                  <Accordion.Body>
                    <Form.Group className="mb-3" controlId="snils">
                      <Form.Label>Номер СНИЛС</Form.Label>
                      <Form.Control
                        type="text"
                        value={docData.snils}
                        onChange={(e) =>
                          setDocData({ ...docData, snils: e.target.value })
                        }
                        className={styles.darkInput}
                        placeholder="Не указан"
                      />
                    </Form.Group>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
              <div className={styles.formActionsRight}>
                <Button
                  variant="info"
                  onClick={handleSaveProfile}
                  className="text-dark fw-bold"
                >
                  Сохранить
                </Button>
              </div>
            </div>
          </div>
        </Tab>

        <Tab eventKey="security" title="🔒 Безопасность">
          <div className="pt-3">
            <div className={styles.formContainer}>
              <Form>
                <Form.Group className="mb-3" controlId="currentPassword">
                  <Form.Label>Текущий пароль</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    className={styles.darkInput}
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="newPassword">
                  <Form.Label>Новый пароль</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    className={styles.darkInput}
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords({ ...passwords, new: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Подтвердите новый пароль</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    className={styles.darkInput}
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                  />
                </Form.Group>
                <div className={styles.formActionsRight}>
                  <Button
                    variant="info"
                    onClick={handleChangePassword}
                    className="text-dark fw-bold"
                  >
                    Сменить пароль
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
