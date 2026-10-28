import { useEffect, useState } from "react";
import { getPortfoliosByUser } from "../api/portfoliosApi";
import { PortfolioDto } from "./api-types";
import { usersApi } from "../../user/api/usersApi";
import { UserModel } from "../../user/model/types";
import { ApiRequestError } from "../../../shared/api/client";

interface MyPortfoliosState {
    portfolios: PortfolioDto[];
    isLoading: boolean;
    error: string | null;
    reload: () => void;
}

export const useMyPortfolios = (enabled: boolean): MyPortfoliosState => {
    const [portfolios, setPortfolios] = useState<PortfolioDto[]>([]);
    const [isLoading, setIsLoading] = useState(enabled);
    const [error, setError] = useState<string | null>(null);
    const [reloadCount, setReloadCount] = useState(0);

    useEffect(() => {
        let isCurrent = true;

        if (!enabled) {
            setPortfolios([]);
            setIsLoading(false);
            setError(null);
            return () => {
                isCurrent = false;
            };
        }

        setPortfolios([]);
        setIsLoading(true);
        setError(null);

        const loadPortfolios = async () => {
            let profile: UserModel;
            try {
                profile = await usersApi.getMyProfile();
            } catch (requestError: unknown) {
                if (!isCurrent) return;
                const message = requestError instanceof ApiRequestError
                    ? requestError.statusCode === 404
                        ? "Профиль пользователя не найден в базе данных."
                        : requestError.serverMessage || requestError.message
                    : requestError instanceof Error
                        ? requestError.message
                        : "Не удалось загрузить профиль пользователя";
                setError(message);
                setIsLoading(false);
                return;
            }

            if (!Number.isInteger(profile.id) || profile.id < 1) {
                if (!isCurrent) return;
                setError("Сервер вернул некорректный ID пользователя.");
                setIsLoading(false);
                return;
            }

            try {
                const result = await getPortfoliosByUser(profile.id);
                if (isCurrent) setPortfolios(result);
            } catch (requestError: unknown) {
                if (!isCurrent) return;
                if (requestError instanceof ApiRequestError && requestError.statusCode === 404) {
                    setPortfolios([]);
                    return;
                }
                const message = requestError instanceof ApiRequestError
                    ? requestError.serverMessage || requestError.message
                    : requestError instanceof Error
                        ? requestError.message
                        : "Не удалось загрузить портфели";
                setError(message);
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        };

        void loadPortfolios();

        return () => {
            isCurrent = false;
        };
    }, [enabled, reloadCount]);

    return {
        portfolios,
        isLoading,
        error,
        reload: () => setReloadCount((count) => count + 1),
    };
};
