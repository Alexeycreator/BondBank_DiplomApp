import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Tabs, Tab, Form, Button, Accordion } from "react-bootstrap";
import styles from "./ProfilePage.module.css";
import { useToast } from "../../context/ToastContext";

const ProfilePage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({ lastName: "Иванов", firstName: "Иван", middleName: "Иванович", email: "user1@bondbank.com", phone: "89123456789", inn: "1234567890" });
    const [docData, setDocData] = useState({ passportSeries: "1234", passportNumber: "567890", passportIssuedBy: "ОВД г. Москвы", passportIssueDate: "2010-01-01", snils: "123-456-789 00" });

    const handleSave = () => {
        showToast("Успешно", "Данные профиля обновлены", "success");
    };

    return (
        <div className={styles.profilePage}>
            <div className={styles.profileHeader}>
                <div className={styles.avatar}>ИИ</div>
                <div className={styles.userInfo}>
                    <h1 className={styles.userName}>Иванов Иван Иванович</h1>
                    <span className={styles.userRole}>👤 Пользователь</span>
                </div>
                <Button variant="outline-danger" className={styles.logoutButton}>Выйти</Button>
            </div>

            <Tabs defaultActiveKey="personal" id="profile-tabs" className="custom-tabs mb-4" fill>
                <Tab eventKey="personal" title="👤 Личные данные">
                    <div className="pt-3">
                        <div className={styles.formContainer}>
                            <Form>
                                <div className={styles.formRow}>
                                    <Form.Group className="mb-3" controlId="lastName"><Form.Label>Фамилия</Form.Label><Form.Control type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={styles.darkInput} /></Form.Group>
                                    <Form.Group className="mb-3" controlId="firstName"><Form.Label>Имя</Form.Label><Form.Control type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className={styles.darkInput} /></Form.Group>
                                    <Form.Group className="mb-3" controlId="middleName"><Form.Label>Отчество</Form.Label><Form.Control type="text" value={formData.middleName} onChange={(e) => setFormData({ ...formData, middleName: e.target.value })} className={styles.darkInput} /></Form.Group>
                                </div>
                                <div className={styles.formRow}>
                                    <Form.Group className="mb-3" controlId="email"><Form.Label>Email</Form.Label><Form.Control type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={styles.darkInput} /></Form.Group>
                                    <Form.Group className="mb-3" controlId="phone"><Form.Label>Телефон</Form.Label><Form.Control type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={styles.darkInput} /></Form.Group>
                                    <Form.Group className="mb-3" controlId="inn"><Form.Label>ИНН</Form.Label><Form.Control type="text" value={formData.inn} onChange={(e) => setFormData({ ...formData, inn: e.target.value })} className={styles.darkInput} /></Form.Group>
                                </div>
                                <Button variant="info" onClick={handleSave} className="text-dark fw-bold mt-3">Сохранить</Button>
                            </Form>
                        </div>
                    </div>
                </Tab>

                <Tab eventKey="documents" title="📄 Документы">
                    <div className="pt-3">
                        <div className={styles.formContainer}>
                            <Accordion defaultActiveKey="0" className={styles.darkAccordion}>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>📕 Паспорт</Accordion.Header>
                                    <Accordion.Body>
                                        <Form>
                                            <div className={styles.formRow}>
                                                <Form.Group className="mb-3" controlId="passportSeries"><Form.Label>Серия</Form.Label><Form.Control type="text" value={docData.passportSeries} onChange={(e) => setDocData({ ...docData, passportSeries: e.target.value })} className={styles.darkInput} /></Form.Group>
                                                <Form.Group className="mb-3" controlId="passportNumber"><Form.Label>Номер</Form.Label><Form.Control type="text" value={docData.passportNumber} onChange={(e) => setDocData({ ...docData, passportNumber: e.target.value })} className={styles.darkInput} /></Form.Group>
                                            </div>
                                            <Form.Group className="mb-3" controlId="passportIssuedBy"><Form.Label>Кем выдан</Form.Label><Form.Control type="text" value={docData.passportIssuedBy} onChange={(e) => setDocData({ ...docData, passportIssuedBy: e.target.value })} className={styles.darkInput} /></Form.Group>
                                            <Form.Group className="mb-3" controlId="passportIssueDate"><Form.Label>Дата выдачи</Form.Label><Form.Control type="date" value={docData.passportIssueDate} onChange={(e) => setDocData({ ...docData, passportIssueDate: e.target.value })} className={styles.darkInput} /></Form.Group>
                                        </Form>
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>🪪 СНИЛС</Accordion.Header>
                                    <Accordion.Body>
                                        <Form.Group className="mb-3" controlId="snils"><Form.Label>Номер СНИЛС</Form.Label><Form.Control type="text" value={docData.snils} onChange={(e) => setDocData({ ...docData, snils: e.target.value })} className={styles.darkInput} /></Form.Group>
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="2">
                                    <Accordion.Header>📄 ИНН</Accordion.Header>
                                    <Accordion.Body>
                                        <Form.Group className="mb-3" controlId="innDoc"><Form.Label>Номер ИНН</Form.Label><Form.Control type="text" value={formData.inn} onChange={(e) => setFormData({ ...formData, inn: e.target.value })} className={styles.darkInput} /></Form.Group>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                            <Button variant="info" onClick={handleSave} className="text-dark fw-bold mt-4">Сохранить документы</Button>
                        </div>
                    </div>
                </Tab>

                <Tab eventKey="security" title="🔒 Безопасность">
                    <div className="pt-3">
                        <div className={styles.formContainer}>
                            <Form>
                                <Form.Group className="mb-3" controlId="currentPassword"><Form.Label>Текущий пароль</Form.Label><Form.Control type="password" placeholder="••••••••" className={styles.darkInput} /></Form.Group>
                                <Form.Group className="mb-3" controlId="newPassword"><Form.Label>Новый пароль</Form.Label><Form.Control type="password" placeholder="••••••••" className={styles.darkInput} /></Form.Group>
                                <Form.Group className="mb-3" controlId="confirmPassword"><Form.Label>Подтвердите новый пароль</Form.Label><Form.Control type="password" placeholder="••••••••" className={styles.darkInput} /></Form.Group>
                                <Button variant="info" onClick={handleSave} className="text-dark fw-bold mt-3">Сменить пароль</Button>
                            </Form>
                        </div>
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
};

export default ProfilePage;