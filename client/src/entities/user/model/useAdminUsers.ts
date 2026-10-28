import { useEffect, useState } from "react";
import { usersApi } from "../api/usersApi";
import { AdminUserResponseDto } from "./types";
import { ApiRequestError } from "../../../shared/api/client";

interface AdminUsersState {
    users: AdminUserResponseDto[];
    isLoading: boolean;
    error: string | null;
}

export const useAdminUsers = (enabled: boolean): AdminUsersState => {
    const [state, setState] = useState<AdminUsersState>({
        users: [],
        isLoading: enabled,
        error: null,
    });

    useEffect(() => {
        let isCurrent = true;
        if (!enabled) {
            setState({ users: [], isLoading: false, error: null });
            return () => {
                isCurrent = false;
            };
        }

        setState({ users: [], isLoading: true, error: null });
        void usersApi.getAllUsers().then(
            (users) => {
                if (isCurrent) setState({ users, isLoading: false, error: null });
            },
            (error: unknown) => {
                if (!isCurrent) return;
                if (error instanceof ApiRequestError && error.statusCode === 404) {
                    setState({ users: [], isLoading: false, error: null });
                    return;
                }
                const message = error instanceof ApiRequestError
                    ? error.serverMessage || error.message
                    : error instanceof Error
                        ? error.message
                        : "Не удалось загрузить пользователей";
                setState({ users: [], isLoading: false, error: message });
            },
        );

        return () => {
            isCurrent = false;
        };
    }, [enabled]);

    return state;
};
