import styled from "styled-components";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();
    const { trends, stats } = useDashboard();

    const teamSize = stats?.total_team_size || 1;

    const data = trends?.map((t: any) => {
        const presentCount = t.value || 0;
        const lateCount = t.late || 0;

        const total = teamSize || 1;

        const presencePct = Math.round((presentCount / total) * 100);
        const latePct = Math.round((lateCount / total) * 100);

        return {
            label: t.day,
            presence: presencePct,
            late: latePct,
        };
    }) || [];

    const isDarkMode = false;
    const colors = isDarkMode
        ? {
            presence: { stroke: "#4f46e5", fill: "#4f46e5" },
            late: { stroke: "#eab308", fill: "#eab308" },
            text: "#e5e7eb",
            background: "#18212f",
        }
        : {
            presence: { stroke: "#4f46e5", fill: "#c7d2fe" },
            late: { stroke: "#eab308", fill: "#fef08a" },
            text: "#374151",
            background: "#fff",
        };

    return (
        <StyledChart>
            <ChartTitle>{t("dashboard.chart.title")}</ChartTitle>
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
                        name={t("dashboard.chart.presence")}
                        unit="%"
                    />
                    <Area
                        dataKey="late"
                        type="monotone"
                        stroke={colors.late.stroke}
                        fill={colors.late.fill}
                        strokeWidth={2}
                        name={t("dashboard.chart.late")}
                        unit="%"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </StyledChart>
    );
}

export default AttendanceChart;
