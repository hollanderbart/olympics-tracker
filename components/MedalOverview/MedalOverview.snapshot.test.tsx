import { render } from "@/tests/setup/test-utils";
import MedalOverview from "./MedalOverview";
import { CountryMedals } from "@/lib/types";

jest.mock("canvas-confetti", () => {
  const mock = jest.fn();
  (mock as any).shapeFromPath = jest.fn(() => ({ type: "path-shape" }));
  return mock;
});

describe("MedalOverview snapshots", () => {
  const mockNedMedals: CountryMedals = {
    noc: "NED",
    name: "Netherlands",
    flag: "🇳🇱",
    rank: 1,
    medals: {
      gold: 3,
      silver: 2,
      bronze: 1,
      total: 6,
    },
  };

  it("should match snapshot with medals", () => {
    const { container } = render(
      <MedalOverview nedMedals={mockNedMedals} onToggleTally={() => {}} showTally={false} />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("should match snapshot with zero medals state", () => {
    const { container } = render(
      <MedalOverview
        nedMedals={{
          ...mockNedMedals,
          medals: { gold: 0, silver: 0, bronze: 0, total: 0 },
        }}
        onToggleTally={() => {}}
        showTally={false}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
