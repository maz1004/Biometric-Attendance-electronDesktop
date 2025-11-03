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

// ----------------------- PDF (jsPDF + autoTable) -----------------------

/*
  Install once:
    npm i jspdf jspdf-autotable
*/
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportAttendancePDF(args: {
  rows: AttendanceRecord[];
  filename?: string; // default auto
  title?: string; // optional report title
  meta?: Record<string, string>;
}) {
  const { rows, title = "Attendance Report", filename, meta } = args;

  const doc = new jsPDF({ orientation: "landscape", unit: "pt" }); // wide table
  const margin = 36;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, margin, 40);

  // Meta (small key/value block under title)
  if (meta && Object.keys(meta).length) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    let y = 58;
    Object.entries(meta).forEach(([k, v]) => {
      doc.text(`${k}: ${v}`, margin, y);
      y += 14;
    });
  }

  // Table
  const head = [
    [
      "Employee ID",
      "Full name",
      "Department",
      "Date",
      "In",
      "Out",
      "Status",
      "Justification",
      "Device ID",
    ],
  ];

  const body = rows.map((r) => [
    r.employeeId,
    r.fullName,
    r.department,
    r.dateISO,
    r.checkIn ?? "—",
    r.checkOut ?? "—",
    r.status.replace("-", " "),
    r.justification ?? "",
    r.deviceId ?? "",
  ]);

  autoTable(doc, {
    head,
    body,
    startY: 90,
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 6,
      lineColor: [230, 230, 230],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [25, 25, 28],
      textColor: [255, 255, 255],
    },
    alternateRowStyles: { fillColor: [246, 248, 250] },
    margin: { left: margin, right: margin },
    tableWidth: "auto",
    columnStyles: {
      0: { cellWidth: 90 }, // Employee ID
      1: { cellWidth: 150 }, // Full name
      2: { cellWidth: 100 }, // Department
      3: { cellWidth: 80 }, // Date
      4: { cellWidth: 60 }, // In
      5: { cellWidth: 60 }, // Out
      6: { cellWidth: 90 }, // Status
      7: { cellWidth: 180 }, // Justification
      8: { cellWidth: 90 }, // Device ID
    },
  });

  const name =
    filename ?? `attendance_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(name);
}
