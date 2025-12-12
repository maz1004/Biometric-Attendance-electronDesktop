export type PeriodFilter = "day" | "week" | "month";
export type StatusType = "present" | "absent" | "late" | "left-early" | "manual";

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  fullName: string;
  department: string;
  dateISO: string;      // "2025-11-03"
  checkIn?: string;     // "08:57"
  checkOut?: string;    // "17:02"
  status: StatusType;
  justification?: string;
  deviceId?: string;
};

// Alias for AttendanceRecord
export type AttendanceRow = AttendanceRecord;

// For heatmap
export type DayAgg = {
  dateISO: string;
  presentCount: number;
};

export type SortByOption =
  | "date-desc"
  | "date-asc"
  | "name-asc"
  | "name-desc"
  | "status-asc"
  | "status-desc";
