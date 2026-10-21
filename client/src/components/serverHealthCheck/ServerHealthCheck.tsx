import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import ErrorCard from "../errorCard/ErrorCard";

const apiUrl =
    import.meta.env.VITE_API_URL_HTTPS ||
    import.meta.env.VITE_API_URL_HTTP ||
    "https://localhost:57041/api";

const HEALTH_ENDPOINT = "/Health/ping";
const REQUEST_TIMEOUT = 5000;

export interface ServerHealthCheckProps {
    children: React.ReactNode;
    /** Интервал автопроверки в мс (по умолчанию 30 000) */
    checkInterval?: number;
}

const ServerHealthCheck: React.FC<ServerHealthCheckProps> = ({
    children,
    checkInterval = 30_000,
}) => {
    const [isServerAvailable, setIsServerAvailable] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    // Защита от гонок: игнорируем ответы устаревших запросов
    const requestIdRef = useRef(0);

    const checkServer = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        setIsChecking(true);

        try {
            await axios.get(`${apiUrl}${HEALTH_ENDPOINT}`, {
                timeout: REQUEST_TIMEOUT,
            });

            if (requestId === requestIdRef.current) {
                setIsServerAvailable(true);
            }
        } catch (err: any) {
            if (requestId !== requestIdRef.current) return;

            // Есть response → сервер ответил (пусть даже 4xx/5xx) → он жив
            if (err?.response) {
                setIsServerAvailable(true);
            } else {
                setIsServerAvailable(false);
            }
        } finally {
            if (requestId === requestIdRef.current) {
                setIsChecking(false);
            }
        }
    }, []);

    // Первичная проверка + периодический опрос
    useEffect(() => {
        checkServer();

        const intervalId = setInterval(checkServer, checkInterval);
        return () => clearInterval(intervalId);
    }, [checkServer, checkInterval]);

    // Первая проверка ещё не завершена
    if (isServerAvailable === null) {
        return (
            <div style={{ padding: "80px 20px", textAlign: "center", color: "#666" }}>
                Подключение к серверу…
            </div>
        );
    }

    // Сервер недоступен
    if (!isServerAvailable) {
        return (
            <div style={{ padding: "80px 20px" }}>
                <ErrorCard
                    icon="🛰️"
                    title="Сервер недоступен"
                    message="Не удаётся связаться с сервером. Проверьте, запущен ли бэкенд, и повторите попытку."
                    retryLabel={isChecking ? "Проверяем…" : "Повторить"}
                    onRetry={isChecking ? undefined : checkServer}
                />
            </div>
        );
    }

    return <>{children}</>;
};

export default ServerHealthCheck;