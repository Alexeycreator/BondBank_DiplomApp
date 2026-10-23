import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Breadcrumb, Dropdown } from "react-bootstrap";
import styles from "./Breadcrumbs.module.css";

const PATH_LABELS: Record<string, string> = {
    "": "Главная",
    "bonds": "Облигации",
    "portfolios": "Портфели",
    "forecast": "Прогнозы",
    "news": "Новости",
    "about": "О нас",
    "profile": "Профиль",
    "admin": "Админ-панель",
    "auth": "Авторизация",
};

// Интерфейс для элемента пути
interface PathItem {
    path: string;
    label: string;
}

export const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const [historyStack, setHistoryStack] = useState<PathItem[]>([]);

    useEffect(() => {
        // Если мы на главной, сбрасываем стек
        if (location.pathname === "/") {
            setHistoryStack([]);
            sessionStorage.removeItem("breadcrumbs_history");
            return;
        }

        const currentSegment = location.pathname.split("/").filter((x) => x)[0];
        const currentLabel = PATH_LABELS[currentSegment] || currentSegment;
        const currentPath = location.pathname;

        setHistoryStack((prev) => {
            // Если это первый переход, инициализируем "Главной"
            let newStack = [...prev];
            
            // Если стек пуст, добавляем Главную
            if (newStack.length === 0) {
                newStack.push({ path: "/", label: "Главная" });
            }

            // Проверяем, есть ли уже текущий путь в стеке (чтобы не дублировать)
            const existsIndex = newStack.findIndex((item) => item.path === currentPath);
            
            if (existsIndex !== -1) {
                // Если мы вернулись на предыдущую страницу, обрезаем стек до этого места
                newStack = newStack.slice(0, existsIndex + 1);
            } else {
                // Добавляем новую страницу в конец
                newStack.push({ path: currentPath, label: currentLabel });
            }

            // Сохраняем в sessionStorage, чтобы не терять при перезагрузке
            sessionStorage.setItem("breadcrumbs_history", JSON.stringify(newStack));
            return newStack;
        });
    }, [location.pathname]);

    // Восстанавливаем стек из sessionStorage при загрузке
    useEffect(() => {
        const saved = sessionStorage.getItem("breadcrumbs_history");
        if (saved) {
            setHistoryStack(JSON.parse(saved));
        }
    }, []);

    if (location.pathname === "/" || historyStack.length === 0) return null;

    // Логика сжатия, если элементов больше 4
    const items = historyStack;
    const shouldCollapse = items.length > 4;
    let visibleItems = items;
    let hiddenItems: PathItem[] = [];

    if (shouldCollapse) {
        visibleItems = [items[0], ...items.slice(-2)];
        hiddenItems = items.slice(1, -2);
    }

    return (
        <Breadcrumb className={styles.breadcrumbContainer}>
            {visibleItems.map((item, index) => {
                const isLast = index === visibleItems.length - 1;

                if (shouldCollapse && index === 0) {
                    return (
                        <React.Fragment key={item.path}>
                            <Breadcrumb.Item linkAs={Link} linkProps={{ to: item.path }}>
                                {item.label}
                            </Breadcrumb.Item>
                            
                            <Breadcrumb.Item active className={styles.ellipsisItem}>
                                <Dropdown align="end">
                                    <Dropdown.Toggle variant="link" id="dropdown-breadcrumb" className={styles.dropdownToggle}>
                                        ...
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className={styles.dropdownMenu}>
                                        {hiddenItems.map((hidden) => (
                                            <Dropdown.Item key={hidden.path} as={Link} to={hidden.path}>
                                                {hidden.label}
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Breadcrumb.Item>
                        </React.Fragment>
                    );
                }

                return isLast ? (
                    <Breadcrumb.Item active key={item.path}>
                        {item.label}
                    </Breadcrumb.Item>
                ) : (
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: item.path }} key={item.path}>
                        {item.label}
                    </Breadcrumb.Item>
                );
            })}
        </Breadcrumb>
    );
};