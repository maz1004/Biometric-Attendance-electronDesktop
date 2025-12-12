import styled from "styled-components";
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
    // TODO: Fetch real data
    const data = [
        { label: "Lun", presence: 90, absence: 5, late: 5 },
        { label: "Mar", presence: 95, absence: 2, late: 3 },
        { label: "Mer", presence: 88, absence: 8, late: 4 },
        { label: "Jeu", presence: 92, absence: 4, late: 4 },
        { label: "Ven", presence: 85, absence: 10, late: 5 },
        { label: "Sam", presence: 50, absence: 0, late: 0 },
    ];

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
