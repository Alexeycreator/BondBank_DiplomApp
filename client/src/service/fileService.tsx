import { Bond } from "../components/types/index";

/**
 * Экспорт облигаций в CSV-файл
 * @param bonds - массив облигаций для экспорта
 * @param filename - имя файла (без расширения)
 */
export const exportBondsToCsv = (bonds: Bond[], filename: string = "bonds"): void => {
    try {
        // Заголовки CSV
        const headers = ["ID", "Название", "ISIN", "Тип", "Цена", "Доходность", "Дата погашения", "Валюта", "Курс валюты", "Обновлено"];

        // Формируем строки
        const rows = bonds.map((bond) => [
            bond.id,
            `"${bond.name}"`,
            bond.isin,
            bond.type.toUpperCase(),
            bond.price,
            bond.yield,
            bond.maturity,
            bond.currency,
            bond.currencyRate,
            bond.updatedAt,
        ]);

        // Собираем CSV
        const csvContent = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

        // Добавляем BOM для корректного отображения кириллицы в Excel
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });

        // Скачиваем файл
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return;
    } catch (error) {
        console.error("Ошибка экспорта:", error);
        throw new Error("Не удалось экспортировать файл");
    }
};

/**
 * Импорт облигаций из CSV-файла
 * @param file - файл для импорта
 * @returns массив распарсенных облигаций
 */
export const importBondsFromCsv = async (file: File): Promise<Bond[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;

                if (!text) {
                    reject(new Error("Файл пустой"));
                    return;
                }

                const lines = text.split("\n").filter((line) => line.trim() !== "");

                if (lines.length < 2) {
                    reject(new Error("Файл не содержит данных"));
                    return;
                }

                // Пропускаем заголовок
                const dataLines = lines.slice(1);

                const bonds: Bond[] = dataLines.map((line, index) => {
                    // Разделитель — точка с запятой
                    const cells = line.split(";").map((c) => c.replace(/^"|"$/g, "").trim());

                    return {
                        id: Number(cells[0]) || index + 1,
                        name: cells[1] || "Без названия",
                        isin: cells[2] || "",
                        type: (cells[3]?.toLowerCase() as Bond["type"]) || "lse",
                        price: Number(cells[4]) || 0,
                        yield: Number(cells[5]) || 0,
                        maturity: cells[6] || "",
                        currency: cells[7] || "RUB",
                        currencyRate: Number(cells[8]) || 1,
                        updatedAt: cells[9] || new Date().toISOString().split("T")[0],
                    };
                });

                resolve(bonds);
            } catch (error) {
                reject(new Error("Ошибка парсинга CSV-файла"));
            }
        };

        reader.onerror = () => {
            reject(new Error("Ошибка чтения файла"));
        };

        reader.readAsText(file, "UTF-8");
    });
};