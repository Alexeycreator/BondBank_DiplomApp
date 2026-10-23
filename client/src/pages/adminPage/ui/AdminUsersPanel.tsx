import { User } from "../../../entities/user/model/types";
import { DataTable, TableColumn } from "../../../shared/ui/data-table/DataTable";
import styles from "../AdminPage.module.css";

interface AdminUsersPanelProps {
    users: User[];
    filteredUsers: User[];
    columns: TableColumn<User>[];
    isLoading: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    inactiveDays: number;
    onInactiveDaysChange: (value: number) => void;
    onDeleteInactive: () => void;
    isInactive: (lastSeen: string, days: number) => boolean;
}

export function AdminUsersPanel({
    users,
    filteredUsers,
    columns,
    isLoading,
    search,
    onSearchChange,
    inactiveDays,
    onInactiveDaysChange,
    onDeleteInactive,
    isInactive,
}: AdminUsersPanelProps) {
    return (
        <section className={styles.section}>
            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="🔍 Поиск по ФИО, логину, email..."
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className={styles.searchInput}
                />
                <div className={styles.inactiveControl}>
                    <label>Неактивны более:</label>
                    <input
                        type="number"
                        min="1"
                        value={inactiveDays}
                        onChange={(event) => onInactiveDaysChange(Number(event.target.value))}
                        className={styles.daysInput}
                    />
                    <span>дней</span>
                    <button className={styles.dangerButton} onClick={onDeleteInactive}>
                        🗑️ Удалить неактивных
                    </button>
                </div>
            </div>

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
                    <span className={styles.statLabel}>Всего (без вас)</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>
                        {users.filter((user) => user.role === "admin").length}
                    </span>
                    <span className={styles.statLabel}>Админов</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>
                        {users.filter((user) => isInactive(user.lastSeen, inactiveDays)).length}
                    </span>
                    <span className={styles.statLabel}>Неактивных</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>
                        {users.filter((user) => user.isBlocked).length}
                    </span>
                    <span className={styles.statLabel}>Заблокировано</span>
                </div>
            </div>
        </section>
    );
}
