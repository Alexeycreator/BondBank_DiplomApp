import { DataTable, TableColumn } from "../../../shared/ui/data-table/DataTable";
import ImportBonds from "../../../features/bond/import-export/ui/ImportBonds";
import { AdminFileData } from "../model/types";
import styles from "../AdminPage.module.css";

interface AdminFilesPanelProps {
    files: AdminFileData[];
    columns: TableColumn<AdminFileData>[];
    isLoading: boolean;
    selectedCount: number;
    onImport: () => void | Promise<void>;
    onDownloadSelected: () => void;
}

export function AdminFilesPanel({
    files,
    columns,
    isLoading,
    selectedCount,
    onImport,
    onDownloadSelected,
}: AdminFilesPanelProps) {
    return (
        <section className={styles.section}>
            <div className={styles.controls} style={{ justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <ImportBonds onImport={onImport} />
                    <button
                        className={styles.actionButton}
                        onClick={onDownloadSelected}
                        disabled={selectedCount === 0}
                        style={{
                            background: selectedCount === 0 ? "#2d3b5e" : "#2ecc71",
                            color: selectedCount === 0 ? "#a0aabf" : "#fff",
                            padding: "8px 16px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: selectedCount === 0 ? "not-allowed" : "pointer",
                        }}
                    >
                        ⬇️ Скачать выбранные ({selectedCount})
                    </button>
                </div>
            </div>

            <DataTable
                data={files}
                columns={columns}
                keyExtractor={(file) => file.id}
                emptyMessage="Файлы не найдены"
                isLoading={isLoading}
            />
        </section>
    );
}
