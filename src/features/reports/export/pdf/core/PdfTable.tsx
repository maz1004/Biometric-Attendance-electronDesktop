import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { ColumnDefinition } from "../../types";
import { colors } from "./styles";

const tableStyles = StyleSheet.create({
    table: {
        width: "100%",
        marginTop: 10,
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
        alignItems: "center",
        height: 24, // Fixed height for consistency
    },
    header: {
        backgroundColor: colors.background.header,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.default,
    },
    cell: {
        fontSize: 9,
        paddingLeft: 4,
        paddingRight: 4,
        color: colors.text.secondary,
    },
    headerCell: {
        fontWeight: "bold",
        color: colors.text.primary,
    },
});

interface PdfTableProps<T> {
    data: T[];
    columns: ColumnDefinition<T>[];
    rowsPerPage?: number; // Contract for future pagination
}

export const PdfTable = <T extends any>({ data, columns, rowsPerPage: _rowsPerPage }: PdfTableProps<T>) => {
    return (
        <View style={tableStyles.table}>
            {/* Header */}
            <View style={[tableStyles.row, tableStyles.header]}>
                {columns.map((col, titleIdx) => (
                    <Text
                        key={titleIdx}
                        style={[
                            tableStyles.cell,
                            tableStyles.headerCell,
                            { width: col.width || `${100 / columns.length}%`, textAlign: col.align || "left" },
                        ]}
                    >
                        {col.header}
                    </Text>
                ))}
            </View>

            {/* Body */}
            {data.map((row, rowIndex) => (
                <View
                    key={rowIndex}
                    style={[
                        tableStyles.row,
                        // Zebra striping for readability
                        rowIndex % 2 === 1 ? { backgroundColor: colors.background.zebra } : {}
                    ]}
                >
                    {columns.map((col, colIndex) => {
                        let value: React.ReactNode = "";

                        if (col.format) {
                            value = col.format(row[col.field!] ?? "", row);
                        } else if (col.field) {
                            value = String(row[col.field] ?? "");
                        }

                        return (
                            <Text
                                key={colIndex}
                                style={[
                                    tableStyles.cell,
                                    { width: col.width || `${100 / columns.length}%`, textAlign: col.align || "left" },
                                ]}
                            >
                                {/* @ts-ignore - Text expects string/number but explicit casting handles it */}
                                {value}
                            </Text>
                        );
                    })}
                </View>
            ))}
        </View>
    );
};
