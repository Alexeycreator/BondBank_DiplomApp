import React from "react";
import styles from "./Footer.module.css";

const Footer = () => {
    // Моковые данные для контактов
    const contacts = {
        email: "support@bondbank.com",
        phone: "+7 (800) 555-01-23",
        address: "г. Москва, ул. Тверская, д. 1",
        workingHours: "Пн-Пт: 9:00 - 18:00 (МСК)"
    };

    // Текущий год для копирайта
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Логотип / Название компании */}
                <div className={styles.column}>
                    <h3 className={styles.title}>BondBank</h3>
                    <p className={styles.description}>
                        Платформа для мониторинга и анализа облигаций
                    </p>
                </div>

                {/* Контактная информация */}
                <div className={styles.column}>
                    <h4 className={styles.subtitle}>Контакты</h4>
                    <p className={styles.contactItem}>📧 {contacts.email}</p>
                    <p className={styles.contactItem}>📞 {contacts.phone}</p>
                    <p className={styles.contactItem}>📍 {contacts.address}</p>
                </div>

                {/* Часы работы */}
                <div className={styles.column}>
                    <h4 className={styles.subtitle}>Режим работы</h4>
                    <p className={styles.contactItem}>🕐 {contacts.workingHours}</p>
                </div>
            </div>

            {/* Копирайт */}
            <div className={styles.copyright}>
                <p>© {currentYear} BondBank. Все права защищены.</p>
            </div>
        </footer>
    );
}

export default Footer;