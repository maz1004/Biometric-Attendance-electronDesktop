export type DeviceStatus = "online" | "offline" | "error";

export type Device = {
  id: string;
  name: string;
  location?: string;
  status: DeviceStatus;
  lastSyncISO: string; // ISO datetime
  ip?: string;
  version?: string;
  currentMode?: "recognition" | "enrollment";
  isAuthorized?: boolean;
};

export type CaptureStatus = "pending" | "accepted" | "rejected";

export type Capture = {
  id: string;
  deviceId: string;
  tsISO: string; // ISO datetime
  employeeId?: string; // if the model guessed
  employeeNameGuess?: string;
  score?: number; // model score (0..1)
  liveness?: "pass" | "fail" | "unknown";
  status: CaptureStatus; // pending by default here
  imageUrl: string; // static placeholder
  source: "enrollment" | "attendance";
};

export type DevicesFilters = {
  q: string;
  status: "all" | DeviceStatus;
  sort: "name-az" | "name-za" | "lastsync-new" | "lastsync-old";
};

export type QueueFilters = {
  device: "all" | string;
  liveness: "all" | "pass" | "fail" | "unknown";
  scoreMin: number; // 0..1
  status: "all" | CaptureStatus;
};
