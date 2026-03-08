import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { UserReportData, DailyReportRecord } from "../../../../../services/types/api-types";
import { PdfHeader } from "../core/PdfHeader";
import { PdfFooter } from "../core/PdfFooter";

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: "Helvetica",
        fontSize: 10,
        color: "#333333",
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 20,
        color: "#1a1a1a",
        borderBottomWidth: 1,
        borderBottomColor: "#eeeeee",
        paddingBottom: 4,
    },
    infoPanel: {
        backgroundColor: "#f9fafb",
        padding: 15,
        borderRadius: 4,
        marginBottom: 15,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 15,
        justifyContent: "flex-start",
    },
    infoBlock: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minWidth: "25%",
        marginBottom: 5,
    },
    infoLabel: {
        fontSize: 9,
        color: "#6b7280",
        textTransform: "uppercase",
    },
    infoValue: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#111827",
    },
    statsRow: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        gap: 10,
    },
    statCard: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 4,
        padding: 10,
        textAlign: "center",
    },
    statLabel: {
        fontSize: 8,
        color: "#6b7280",
        textTransform: "uppercase",
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1f2937",
    },
    table: {
        width: "auto",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRightWidth: 0,
        borderBottomWidth: 0,
        display: "flex",
        flexDirection: "column",
    },
    tableRow: {
        margin: "auto",
        flexDirection: "row",
    },
    tableHeader: {
        backgroundColor: "#f3f4f6",
    },
    tableColHeader: {
        width: "16.66%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: "#e5e7eb",
        padding: 5,
    },
    tableCellHeader: {
        fontSize: 9,
        fontWeight: "bold",
        color: "#4b5563",
    },
    tableCol: {
        width: "16.66%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: "#e5e7eb",
        padding: 5,
    },
    tableCell: {
        fontSize: 9,
        color: "#374151"
    },
    badge: {
        padding: "2 4",
        borderRadius: 2,
        fontSize: 8,
    }
});

interface PersonalEmployeeDocProps {
    data: UserReportData;
    period: string;
    companyName?: string;
}

const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const formatTime = (dateString?: string) => {
    if (!dateString) return "--:--";
    const d = new Date(dateString);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export const PersonalEmployeeDoc: React.FC<PersonalEmployeeDocProps> = ({ data, period, companyName = "Biometrie" }) => {
    const meta = {
        companyName,
        reportDate: new Date().toLocaleDateString("fr-FR"),
        reportType: "Rapport Employé",
        period: period,
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <PdfHeader
                    title="Rapport D'Activité Personnalisé"
                    subtitle={`Période: ${period}`}
                    meta={meta}
                />

                <View style={styles.infoPanel}>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>Employé</Text>
                        <Text style={styles.infoValue}>{data.user_name}</Text>
                    </View>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{data.email || "-"}</Text>
                    </View>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>Téléphone</Text>
                        <Text style={styles.infoValue}>{data.phone || "-"}</Text>
                    </View>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>Département</Text>
                        <Text style={styles.infoValue}>{data.department || "-"}</Text>
                    </View>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>Profession</Text>
                        <Text style={styles.infoValue}>{data.profession || "-"}</Text>
                    </View>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>Score Efficacité</Text>
                        <Text style={styles.infoValue}>{data.efficiency_score.toFixed(1)}%</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Heures de Travail</Text>
                        <Text style={styles.statValue}>{data.total_work_hours}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Présences</Text>
                        <Text style={styles.statValue}>{data.present_days} j</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Retards</Text>
                        <Text style={styles.statValue}>{data.late_arrivals} j</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Absences</Text>
                        <Text style={styles.statValue}>{data.absent_days} j</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Bilan Quotidien Détaillé</Text>

                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Date</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Statut</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Entrée</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Sortie</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Durée</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Obs. & Justifs.</Text></View>
                    </View>

                    {data.daily_records?.map((record: DailyReportRecord, i: number) => (
                        <View key={i} style={styles.tableRow} wrap={false}>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{formatDate(record.date)}</Text></View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>
                                    {record.status}
                                </Text>
                            </View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{formatTime(record.check_in)}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{formatTime(record.check_out)}</Text></View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>
                                    {record.work_duration_hours > 0 ? `${Math.floor(record.work_duration_hours)}h${Math.round((record.work_duration_hours % 1) * 60).toString().padStart(2, '0')}` : "-"}
                                </Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>
                                    {record.is_late ? "[Retard] " : ""}
                                    {record.is_early_departure ? "[Départ Ant.] " : ""}
                                    {record.justification ? ` ${record.justification}` : ""}
                                </Text>
                            </View>
                        </View>
                    ))}
                    {(!data.daily_records || data.daily_records.length === 0) && (
                        <View style={styles.tableRow}>
                            <View style={{ width: "100%", padding: 10, borderBottomWidth: 1, borderColor: "#e5e7eb", textAlign: "center" }}>
                                <Text style={styles.tableCell}>Aucune donnée disponible</Text>
                            </View>
                        </View>
                    )}
                </View>

                <PdfFooter meta={meta} />
            </Page>
        </Document>
    );
};
