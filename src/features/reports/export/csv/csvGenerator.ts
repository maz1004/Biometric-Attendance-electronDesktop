import { ColumnDefinition } from "../types";

/**
 * generateCSV
 * Generates a CSV string with BOM from an array of data and column definitions.
 * Handles escaping of special characters.
 */
export const generateCSV = <T extends any>(data: T[], columns: ColumnDefinition<T>[]): string => {
    // 1. Header Row
    const headerRow = columns.map(col => escapeCsvValue(col.header)).join(";");

    // 2. Data Rows
    const dataRows = data.map(row => {
        return columns.map(col => {
            let val: string | number | boolean = "";

            if (col.value) {
                // Computed value for CSV
                val = col.value(row);
            } else if (col.field) {
                // Direct field access
                val = row[col.field] as any;
            }

            // Fallback to empty string for null/undefined
            if (val === null || val === undefined) val = "";

            return escapeCsvValue(String(val));
        }).join(";");
    });

    // 3. Combine with BOM for Excel UTF-8 compatibility
    const csvContent = "\uFEFF" + [headerRow, ...dataRows].join("\n");
    return csvContent;
};

/**
 * Helper to escape CSV values containing delimiters, quotes, or newlines.
 */
const escapeCsvValue = (value: string): string => {
    if (value.includes(";") || value.includes('"') || value.includes("\n")) {
        // Double quotes to escape double quotes
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
};
