import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LoginBtn from "./LoginBtn";

describe("LoginBtn", () => {
  it("renders its label and delegates a click without external I/O", () => {
    const handleClick = vi.fn();

    render(
      <LoginBtn
        className="reservation"
        buttonText="예매하기"
        onClick={handleClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "예매하기" }));

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
