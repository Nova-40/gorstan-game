/* DEV-ONLY Telemetry Layer */

const telemetryData: Record<string, any[]> = {};

export function track(event: string, payload: any) {
  if (!telemetryData[event]) {
    telemetryData[event] = [];
  }
  telemetryData[event].push({ timestamp: Date.now(), ...payload });
}

export function flush() {
  const csvRows = ["event,timestamp,payload"];
  for (const [event, entries] of Object.entries(telemetryData)) {
    for (const entry of entries) {
      csvRows.push(`${event},${entry.timestamp},${JSON.stringify(entry)}`);
    }
  }
  const csvContent = csvRows.join("\n");
  const fs = require("fs");
  fs.writeFileSync("./docs/gameflow-scorecard.csv", csvContent);
  console.log("Telemetry data flushed to ./docs/gameflow-scorecard.csv");
}

if (process.env.DEV_ONLY) {
  console.log("Telemetry layer active (DEV_ONLY)");
}
