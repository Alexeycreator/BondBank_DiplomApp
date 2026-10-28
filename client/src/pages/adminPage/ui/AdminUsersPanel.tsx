import { useMemo } from "react";
import { AdminUserResponseDto } from "../../../entities/user/model/types";
import { DataTable, TableColumn } from "../../../shared/ui/data-table/DataTable";
import styles from "../AdminPage.module.css";

interface AdminUsersPanelProps {
    users: AdminUserResponseDto[];
    isLoading: boolean;
    error: string | null;
    search: string;
    onSearchChange: (value: string) => void;
}

const formatDate = (date: string | null): string =>
    date ? new Date(date).toLocaleString("ru-RU") : "—";

export function AdminUsersPanel({
    users,
    isLoading,
    error,
    search,
    onSearchChange,
}: AdminUsersPanelProps) {
    const filteredUsers = useMemo(() => {
        const query = search.trim().toLocaleLowerCase();
        if (!query) return users;
        return users.filter((user) =>
            [
                user.login,
                user.emailAddress,
                user.phoneNumber ?? "",
                user.secondName,
                user.firstName,
                user.surName,
            ].some((value) => value.toLocaleLowerCase().includes(query)),
        );
    }, [users, search]);

    const columns: TableColumn<AdminUserResponseDto>[] = [
        { key: "id", title: "ID" },
        {
            key: "fullName",
            title: "ФИО",
            render: (user) => `${user.secondName} ${user.firstName} ${user.surName}`.trim(),
        },
        { key: "login", title: "Логин" },
        { key: "emailAddress", title: "Email" },
        { key: "phoneNumber", title: "Телефон", render: (user) => user.phoneNumber || "—" },
        { key: "lastLoginAt", title: "Последний вход", render: (user) => formatDate(user.lastLoginAt) },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Поиск по ФИО, логину, email..."
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className={styles.searchInput}
                />
            </div>
            {error && <div role="alert" className={styles.noData}>{error}</div>}
            <DataTable
                data={filteredUsers}
                columns={columns}
                keyExtractor={(user) => user.id}
                emptyMessage="Пользователи не найдены"
                isLoading={isLoading}
            />
            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>{users.length}</span>
                    <span className={styles.statLabel}>Пользователей в ответе API</span>
                </div>
            </div>
        </section>
    );
}
