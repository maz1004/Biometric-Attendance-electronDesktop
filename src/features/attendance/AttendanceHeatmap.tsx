import styled from "styled-components";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
`;
const Cell = styled.div<{ $level: number }>`
  height: 16px;
  border-radius: 4px;
  background: ${({ $level }) => {
    if ($level <= 0) return "rgba(148,163,184,.18)";
    if ($level === 1) return "rgba(134,239,172,.35)";
    if ($level === 2) return "rgba(52,211,153,.55)";
    return "rgba(16,185,129,.8)";
  }};
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

type DayAgg = { dateISO: string; presentCount: number };
export default function AttendanceHeatmap({ data }: { data: DayAgg[] }) {
  // map to weeks, 7 cols; we'll just paint intensity by presentCount
  const max = Math.max(1, ...data.map((d) => d.presentCount));
  return (
    <Grid>
      {data.map((d) => {
        const norm = Math.ceil((d.presentCount / max) * 3); // 0..3
        return <Cell key={d.dateISO} $level={norm} />;
      })}
    </Grid>
  );
}
