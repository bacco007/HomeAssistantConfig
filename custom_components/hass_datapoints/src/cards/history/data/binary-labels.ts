/**
 * Returns the human-readable "on" label for a binary sensor device class.
 * Pass the lower-cased `device_class` attribute value.
 */
export function binaryOnLabel(deviceClass: string): string {
  const labels: RecordWithStringValues = {
    battery: "low",
    battery_charging: "charging",
    carbon_monoxide: "detected",
    cold: "cold",
    connectivity: "connected",
    door: "open",
    garage_door: "open",
    gas: "detected",
    heat: "hot",
    lock: "unlocked",
    moisture: "wet",
    motion: "motion",
    moving: "moving",
    occupancy: "occupied",
    opening: "open",
    plug: "plugged in",
    power: "power",
    presence: "present",
    problem: "problem",
    running: "running",
    safety: "unsafe",
    smoke: "smoke",
    sound: "sound",
    tamper: "tampered",
    update: "update available",
    vibration: "vibration",
    window: "open",
  };
  return labels[deviceClass] || "on";
}

/**
 * Returns the human-readable "off" label for a binary sensor device class.
 * Pass the lower-cased `device_class` attribute value.
 */
export function binaryOffLabel(deviceClass: string): string {
  const labels: RecordWithStringValues = {
    battery: "normal",
    battery_charging: "not charging",
    carbon_monoxide: "clear",
    cold: "normal",
    connectivity: "disconnected",
    door: "closed",
    garage_door: "closed",
    gas: "clear",
    heat: "normal",
    lock: "locked",
    moisture: "dry",
    motion: "clear",
    moving: "still",
    occupancy: "clear",
    opening: "closed",
    plug: "unplugged",
    power: "off",
    presence: "away",
    problem: "ok",
    running: "idle",
    safety: "safe",
    smoke: "clear",
    sound: "quiet",
    tamper: "clear",
    update: "up to date",
    vibration: "still",
    window: "closed",
  };
  return labels[deviceClass] || "off";
}
