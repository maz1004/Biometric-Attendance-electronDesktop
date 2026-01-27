// src/features/attendance/exportAttendance.ts
import { AttendanceRecord } from "./AttendanceTypes";

/** Safe CSV field (escape quotes + wrap if needed) */
function csvField(v: unknown): string {
  if (v === undefined || v === null) return "";
  const s = String(v);
  const needsWrap = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsWrap ? `"${escaped}"` : escaped;
}

function buildCsv(rows: AttendanceRecord[], meta?: Record<string, string>) {
  const header = [
    "Employee ID",
    "Full name",
    "Department",
    "Date",
    "Check-in",
    "Check-out",
    "Status",
    "Justification",
    "Device ID",
  ];

  const lines: string[] = [];
  if (meta && Object.keys(meta).length) {
    // Top metadata block (key,value)
    lines.push("Report metadata");
    lines.push(
      ...Object.entries(meta).map(([k, v]) => `${csvField(k)},${csvField(v)}`)
    );
    lines.push(""); // empty line
  }

  lines.push(header.map(csvField).join(","));

  for (const r of rows) {
    lines.push(
      [
        r.employeeId,
        r.fullName,
        r.department,
        r.dateISO,
        r.checkIn ?? "",
        r.checkOut ?? "",
        r.status,
        r.justification ?? "",
        r.deviceId ?? "",
      ]
        .map(csvField)
        .join(",")
    );
  }

  return lines.join("\n");
}

/** Triggers a file download from the renderer (works in Electron too) */
function saveBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportAttendanceCSV(args: {
  rows: AttendanceRecord[];
  filename?: string; // default auto
  meta?: Record<string, string>;
}) {
  const { rows, filename, meta } = args;
  const csv = buildCsv(rows, meta);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const name =
    filename ?? `attendance_${new Date().toISOString().slice(0, 10)}.csv`;
  saveBlob(blob, name);
}

