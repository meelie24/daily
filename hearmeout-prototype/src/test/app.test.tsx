import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { AppShell } from "../app/AppShell";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

function renderApp() {
  return render(<AppShell />);
}

describe("shell and navigation", () => {
  it("opens on Bridge with the public line", () => {
    renderApp();
    expect(
      screen.getByRole("heading", { name: "To them, who are you?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Continue practice")).toBeInTheDocument();
  });

  it("changes screens through the primary navigation", () => {
    renderApp();
    const nav = screen.getByRole("navigation", { name: "Primary" });

    fireEvent.click(within(nav).getByRole("button", { name: "Style" }));
    expect(
      screen.getByRole("heading", {
        name: "What happens to your language under pressure?",
      }),
    ).toBeInTheDocument();

    fireEvent.click(within(nav).getByRole("button", { name: "Clarity" }));
    expect(
      screen.getByRole("heading", { name: "Look at it from more than one angle" }),
    ).toBeInTheDocument();

    fireEvent.click(within(nav).getByRole("button", { name: "Pocket" }));
    expect(screen.getByRole("tab", { name: "Growth Tree" })).toBeInTheDocument();

    fireEvent.click(within(nav).getByRole("button", { name: "Bridge" }));
    expect(
      screen.getByRole("heading", { name: "To them, who are you?" }),
    ).toBeInTheDocument();
  });

  it("opens Communication from the categories list", () => {
    renderApp();
    fireEvent.click(screen.getByRole("button", { name: "See all" }));
    expect(screen.getByRole("heading", { name: "All skills" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Communication/ }));
    expect(
      screen.getByText(
        "Make the point easier to understand without losing yourself in the process.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("34%")).toBeInTheDocument();
  });

  it("opens the MF02 entry from Tone & delivery", () => {
    renderApp();
    fireEvent.click(screen.getByRole("button", { name: "See all" }));
    fireEvent.click(screen.getByRole("button", { name: /Communication/ }));
    fireEvent.click(screen.getByRole("button", { name: /Tone & delivery/ }));
    expect(
      screen.getByRole("heading", { name: "Responsive delivery" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mechanic evaluation")).toBeInTheDocument();
    expect(screen.getByText("See how it works")).toBeInTheDocument();
  });

  it("routes Continue practice straight to the same exercise entry", () => {
    renderApp();
    fireEvent.click(screen.getByRole("button", { name: "Continue practice" }));
    expect(
      screen.getByRole("heading", { name: "Responsive delivery" }),
    ).toBeInTheDocument();
  });

  it("keeps the non-playable categories responsive with a shell message", () => {
    renderApp();
    fireEvent.click(screen.getByRole("button", { name: "See all" }));
    fireEvent.click(screen.getByRole("button", { name: /Conflict & Repair/ }));
    expect(
      screen.getByRole("heading", { name: "No exercise is connected here" }),
    ).toBeInTheDocument();
  });

  it("searches saved items in Pocket locally", () => {
    renderApp();
    const nav = screen.getByRole("navigation", { name: "Primary" });
    fireEvent.click(within(nav).getByRole("button", { name: "Pocket" }));
    const search = screen.getByRole("searchbox", { name: "Search saved items" });
    fireEvent.change(search, { target: { value: "deck" } });
    expect(screen.getByText("The client deck that went early")).toBeInTheDocument();
    expect(screen.queryByText("Responsive delivery rep")).not.toBeInTheDocument();
    fireEvent.change(search, { target: { value: "zzzz" } });
    expect(screen.getByText("Nothing saved matches that.")).toBeInTheDocument();
  });

  it("completes the Argument Style flow and routes to MF02", () => {
    renderApp();
    const nav = screen.getByRole("navigation", { name: "Primary" });
    fireEvent.click(within(nav).getByRole("button", { name: "Style" }));
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    for (let q = 0; q < 3; q++) {
      const options = screen
        .getAllByRole("button")
        .filter((b) => b.className.includes("option-btn"));
      fireEvent.click(options[0]);
      fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    }
    expect(screen.getByText(/Under pressure, you/)).toBeInTheDocument();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Practice responsive delivery" })[0],
    );
    expect(
      screen.getByRole("heading", { name: "Responsive delivery" }),
    ).toBeInTheDocument();
  });

  it("gives every icon-only button an accessible name", () => {
    renderApp();
    const check = () => {
      for (const btn of screen.getAllByRole("button")) {
        const name =
          btn.getAttribute("aria-label") ?? btn.textContent?.trim() ?? "";
        expect(name.length).toBeGreaterThan(0);
      }
    };
    check();
    const nav = screen.getByRole("navigation", { name: "Primary" });
    for (const tab of ["Style", "Clarity", "Pocket"]) {
      fireEvent.click(within(nav).getByRole("button", { name: tab }));
      check();
    }
  });

  it("survives clicking every visible button on the main screens", () => {
    renderApp();
    const recover = (tab: string) => {
      // The exercise hides the tab bar; back out until it returns.
      for (let i = 0; i < 4; i++) {
        if (screen.queryByRole("navigation", { name: "Primary" })) break;
        const backOut =
          screen.queryAllByRole("button", { name: "Back" })[0] ??
          screen.queryAllByRole("button", { name: "Leave" })[0];
        if (!backOut) break;
        fireEvent.click(backOut);
      }
      const nav = screen.getByRole("navigation", { name: "Primary" });
      fireEvent.click(within(nav).getByRole("button", { name: tab }));
    };
    for (const tab of ["Bridge", "Style", "Clarity", "Pocket"]) {
      recover(tab);
      const names = screen
        .getAllByRole("button")
        .map((b) => b.getAttribute("aria-label") ?? b.textContent?.trim() ?? "");
      for (const name of names) {
        const candidates = screen.queryAllByRole("button", { name });
        if (candidates.length > 0) {
          fireEvent.click(candidates[0]);
        }
        expect(document.body.textContent?.length ?? 0).toBeGreaterThan(0);
        recover(tab);
      }
    }
  });
});

describe("settings", () => {
  it("toggles work and persist locally", () => {
    renderApp();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    const sound = screen.getByRole("switch", { name: "Sound" });
    expect(sound).toHaveAttribute("aria-checked", "true");
    fireEvent.click(sound);
    expect(sound).toHaveAttribute("aria-checked", "false");
    const saved = JSON.parse(
      localStorage.getItem("hearmeout-eval.settings.v1") ?? "{}",
    );
    expect(saved.sound).toBe(false);
  });

  it("opens the identity panel with skippable options", () => {
    renderApp();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.click(
      screen.getByRole("button", { name: /Identity and fictional cast/ }),
    );
    expect(screen.getByRole("group", { name: "Pronouns" })).toBeInTheDocument();
    fireEvent.click(
      within(screen.getByRole("group", { name: "Pronouns" })).getByRole("button", {
        name: "They/them",
      }),
    );
  });
});
