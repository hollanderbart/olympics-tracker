import { render } from "@/tests/setup/test-utils";
import TodayForNL from "./TodayForNL";
import { DutchEvent } from "@/lib/types";

describe("TodayForNL snapshots", () => {
  const upcomingEvent: DutchEvent = {
    id: "ssk-w1500",
    sport: "Speed Skating",
    sportIcon: "⛸️",
    event: "Vrouwen 1500m",
    date: "2026-02-13",
    time: "16:30",
    venue: "Milano Speed Skating Stadium",
    athletes: ["Antoinette Rijpma-de Jong"],
    status: "upcoming",
    source: "fallback",
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-02-13T15:30:00+01:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should match snapshot with upcoming event and medal update", () => {
    const { container } = render(
      <TodayForNL
        nextEvent={upcomingEvent}
        latestMedalUpdate="goud 2→3 (15:12:00)"
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("should match snapshot with empty state", () => {
    const { container } = render(<TodayForNL nextEvent={null} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
