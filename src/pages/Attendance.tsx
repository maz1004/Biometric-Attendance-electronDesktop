import styled from "styled-components";
import { useAttendance } from "../features/attendance/useAttendance";
import AttendanceHeaderBar from "../features/attendance/AttendanceHeaderBar";
import AttendanceTable from "../features/attendance/AttendanceTable";
import Button from "../ui/Button";
import AttendanceHeatmap from "../features/attendance/AttendanceHeatmap";
import {
  exportAttendanceCSV,
  exportAttendancePDF,
} from "../features/attendance/exportAttendance";
const Section = styled.section`
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 2rem;
  display: grid;
  gap: 1.6rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-text-strong);
`;

const Sub = styled.div`
  font-size: 1.3rem;
  color: var(--color-text-dim);
`;

const Head = styled.div`
  display: grid;
  gap: 0.4rem;
`;

const Aside = styled.div`
  display: grid;
  gap: 0.8rem;
  padding: 1rem;
  border: 1px dashed var(--color-toolbar-input-border);
  border-radius: var(--border-radius-md);
`;

export default function Attendance(): JSX.Element {
  const at = useAttendance();

  // simple day aggregations for heatmap (present count only)
  const dayAgg = Array.from(new Set(at.list.map((r) => r.dateISO))).map(
    (dateISO) => ({
      dateISO,
      presentCount: at.list.filter(
        (r) => r.dateISO === dateISO && r.status === "present"
      ).length,
    })
  );

  return (
    <Section>
      <Head>
        <Title>Attendance</Title>
        <Sub>
          Presence, lateness, absences — filter by day/week/month and validate
          anomalies.
        </Sub>
      </Head>

      <AttendanceHeaderBar
        search={at.search}
        onSearch={at.setSearch}
        period={at.period}
        onPeriod={at.setPeriod}
        sortBy={at.sortBy}
        onSort={at.setSortBy}
        page={at.page}
        totalPages={at.totalPages}
        onPrev={at.gotoPrev}
        onNext={at.gotoNext}
        department={at.department}
        status={at.status}
        onFiltersApply={({ department, status }) => {
          at.setDepartment(department);
          at.setStatus(status);
        }}
      />

      <AttendanceTable rows={at.list} />

      <Aside>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 600 }}>Monthly heatmap (present only)</div>
          <div style={{ display: "flex", gap: ".6rem" }}>
            <Button
              size="small"
              variation="secondary"
              onClick={() =>
                exportAttendanceCSV({
                  rows: at.allInWindow, // export all filtered rows
                  meta: {
                    Period: at.period.toUpperCase(),
                    Window: `${at.windowStart
                      .toISOString()
                      .slice(0, 10)} → ${at.windowEnd
                      .toISOString()
                      .slice(0, 10)}`,
                    Department: at.department,
                    Status: String(at.status),
                    Generated: new Date().toLocaleString(),
                  },
                })
              }
            >
              Export CSV
            </Button>

            <Button
              size="small"
              variation="secondary"
              onClick={() =>
                exportAttendancePDF({
                  rows: at.allInWindow,
                  title: "Attendance Report",
                  meta: {
                    Period: at.period.toUpperCase(),
                    Window: `${at.windowStart
                      .toISOString()
                      .slice(0, 10)} → ${at.windowEnd
                      .toISOString()
                      .slice(0, 10)}`,
                    Department: at.department,
                    Status: String(at.status),
                    Generated: new Date().toLocaleString(),
                  },
                })
              }
            >
              Export PDF
            </Button>
          </div>
        </div>

        <AttendanceHeatmap data={dayAgg} />
      </Aside>
    </Section>
  );
}
