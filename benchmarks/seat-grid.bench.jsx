/* eslint-disable react-refresh/only-export-components -- benchmark entrypoint, not application Fast Refresh code */
import { render } from "@testing-library/react";
import { bench, describe } from "vitest";

import SeatSelectionGrid from "../src/components/SeatSelectionGrid";
import { SEAT_AVAILABILITY } from "../src/utils/seatAvailability";
import {
  createVirtualSeatRows,
  replaceFirstSeatAvailability,
} from "../src/test/virtualSeatFixture";

const CASES = [
  { label: "24 seats", rows: 3, seatsPerRow: 8 },
  { label: "200 seats", rows: 10, seatsPerRow: 20 },
  { label: "500 seats", rows: 20, seatsPerRow: 25 },
  { label: "2,000 seats", rows: 50, seatsPerRow: 40 },
];

const BENCHMARK_OPTIONS = {
  iterations: 5,
  time: 0,
  warmupIterations: 1,
  warmupTime: 0,
};

describe("SeatSelectionGrid local jsdom cost", () => {
  for (const { label, rows, seatsPerRow } of CASES) {
    const seats = createVirtualSeatRows({ rows, seatsPerRow });
    const changedSeats = replaceFirstSeatAvailability(
      seats,
      SEAT_AVAILABILITY.HELD,
    );
    const expectedSeatCount = rows * seatsPerRow;

    bench(
      `${label} initial render and unmount`,
      () => {
        const view = render(
          <SeatSelectionGrid
            seats={seats}
            selectedSeats={[]}
            onSeatClick={() => {}}
          />,
        );

        if (
          view.container.querySelectorAll("button").length !== expectedSeatCount
        ) {
          throw new Error(`${label} did not render every seat button.`);
        }
        view.unmount();
      },
      BENCHMARK_OPTIONS,
    );

    bench(
      `${label} initial render, one status rerender and unmount`,
      () => {
        const view = render(
          <SeatSelectionGrid
            seats={seats}
            selectedSeats={[]}
            onSeatClick={() => {}}
          />,
        );
        view.rerender(
          <SeatSelectionGrid
            seats={changedSeats}
            selectedSeats={[]}
            onSeatClick={() => {}}
          />,
        );

        if (
          view.container.querySelectorAll("button").length !== expectedSeatCount
        ) {
          throw new Error(`${label} did not preserve every seat button.`);
        }
        view.unmount();
      },
      BENCHMARK_OPTIONS,
    );
  }
});
