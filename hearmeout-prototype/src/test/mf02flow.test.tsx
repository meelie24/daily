import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AppShell } from "../app/AppShell";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

function openEntry() {
  render(<AppShell />);
  fireEvent.click(screen.getByRole("button", { name: "Continue practice" }));
}

describe("MF02 flow", () => {
  it("shows first-use instructions, then play", () => {
    openEntry();
    fireEvent.click(screen.getByRole("button", { name: "See how it works" }));
    expect(screen.getByText("First time")).toBeInTheDocument();
    expect(
      screen.getByText("Hold the pad to build your turn. Release it to send."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(
      screen.getByRole("button", {
        name: "Hold to build your turn, release to send",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("“I can take the follow-up.”")).toBeInTheDocument();
  });

  it("skips instructions for returning users", () => {
    localStorage.setItem(
      "hearmeout-eval.settings.v1",
      JSON.stringify({ seenMF02Instructions: true }),
    );
    openEntry();
    fireEvent.click(screen.getByRole("button", { name: "See how it works" }));
    expect(screen.queryByText("First time")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Hold to build your turn, release to send",
      }),
    ).toBeInTheDocument();
  });

  it("keeps the task available under reduced motion and controlled pace", () => {
    localStorage.setItem(
      "hearmeout-eval.settings.v1",
      JSON.stringify({
        seenMF02Instructions: true,
        reduceMotion: true,
        controlledPace: true,
      }),
    );
    openEntry();
    fireEvent.click(screen.getByRole("button", { name: "See how it works" }));
    // The judgment surface is all still present.
    expect(
      screen.getByRole("button", {
        name: "Hold to build your turn, release to send",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Your line")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Describe the room" }),
    ).toBeInTheDocument();
    expect(document.documentElement.classList.contains("motion-reduced")).toBe(
      true,
    );
  });

  it("offers button controls as an accessibility equivalent", () => {
    localStorage.setItem(
      "hearmeout-eval.settings.v1",
      JSON.stringify({ seenMF02Instructions: true }),
    );
    openEntry();
    fireEvent.click(screen.getByRole("button", { name: "See how it works" }));
    fireEvent.click(screen.getByRole("button", { name: "Button controls" }));
    expect(screen.getByRole("button", { name: "Light" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Steady" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Strong" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send now" })).toBeInTheDocument();
  });

  it("leaving play returns to the exercise entry", () => {
    localStorage.setItem(
      "hearmeout-eval.settings.v1",
      JSON.stringify({ seenMF02Instructions: true }),
    );
    openEntry();
    fireEvent.click(screen.getByRole("button", { name: "See how it works" }));
    fireEvent.click(screen.getByRole("button", { name: "Leave" }));
    expect(
      screen.getByRole("heading", { name: "Responsive delivery" }),
    ).toBeInTheDocument();
    expect(screen.getByText("See how it works")).toBeInTheDocument();
  });
});
