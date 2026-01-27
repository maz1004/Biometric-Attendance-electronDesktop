import styled from "styled-components";
import { useDashboard } from "./useDashboard";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const StyledChart = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem 3.2rem;
  grid-column: 1 / -1;

  & .recharts-cartesian-grid-horizontal line,
  & .recharts-cartesian-grid-vertical line {
    stroke: var(--color-grey-300);
  }
`;

const ChartTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2.4rem;
  color: var(--color-grey-800);
`;

function AttendanceChart() {
    const { trends, stats } = useDashboard();

    const teamSize = stats?.total_team_size || 1; // Avoid division by zero, but don't mock 50

    const data = trends?.map((t: any) => {
        // t has value (present), late, absent (counts)
        // We want to display percentages relative to teamSize
        // Note: t.value (Present) includes Late in some definitions? 
        // Backend: Value = DailyStats (Total Checkins). Late = DailyLateStats. 
        // Typically Present includes Late.
        // So Punctual = Present - Late.
        // Stacked Chart: Punctual + Late + Absent = 100%?
        // Current Chart areas: Presence, Late. 
        // If not stacked, we just show Punctual Rate and Late Rate?
        // Let's assume Present = Punctual + Late.

        const presentCount = t.value || 0;
        const lateCount = t.late || 0;
        const absentCount = t.absent || (teamSize - presentCount); // Fallback if backend absent is 0

        const total = teamSize || (presentCount + absentCount) || 1;

        const presencePct = Math.round((presentCount / total) * 100);
        const latePct = Math.round((lateCount / total) * 100);
        const absencePct = 100 - presencePct; // Simplified

        // For Area chart, validation usually expects:
        // Presence (Total Present) = Punctual + Late
        // Or separate? 
        // The Chart has separate "presence" and "late".
        // Let's pass them as is.

        return {
            label: t.day,
            presence: presencePct, // This is total presence %
            late: latePct,         // This is late %
            absence: absencePct
        };
    }) || [];

    const isDarkMode = false; // TODO: Get from context
    const colors = isDarkMode
        ? {
            presence: { stroke: "#4f46e5", fill: "#4f46e5" },
            absence: { stroke: "#ef4444", fill: "#ef4444" },
            late: { stroke: "#eab308", fill: "#eab308" },
            text: "#e5e7eb",
            background: "#18212f",
        }
        : {
            presence: { stroke: "#4f46e5", fill: "#c7d2fe" },
            absence: { stroke: "#ef4444", fill: "#fecaca" },
            late: { stroke: "#eab308", fill: "#fef08a" },
            text: "#374151",
            background: "#fff",
        };

    return (
        <StyledChart>
            <ChartTitle>Ponctualité de la semaine</ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <XAxis
                        dataKey="label"
                        tick={{ fill: colors.text }}
                        tickLine={{ stroke: colors.text }}
                    />
                    <YAxis
                        unit="%"
                        tick={{ fill: colors.text }}
                        tickLine={{ stroke: colors.text }}
                    />
                    <CartesianGrid strokeDasharray="4" />
                    <Tooltip contentStyle={{ backgroundColor: colors.background }} />
                    <Area
                        dataKey="presence"
                        type="monotone"
                        stroke={colors.presence.stroke}
                        fill={colors.presence.fill}
                        strokeWidth={2}
                        name="Présence"
                        unit="%"
                    />
                    <Area
                        dataKey="late"
                        type="monotone"
                        stroke={colors.late.stroke}
                        fill={colors.late.fill}
                        strokeWidth={2}
                        name="Retard"
                        unit="%"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </StyledChart>
    );
}

export default AttendanceChart;
