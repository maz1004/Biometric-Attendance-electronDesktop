import { useMemo, useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { validateAnomaly, getAttendance } from "../../services/attendance";
import toast from "react-hot-toast";
import {
  AttendanceRecord,
  PeriodFilter,
  SortByOption,
  StatusType,
} from "./AttendanceTypes";

function pad(n: number) {
  return String(n).padStart(2, "0");
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
    // Rolling 7 days (including today)
    // Start = Today - 6 days
    const start = new Date(d);
    start.setDate(d.getDate() - 6);
    const end = new Date(d);
    end.setDate(d.getDate() + 1); // End is exclusive in backend logic usually, or inclusive? 
    // Backend uses BETWEEN start AND end. 
    // If we want [Today-6, Today], we usually set end to Tomorrow start?
    // Let's look at "day" logic: start=d, end=d+1.
    // So for week: start=d-6, end=d+1.
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

export function useValidateAnomaly() {
  const queryClient = useQueryClient();

  const { mutate: validate, isPending: isValidating } = useMutation({
    mutationFn: ({ id, validated, justification }: { id: string; validated: boolean; justification?: string }) =>
      validateAnomaly(id, validated, justification),
    onSuccess: () => {
      toast.success("Anomaly validated successfully");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err) => {
      toast.error("Failed to validate anomaly");
      console.error(err);
    },
  });

  return { validate, isValidating };
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

  // Calculate date window
  const { start, end } = useMemo(
    () => dateRange(period, anchor),
    [period, anchor]
  );

  // Query
  const { isLoading, data, error } = useQuery({
    queryKey: ["attendance", period, anchor, search, department, status, sortBy, page],
    queryFn: () =>
      getAttendance({
        page,
        limit: 12,
        search,
        department: department === "all" ? undefined : department,
        status: status === "all" ? undefined : status as any,
        sortBy,
        startDate: formatISO(start),
        endDate: formatISO(new Date(end.getTime() - 1)),
      }),
  });

  const rawList = data?.data?.data || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / 12) || 1;

  // Transform to local type
  const list: AttendanceRecord[] = rawList.map((r: any) => ({
    id: r.id,
    employeeId: r.user_id,
    fullName: r.user_name || r.user_id, // Backend should provide user_name ideally
    department: r.department || "General",
    dateISO: (r.timestamp || "").split('T')[0],
    checkIn: (r.type === 'entry' || r.type === 'check_in') && r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
    checkOut: (r.type === 'exit' || r.type === 'check_out') && r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
    status: r.status as StatusType,
    justification: r.notes,
    deviceId: r.location
  }));

  function gotoPrev() {
    setPage((p) => Math.max(1, p - 1));
  }
  function gotoNext() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  return {
    list,
    allInWindow: list, // For now, export current page. Ideally export endpoint handles filtering.
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
    isLoading,
    error,
  };
}
