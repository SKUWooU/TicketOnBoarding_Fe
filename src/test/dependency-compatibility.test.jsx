import { fireEvent, render, screen } from "@testing-library/react";
import axios from "axios";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import styled from "styled-components";
import { describe, expect, it, vi } from "vitest";

const FixtureLink = styled(Link)`
  color: rebeccapurple;
`;

describe("compatible dependency upgrades", () => {
  it("navigates through a styled React Router link", () => {
    render(
      <MemoryRouter initialEntries={["/start"]}>
        <Routes>
          <Route
            path="/start"
            element={<FixtureLink to="/done">다음 단계</FixtureLink>}
          />
          <Route path="/done" element={<h1>이동 완료</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("link", { name: "다음 단계" }));

    expect(screen.getByRole("heading", { name: "이동 완료" })).toBeVisible();
  });

  it("uses an Axios adapter fixture without a network request", async () => {
    const adapter = vi.fn(async (config) => ({
      config,
      data: { available: true },
      headers: {},
      request: {},
      status: 200,
      statusText: "OK",
    }));
    const client = axios.create({ adapter });

    const response = await client.get("/local-fixture");

    expect(adapter).toHaveBeenCalledOnce();
    expect(response.data).toEqual({ available: true });
  });
});
