export type TelemetryLevel = "info" | "warn" | "error";

export type TelemetryPayload = {
  event: string;
  level: TelemetryLevel;
  meta: Record<string, unknown>;
};

function debugTelemetryEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEBUG_TELEMETRY === "1";
}

export function logTelemetry(
  payload: TelemetryPayload,
  options?: { verbose?: boolean }
): void {
  if (options?.verbose && !debugTelemetryEnabled()) {
    return;
  }

  if (payload.level === "error") {
    console.error(payload.event, payload.meta);
    return;
  }

  if (payload.level === "warn") {
    console.warn(payload.event, payload.meta);
    return;
  }

  console.info(payload.event, payload.meta);
}
