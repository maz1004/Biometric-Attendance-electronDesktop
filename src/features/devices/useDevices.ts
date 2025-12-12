import { useMemo, useState } from "react";
import { Capture, Device, DevicesFilters, QueueFilters } from "./DeviceTypes";

function nowMinus(min: number) {
  const d = new Date(Date.now() - min * 60_000);
  return d.toISOString();
}

const SEED_DEVICES: Device[] = [
  {
    id: "dev-1",
    name: "Front Gate Tablet",
    location: "Main Entrance",
    status: "online",
    lastSyncISO: nowMinus(2),
    ip: "192.168.0.21",
    version: "1.4.0",
  },
  {
    id: "dev-2",
    name: "R&D Floor Kiosk",
    location: "2nd Floor",
    status: "offline",
    lastSyncISO: nowMinus(78),
    ip: "192.168.0.44",
    version: "1.3.7",
  },
  {
    id: "dev-3",
    name: "Warehouse Cam",
    location: "Dock 3",
    status: "error",
    lastSyncISO: nowMinus(15),
    ip: "192.168.0.31",
    version: "1.4.0",
  },
];

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=640&q=60&auto=format&fit=crop";

const SEED_CAPTURES: Capture[] = Array.from({ length: 24 }).map((_, i) => {
  const deviceId = i % 3 === 0 ? "dev-1" : i % 3 === 1 ? "dev-2" : "dev-3";
  const score = +(0.45 + (i % 10) * 0.045).toFixed(2);
  const liveness: Capture["liveness"] =
    i % 5 === 0 ? "fail" : i % 2 === 0 ? "pass" : "unknown";
  return {
    id: `cap-${i + 1}`,
    deviceId,
    tsISO: new Date(Date.now() - i * 5 * 60_000).toISOString(),
    employeeNameGuess:
      i % 4 === 0 ? "User 017" : i % 4 === 1 ? "User 112" : undefined,
    score,
    liveness,
    status: "pending",
    imageUrl: PLACEHOLDER,
  };
});

const INIT_DEV_FILTERS: DevicesFilters = {
  q: "",
  status: "all",
  sort: "lastsync-new",
};
const INIT_Q_FILTERS: QueueFilters = {
  device: "all",
  liveness: "all",
  scoreMin: 0.5,
  status: "pending",
};

export function useDevices() {
  const [devices] = useState<Device[]>(SEED_DEVICES);
  const [captures, setCaptures] = useState<Capture[]>(SEED_CAPTURES);

  const [devFilters, setDevFilters] =
    useState<DevicesFilters>(INIT_DEV_FILTERS);
  const [qFilters, setQFilters] = useState<QueueFilters>(INIT_Q_FILTERS);

  // Devices list
  const filteredDevices = useMemo(() => {
    const rows = devices.filter((d) => {
      if (devFilters.status !== "all" && d.status !== devFilters.status)
        return false;
      if (devFilters.q) {
        const hay = `${d.name} ${d.location ?? ""} ${d.ip ?? ""}`.toLowerCase();
        if (!hay.includes(devFilters.q.toLowerCase())) return false;
      }
      return true;
    });
    switch (devFilters.sort) {
      case "name-az":
        rows.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-za":
        rows.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "lastsync-old":
        rows.sort((a, b) => a.lastSyncISO.localeCompare(b.lastSyncISO));
        break;
      default:
        rows.sort((a, b) => b.lastSyncISO.localeCompare(a.lastSyncISO));
    }
    return rows;
  }, [devices, devFilters]);

  // Validation queue
  const queue = useMemo(() => {
    return captures.filter((c) => {
      if (qFilters.device !== "all" && c.deviceId !== qFilters.device)
        return false;
      if (qFilters.status !== "all" && c.status !== qFilters.status)
        return false;
      if (
        qFilters.liveness !== "all" &&
        (c.liveness ?? "unknown") !== qFilters.liveness
      )
        return false;
      if (typeof c.score === "number" && c.score < qFilters.scoreMin)
        return false;
      return true;
    });
  }, [captures, qFilters]);

  // Static actions (just mutate local state for demo)
  function setCaptureStatus(id: string, status: "accepted" | "rejected") {
    setCaptures((list) =>
      list.map((c) => (c.id === id ? { ...c, status } : c))
    );
  }

  return {
    // state
    devices: filteredDevices,
    allDevices: devices,
    devFilters,
    qFilters,
    queue,
    // actions
    setDevFilters,
    setQFilters,
    setCaptureStatus,
  };
}
