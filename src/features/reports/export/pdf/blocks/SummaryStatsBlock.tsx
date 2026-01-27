import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { ReportSummary } from "../../../../../services/types/api-types";
import { colors } from "../core/styles";

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 20,
        marginTop: 10,
    },
    card: {
        flex: 1,
        padding: 10,
        backgroundColor: colors.background.header,
        borderRadius: 4,
        minWidth: "22%", // fit 4 in a row approx
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    label: {
        fontSize: 8,
        color: colors.text.secondary,
        marginBottom: 4,
        textTransform: "uppercase",
    },
    value: {
        fontSize: 14,
        fontWeight: "bold",
        color: colors.text.primary,
    },
});

interface SummaryStatsBlockProps {
    summary: ReportSummary;
}

export const SummaryStatsBlock: React.FC<SummaryStatsBlockProps> = ({ summary }) => {
    if (!summary) return null;

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.label}>Effectif Total</Text>
                <Text style={styles.value}>{summary.total_users}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.label}>Taux de Présence</Text>
                <Text style={styles.value}>{summary.average_attendance_rate.toFixed(1)}%</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.label}>Total Retards</Text>
                <Text style={[styles.value, { color: summary.total_late_arrivals > 0 ? "#F59E0B" : colors.text.primary }]}>
                    {summary.total_late_arrivals}
                </Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.label}>Total Absences</Text>
                <Text style={[styles.value, { color: summary.total_absences > 0 ? "#EF4444" : colors.text.primary }]}>
                    {summary.total_absences}
                </Text>
            </View>
        </View>
    );
};
