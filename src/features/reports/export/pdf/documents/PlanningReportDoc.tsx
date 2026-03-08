import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { ReportData, DailyReportRecord } from "../../../../../services/types/api-types";

// Register fonts if needed
// Font.register({ family: 'Inter', src: '/fonts/Inter-Regular.ttf' });

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
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        color: '#1a1a1a',
    },
    metaText: {
        fontSize: 9,
        color: '#666',
        marginTop: 4,
    },
    chunkContainer: {
        marginBottom: 20,
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
        alignItems: 'stretch',
    },
    headerRow: {
        backgroundColor: '#f9fafb',
        fontFamily: 'Helvetica-Bold',
    },
    cellLabel: {
        width: '16%', // Empl Name & Dept col
        borderRightWidth: 1,
        borderColor: '#e5e7eb',
        padding: 4,
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
    },
    cellDay: {
        width: '12%', // 7 days * 12% = 84% + 16% = 100%
        borderRightWidth: 1,
        borderColor: '#e5e7eb',
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textMain: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
    },
    textSub: {
        fontSize: 7,
        color: '#6b7280',
        marginTop: 2,
    },
    shiftBadge: {
        backgroundColor: '#eff6ff', // light blue
        color: '#1d4ed8',
        padding: 3,
        borderRadius: 2,
        textAlign: 'center',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    shiftBadgeInnerTitle: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 2
    },
    shiftEmpty: {
        color: '#9ca3af',
        textAlign: 'center',
        fontSize: 7,
    }
});

function parsePeriodToDates(period: string): { start: Date, end: Date } {
    let dates = period.includes(' → ') ? period.split(' → ') : period.split(' - ');
    const start = new Date(dates[0] ? dates[0].trim() : new Date().toISOString().slice(0, 10));
    const end = new Date(dates[1] ? dates[1].trim() : start);
    return { start, end };
}

function getDaysArray(start: Date, end: Date): Date[] {
    const arr = [];
    let dt = new Date(start);
    while (dt <= end) {
        arr.push(new Date(dt));
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
    );
}

function formatDateHeader(d: Date): string {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${days[d.getDay()]} ${da}/${mo}`;
}

function formatTimeRange(checkIn?: string, checkOut?: string): string {
    if (!checkIn || !checkOut) return "";
    const inTime = checkIn.includes("T") ? checkIn.split("T")[1].substring(0, 5) : "";
    const outTime = checkOut.includes("T") ? checkOut.split("T")[1].substring(0, 5) : "";
    if (inTime && outTime) return `${inTime} - ${outTime}`;
    return "";
}

function normalizeDateStr(d: Date | string): string {
    if (typeof d === 'string') return d.slice(0, 10);
    return d.toISOString().slice(0, 10);
}

interface PlanningReportDocProps {
    data: ReportData;
    companyName: string;
}

export function PlanningReportDoc({ data, companyName }: PlanningReportDocProps) {
    const { start, end } = parsePeriodToDates(data.period);
    const allDays = getDaysArray(start, end);
    const dayChunks = chunkArray(allDays, 7);

    const recordMap: Record<string, Record<string, DailyReportRecord>> = {};
    if (data.users) {
        data.users.forEach(user => {
            recordMap[user.user_id] = {};
            if (user.daily_records) {
                user.daily_records.forEach(rec => {
                    const dStr = normalizeDateStr(rec.date);
                    recordMap[user.user_id][dStr] = rec;
                });
            }
        });
    }

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.header} fixed>
                    <View>
                        <Text style={styles.title}>{companyName}</Text>
                        <Text style={styles.metaText}>Rapport Planning</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.metaText}>Période: {start.toLocaleDateString("fr-FR")} - {end.toLocaleDateString("fr-FR")}</Text>
                        <Text style={styles.metaText}>Généré le: {new Date(data.generated_at).toLocaleString('fr-FR')}</Text>
                    </View>
                </View>

                {dayChunks.map((chunk, chunkIdx) => (
                    <View key={chunkIdx} style={styles.chunkContainer} wrap={false}>
                        <View style={styles.table}>
                            {/* Header Row */}
                            <View style={[styles.row, styles.headerRow]}>
                                <View style={styles.cellLabel}>
                                    <Text style={styles.textMain}>Employé</Text>
                                </View>
                                {chunk.map(d => (
                                    <View key={d.toISOString()} style={styles.cellDay}>
                                        <Text style={styles.textMain}>{formatDateHeader(d)}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Data Rows */}
                            {data.users?.map(user => (
                                <View key={user.user_id} style={styles.row}>
                                    <View style={styles.cellLabel}>
                                        <Text style={styles.textMain}>{user.user_name}</Text>
                                        <Text style={styles.textSub}>{user.department !== 'all' ? user.department : 'Non assigné'}</Text>
                                    </View>
                                    {chunk.map(d => {
                                        const dStr = normalizeDateStr(d);
                                        const rec = recordMap[user.user_id]?.[dStr];
                                        return (
                                            <View key={dStr} style={styles.cellDay}>
                                                {rec ? (
                                                    <View style={styles.shiftBadge}>
                                                        <Text style={styles.shiftBadgeInnerTitle}>{rec.status}</Text>
                                                        {rec.check_in && rec.check_out ? (
                                                            <Text style={{ fontSize: 7, opacity: 0.8 }}>{formatTimeRange(rec.check_in, rec.check_out)}</Text>
                                                        ) : rec.work_duration_hours > 0 ? (
                                                            <Text style={{ fontSize: 7, opacity: 0.8 }}>({rec.work_duration_hours}h)</Text>
                                                        ) : null}
                                                    </View>
                                                ) : (
                                                    <Text style={styles.shiftEmpty}>Repos</Text>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </Page>
        </Document>
    );
}
