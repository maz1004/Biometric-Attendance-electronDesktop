import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from "../../../../../services/types/api-types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    title: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    metaText: {
        fontSize: 10,
        color: '#6b7280',
        marginTop: 4,
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderBottomWidth: 0,
        borderRightWidth: 0,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
        minHeight: 24,
        alignItems: 'center',
    },
    headerRow: {
        backgroundColor: '#f9fafb',
    },
    colHeader: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        color: '#4b5563',
        textTransform: 'uppercase',
    },
    colEmploye: { width: '25%', padding: 5, borderRightWidth: 1, borderColor: '#e5e7eb' },
    colDept: { width: '15%', padding: 5, borderRightWidth: 1, borderColor: '#e5e7eb' },
    colDate: { width: '15%', padding: 5, borderRightWidth: 1, borderColor: '#e5e7eb' },
    colTime: { width: '8%', padding: 5, borderRightWidth: 1, borderColor: '#e5e7eb', textAlign: 'center' },
    colStatus: { width: '15%', padding: 5, borderRightWidth: 1, borderColor: '#e5e7eb', textAlign: 'center' },
    colMethod: { width: '14%', padding: 5, borderRightWidth: 1, borderColor: '#e5e7eb', textAlign: 'center' },
    textMain: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    textSub: {
        fontSize: 8,
        color: '#6b7280',
        marginTop: 2,
    },
    badge: {
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 2,
        fontSize: 8,
        textAlign: 'center',
        fontFamily: 'Helvetica-Bold',
    },
    emptyState: {
        padding: 30,
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 12,
        fontStyle: 'italic',
    }
});

interface AttendanceLogsReportDocProps {
    data: ReportData;
    companyName?: string;
}

export function AttendanceLogsReportDoc({ data, companyName = "Trétec" }: AttendanceLogsReportDocProps) {
    const logs = data.attendance_logs || [];

    const formatTime = (dateString?: string) => {
        if (!dateString) return "-";
        try {
            return format(new Date(dateString), "HH:mm");
        } catch {
            return "-";
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd MMM yyyy", { locale: fr });
        } catch {
            return dateString;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case "present": return { backgroundColor: '#dcfce7', color: '#166534' };
            case "absent": return { backgroundColor: '#fee2e2', color: '#991b1b' };
            case "late": return { backgroundColor: '#fef3c7', color: '#92400e' };
            case "left_early": return { backgroundColor: '#ffedd5', color: '#9a3412' };
            case "manual": return { backgroundColor: '#f3e8ff', color: '#6b21a8' };
            default: return { backgroundColor: '#f3f4f6', color: '#374151' };
        }
    };

    return (
        <Document>
            <Page size="A4" style={styles.page} orientation="landscape">
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Rapport de Présence (Logs Bruts)</Text>
                        <Text style={styles.metaText}>Période: {data.period}</Text>
                        <Text style={styles.metaText}>Généré le: {format(new Date(data.generated_at), "dd/MM/yyyy à HH:mm")}</Text>
                    </View>
                    <View>
                        <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#2563eb' }}>{companyName}</Text>
                    </View>
                </View>

                {logs.length === 0 ? (
                    <Text style={styles.emptyState}>Aucun enregistrement trouvé pour ces critères.</Text>
                ) : (
                    <View style={styles.table}>
                        {/* THEAD */}
                        <View style={[styles.row, styles.headerRow, styles.colHeader]}>
                            <Text style={styles.colEmploye}>Employé</Text>
                            <Text style={styles.colDept}>Département</Text>
                            <Text style={styles.colDate}>Date</Text>
                            <Text style={styles.colTime}>Entrée</Text>
                            <Text style={styles.colTime}>Sortie</Text>
                            <Text style={styles.colStatus}>Statut</Text>
                            <Text style={styles.colMethod}>Méthode</Text>
                        </View>

                        {/* TBODY */}
                        {logs.map((log) => (
                            <View style={styles.row} key={log.id} wrap={false}>
                                <View style={styles.colEmploye}>
                                    <Text style={styles.textMain}>{log.user_name}</Text>
                                    <Text style={styles.textSub}>{log.user_email}</Text>
                                </View>
                                <View style={styles.colDept}>
                                    <Text style={{ fontSize: 9 }}>{log.department || "-"}</Text>
                                </View>
                                <View style={styles.colDate}>
                                    <Text style={{ fontSize: 9 }}>{formatDate(log.date)}</Text>
                                </View>
                                <View style={styles.colTime}>
                                    <Text style={{ fontSize: 9, textAlign: 'center' }}>{formatTime(log.check_in_time)}</Text>
                                </View>
                                <View style={styles.colTime}>
                                    <Text style={{ fontSize: 9, textAlign: 'center' }}>{formatTime(log.check_out_time)}</Text>
                                </View>
                                <View style={styles.colStatus}>
                                    <Text style={[styles.badge, getStatusStyle(log.status)]}>
                                        {log.status.replace("_", " ")}
                                    </Text>
                                </View>
                                <View style={styles.colMethod}>
                                    <Text style={[styles.badge, { backgroundColor: '#f3f4f6', color: '#4b5563', textTransform: 'uppercase' }]}>
                                        {log.method}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    );
}
