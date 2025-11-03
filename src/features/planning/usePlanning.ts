import { useMemo, useState } from "react";
import {
  DayKey,
  EmployeeMini,
  PlanningState,
  Shift,
  Team,
  WeekKey,
} from "./PlanningTypes";

/* ---------- utils ---------- */
function mondayOf(d: Date) {
  const day = (d.getDay() || 7) - 1; // Mon=0..Sun=6
  const m = new Date(d);
  m.setDate(d.getDate() - day);
  m.setHours(0, 0, 0, 0);
  return m;
}
function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function uid(p: string) {
  return `${p}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ---------- seed 500 employees ---------- */
function makeEmployees(n = 500): Record<string, EmployeeMini> {
  const depts = ["R&D", "Operations", "Design", "QA", "HR", "Support", "Sales"];
  const out: Record<string, EmployeeMini> = {};
  for (let i = 1; i <= n; i++) {
    const id = `emp-${i}`;
    out[id] = {
      id,
      name: `User ${String(i).padStart(3, "0")}`,
      department: depts[i % depts.length],
    };
  }
  return out;
}

/* ---------- initial state ---------- */
const INIT: PlanningState = {
  week: iso(mondayOf(new Date())) as WeekKey,
  employees: makeEmployees(500),
  teams: {
    "team-alpha": {
      id: "team-alpha",
      name: "Alpha",
      memberIds: ["emp-1", "emp-2", "emp-3", "emp-4"],
    },
    "team-beta": {
      id: "team-beta",
      name: "Beta",
      memberIds: ["emp-5", "emp-6", "emp-7"],
    },
  },
  shifts: {
    "shift-1": {
      id: "shift-1",
      name: "Morning",
      start: "08:00",
      end: "16:00",
      daysActive: [0, 1, 2, 3, 4],
      teamIds: ["team-alpha"],
      extraMemberIds: [],
    },
    "shift-2": {
      id: "shift-2",
      name: "Evening",
      start: "12:00",
      end: "20:00",
      daysActive: [0, 1, 2, 3, 4],
      teamIds: ["team-beta"],
      extraMemberIds: ["emp-10"],
    },
  },
};

export function usePlanning() {
  const [state, setState] = useState<PlanningState>(INIT);

  /* ===== week nav ===== */
  function setWeek(newWeek: WeekKey) {
    setState((s) => ({ ...s, week: newWeek }));
  }
  function gotoPrevWeek() {
    const d = new Date(state.week);
    d.setDate(d.getDate() - 7);
    setWeek(iso(d) as WeekKey);
  }
  function gotoNextWeek() {
    const d = new Date(state.week);
    d.setDate(d.getDate() + 7);
    setWeek(iso(d) as WeekKey);
  }
  function copyWeekForward() {
    gotoNextWeek();
  }

  /* ===== TEAMS CRUD ===== */
  function createTeam(input: Omit<Team, "id">) {
    const id = uid("team");
    const t: Team = {
      id,
      name: input.name,
      memberIds: [...new Set(input.memberIds)],
    };
    setState((s) => ({ ...s, teams: { ...s.teams, [id]: t } }));
    return id;
  }
  function updateTeam(input: Team) {
    setState((s) => ({
      ...s,
      teams: {
        ...s.teams,
        [input.id]: { ...input, memberIds: [...new Set(input.memberIds)] },
      },
    }));
  }
  function deleteTeam(id: string) {
    setState((s) => {
      const nextTeams = { ...s.teams };
      delete nextTeams[id];
      const nextShifts: Record<string, Shift> = {};
      Object.values(s.shifts).forEach((sh) => {
        nextShifts[sh.id] = {
          ...sh,
          teamIds: sh.teamIds.filter((tid) => tid !== id),
        };
      });
      return { ...s, teams: nextTeams, shifts: nextShifts };
    });
  }

  /* ===== SHIFTS CRUD ===== */
  function createShift(input: Omit<Shift, "id">) {
    const id = uid("shift");
    const sh: Shift = {
      id,
      name: input.name,
      start: input.start,
      end: input.end,
      daysActive: [...input.daysActive].sort(),
      teamIds: [...new Set(input.teamIds)],
      extraMemberIds: [...new Set(input.extraMemberIds)],
    };
    setState((s) => ({ ...s, shifts: { ...s.shifts, [id]: sh } }));
    return id;
  }
  function updateShift(input: Shift) {
    setState((s) => ({
      ...s,
      shifts: {
        ...s.shifts,
        [input.id]: {
          ...input,
          daysActive: [...input.daysActive].sort(),
          teamIds: [...new Set(input.teamIds)],
          extraMemberIds: [...new Set(input.extraMemberIds)],
        },
      },
    }));
  }
  function duplicateShift(id: string) {
    const sh = state.shifts[id];
    if (!sh) return;
    createShift({ ...sh, name: `${sh.name} (copy)` });
  }
  function deleteShift(id: string) {
    setState((s) => {
      const next = { ...s.shifts };
      delete next[id];
      return { ...s, shifts: next };
    });
  }

  /* ===== helpers ===== */
  const employees = state.employees;
  const teams = state.teams;
  const shifts = state.shifts;

  // For counts / grid rendering we don’t expand all names. We compute counts per cell.
  function expandShiftMembers(sh: Shift): string[] {
    const fromTeams = sh.teamIds.flatMap((tid) => teams[tid]?.memberIds ?? []);
    return [...new Set([...fromTeams, ...sh.extraMemberIds])];
  }

  // Conflicts: employee in more than one active shift in same day.
  const dayConflicts = useMemo(() => {
    const conflicts: Record<DayKey, Set<string>> = {
      0: new Set(),
      1: new Set(),
      2: new Set(),
      3: new Set(),
      4: new Set(),
      5: new Set(),
      6: new Set(),
    };
    const arr = Object.values(shifts);
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const a = arr[i],
          b = arr[j];
        const overlapDays = a.daysActive.filter((d) =>
          b.daysActive.includes(d)
        ) as DayKey[];
        if (!overlapDays.length) continue;
        const empsA = expandShiftMembers(a);
        const both = empsA.filter((eid) => expandShiftMembers(b).includes(eid));
        if (!both.length) continue;
        overlapDays.forEach((d) =>
          both.forEach((eid) => conflicts[d].add(eid))
        );
      }
    }
    return conflicts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shifts, teams]); // employees not needed for conflicts

  return {
    state,
    employees,
    teams,
    shifts,
    // week
    setWeek,
    gotoPrevWeek,
    gotoNextWeek,
    copyWeekForward,
    // teams
    createTeam,
    updateTeam,
    deleteTeam,
    // shifts
    createShift,
    updateShift,
    duplicateShift,
    deleteShift,
    // helpers
    expandShiftMembers,
    dayConflicts,
  };
}
