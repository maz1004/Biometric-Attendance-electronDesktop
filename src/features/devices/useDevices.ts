import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Capture, Device as UIDevice, DevicesFilters, QueueFilters } from "./DeviceTypes";
import {
  getDevices,
  getPendingEnrollments,
  validateEnrollment,
  Device as APIDevice
} from "../../services/apiDevices";


const PLACEHOLDER =
  "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=640&q=60&auto=format&fit=crop";

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
  const queryClient = useQueryClient();
  const [devFilters, setDevFilters] = useState<DevicesFilters>(INIT_DEV_FILTERS);
  const [qFilters, setQFilters] = useState<QueueFilters>(INIT_Q_FILTERS);

  // 1. Fetch Devices
  const { data: apiDevices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const res = await getDevices();
      // Backend returns { success: true, data: { devices: [...], count: X } }
      return (res.data as any)?.devices || [];
    },
    // Refresh every 30s
    refetchInterval: 30000,
  });

  // Map APIDevice to UIDevice
  const devices: UIDevice[] = useMemo(() => {
    return Array.isArray(apiDevices) ? apiDevices.map((d: APIDevice) => ({
      id: d.device_id,
      name: d.device_name,
      location: d.location || "Unknown Location",
      status: d.is_active ? "online" : "offline",
      lastSyncISO: d.last_seen || new Date().toISOString(),
      ip: d.ip_address,
      version: "1.0.0" // Not currently returned by GetConnectedDevices
    })) : [];
  }, [apiDevices]);

  // 2. Fetch Enrollments (Queue)
  const { data: apiEnrollments = [] } = useQuery({
    queryKey: ['enrollments', 'pending'],
    queryFn: async () => {
      const res = await getPendingEnrollments();
      // Backend returns { success: true, data: { enrollments: [...], count: X } }
      return (res.data as any)?.enrollments || [];
    },
    refetchInterval: 15000,
  });

  // Map PendingEnrollment to Capture
  const captures: Capture[] = useMemo(() => {
    return Array.isArray(apiEnrollments) ? apiEnrollments.map((e: any) => ({
      id: e.id,
      deviceId: e.device_id || "unknown",
      tsISO: e.created_at,
      employeeNameGuess: e.user_name || "Unknown User",
      score: e.quality_score || 1.0,
      liveness: "pass", // Assume pass for manual enrollment
      status: e.status || "pending",
      imageUrl: e.face_image || PLACEHOLDER
    })) : [];
  }, [apiEnrollments]);

  // Devices list filtering
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

  // Validation queue filtering
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

  // Mutations
  const { mutate: validateMutation } = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      validateEnrollment(id, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    }
  });

  function setCaptureStatus(id: string, status: "accepted" | "rejected") {
    // Optimistic update could be done here, but simple invalidate is safer for now
    validateMutation({ id, approved: status === "accepted" });
  }

  // TODO: Add activate/deactivate mutations if UI supports it

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
