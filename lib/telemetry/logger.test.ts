import { logTelemetry } from "./logger";

describe("telemetry logger", () => {
  const originalDebugEnv = process.env.NEXT_PUBLIC_DEBUG_TELEMETRY;

  beforeEach(() => {
    jest.spyOn(console, "info").mockImplementation(() => undefined);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    delete process.env.NEXT_PUBLIC_DEBUG_TELEMETRY;
  });

  afterEach(() => {
    (console.info as jest.Mock).mockRestore();
    (console.warn as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
    process.env.NEXT_PUBLIC_DEBUG_TELEMETRY = originalDebugEnv;
  });

  it("should suppress verbose logs when debug env is disabled", () => {
    logTelemetry(
      {
        event: "medals_fetch_attempt",
        level: "info",
        meta: { source: "page" },
      },
      { verbose: true }
    );

    expect(console.info).not.toHaveBeenCalled();
  });

  it("should emit verbose logs when debug env is enabled", () => {
    process.env.NEXT_PUBLIC_DEBUG_TELEMETRY = "1";
    logTelemetry(
      {
        event: "medals_fetch_attempt",
        level: "info",
        meta: { source: "page" },
      },
      { verbose: true }
    );

    expect(console.info).toHaveBeenCalledWith("medals_fetch_attempt", { source: "page" });
  });

  it("should always emit warn/error logs", () => {
    logTelemetry({
      event: "medals_parse_failure",
      level: "warn",
      meta: { source: "json" },
    });
    logTelemetry({
      event: "medals_fetch_failure",
      level: "error",
      meta: { source: "all" },
    });

    expect(console.warn).toHaveBeenCalledWith("medals_parse_failure", { source: "json" });
    expect(console.error).toHaveBeenCalledWith("medals_fetch_failure", { source: "all" });
  });
});
