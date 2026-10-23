import React from "react";
import { Table } from "react-bootstrap";
import styles from "./DataTable.module.css";
import Spinner from "../spinner/Spinner"; // Подключаем ваш компонент спиннера

export interface TableColumn<T> {
    key: string;
    title: React.ReactNode;
    render?: (item: T, index: number) => React.ReactNode;
    onClick?: () => void;
    className?: string;
    headerClassName?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    keyExtractor: (item: T) => string | number;
    onRowClick?: (item: T) => void;
    rowClassName?: (item: T) => string;
    emptyMessage?: string;
    startIndex?: number;
    isLoading?: boolean; // <--- Добавили пропс
}

export function DataTable<T>({
    data,
    columns,
    keyExtractor,
    onRowClick,
    rowClassName,
    emptyMessage = "Данных нет",
    startIndex = 1,
    isLoading = false, // <--- Значение по умолчанию
}: DataTableProps<T>) {
    return (
        <div className={styles.tableWrapper}>
            <Table variant="dark" hover responsive className={styles.customTable}>
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={col.key || index}
                                className={`${col.headerClassName || ""} ${
                                    col.onClick ? styles.sortable : ""
                                }`}
                                onClick={col.onClick}
                            >
                                {col.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length} className={styles.noData} style={{ padding: "50px" }}>
                                <Spinner size="medium" variant="primary" label="Загрузка данных..." />
                            </td>
                        </tr>
                    ) : data.length > 0 ? (
                        data.map((item, rowIndex) => {
                            const rowNum = startIndex + rowIndex;
                            const customClass = rowClassName ? rowClassName(item) : "";
                            return (
                                <tr
                                    key={keyExtractor(item)}
                                    onClick={() => onRowClick && onRowClick(item)}
                                    className={`${customClass} ${
                                        onRowClick ? styles.clickable : ""
                                    }`}
                                >
                                    {columns.map((col, colIndex) => (
                                        <td key={col.key || colIndex} className={col.className}>
                                            {col.render 
                                                ? col.render(item, rowNum) 
                                                : (item[col.key as keyof T] as React.ReactNode)
                                            }
                                        </td>
                                    ))}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className={styles.noData}>
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
}