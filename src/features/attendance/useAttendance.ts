import { useMemo, useState } from "react";
import {
  AttendanceRecord,
  PeriodFilter,
  SortByOption,
  StatusType,
} from "./AttendanceTypes";

const NAMES = [
  ["Cherrati", "Nour El Houda"],
  ["Bouzaghti", "Dounia Malak"],
  ["Benyamina", "Yacine"],
  ["Bensaid", "Merouane"],
  ["Aimeur", "Zahra"],
  ["Saidani", "Khaled"],
  ["Kadi", "Hiba"],
];
const DEPTS = ["R&D", "Operations", "Design", "QA", "HR"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function makeFakeRow(d: Date, idx: number): AttendanceRecord {
  const [ln, fn] = NAMES[idx % NAMES.length];
  const statusPool: StatusType[] = ["present", "late", "absent", "left-early"];
  const status = statusPool[(idx + d.getDate()) % statusPool.length];
  const dateISO = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}`;

  let checkIn: string | undefined;
  let checkOut: string | undefined;
  if (status !== "absent") {
    const inH = status === "late" ? 9 + (idx % 3) : 8 + (idx % 2);
    const outH = status === "left-early" ? 16 : 17;
    checkIn = `${pad(inH)}:${pad((idx * 7) % 60)}`;
    checkOut = `${pad(outH)}:${pad((idx * 11) % 60)}`;
  }
  return {
    id: `att-${dateISO}-${idx}`,
    employeeId: `emp-${(idx % 40) + 1}`,
    fullName: `${fn} ${ln}`,
    department: DEPTS[idx % DEPTS.length],
    dateISO,
    checkIn,
    checkOut,
    status,
    deviceId: `DEV-${(idx % 3) + 1}`,
  };
}

function dateRange(
  period: PeriodFilter,
  anchor: Date
): { start: Date; end: Date } {
  const d = new Date(anchor);
  if (period === "day") {
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    return { start, end };
  }
  if (period === "week") {
    const day = d.getDay() || 7; // Monday=1..Sunday=7
    const start = new Date(d);
    start.setDate(d.getDate() - (day - 1));
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return { start, end };
  }
  // month
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return { start, end };
}

function formatISO(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

export function useAttendance() {
  // state
  const [period, setPeriod] = useState<PeriodFilter>("day");
  const [anchor, setAnchor] = useState<Date>(new Date()); // current day/week/month anchor
  const [search, setSearch] = useState<string>("");
  const [department, setDepartment] = useState<string>("all");
  const [status, setStatus] = useState<StatusType | "all">("all");
  const [sortBy, setSortBy] = useState<SortByOption>("date-desc");
  const [page, setPage] = useState<number>(1);

  // fake data for current month (enough to paginate)
  const FAKE = useMemo(() => {
    const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
    const rows: AttendanceRecord[] = [];
    let idx = 0;
    for (
      let d = new Date(monthStart);
      d < monthEnd;
      d.setDate(d.getDate() + 1)
    ) {
      for (let i = 0; i < 30; i++) rows.push(makeFakeRow(new Date(d), idx++));
    }
    return rows;
  }, [anchor]);

  // filter by selected period window
  const { start, end } = useMemo(
    () => dateRange(period, anchor),
    [period, anchor]
  );
  const filtered = useMemo(() => {
    const sISO = formatISO(start);
    const eISO = formatISO(new Date(end.getTime() - 1)); // inclusive end day
    return FAKE.filter((r) => r.dateISO >= sISO && r.dateISO <= eISO)
      .filter((r) =>
        !search
          ? true
          : r.fullName.toLowerCase().includes(search.toLowerCase()) ||
            r.employeeId.toLowerCase().includes(search.toLowerCase()) ||
            r.department.toLowerCase().includes(search.toLowerCase())
      )
      .filter((r) =>
        department === "all" ? true : r.department === department
      )
      .filter((r) => (status === "all" ? true : r.status === status));
  }, [FAKE, start, end, search, department, status]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return a.dateISO < b.dateISO ? 1 : -1;
        case "date-asc":
          return a.dateISO > b.dateISO ? 1 : -1;
        case "name-asc":
          return a.fullName.localeCompare(b.fullName);
        case "name-desc":
          return b.fullName.localeCompare(a.fullName);
        case "status-asc":
          return a.status.localeCompare(b.status);
        case "status-desc":
          return b.status.localeCompare(a.status);
      }
    });
    return arr;
  }, [filtered, sortBy]);

  // pagination
  const PAGE_SIZE = 12;
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function gotoPrev() {
    setPage((p) => Math.max(1, p - 1));
  }
  function gotoNext() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  return {
    list: current, // current page
    allInWindow: sorted, // <-- add this
    total,
    page,
    totalPages,
    gotoPrev,
    gotoNext,
    period,
    setPeriod,
    anchor,
    setAnchor,
    search,
    setSearch,
    department,
    setDepartment,
    status,
    setStatus,
    sortBy,
    setSortBy,
    windowStart: start,
    windowEnd: end,
  };
}
