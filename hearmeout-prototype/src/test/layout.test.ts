import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * jsdom does no real layout, so the true overflow check happens in the
 * browser walkthrough. These assertions pin the stylesheet rules that
 * make horizontal overflow impossible at phone widths.
 */
describe("responsive shell rules", () => {
  const tokens = readFileSync(
    resolve(__dirname, "../design/tokens.css"),
    "utf8",
  );
  const app = readFileSync(resolve(__dirname, "../app/app.css"), "utf8");

  it("locks horizontal overflow at the root", () => {
    expect(tokens).toMatch(/html,\s*body\s*\{[^}]*overflow-x:\s*hidden/);
  });

  it("uses dynamic viewport height for the shell", () => {
    expect(app).toMatch(/height:\s*100dvh/);
  });

  it("keeps safe-area insets on the bottom navigation", () => {
    expect(app).toMatch(/env\(safe-area-inset-bottom\)/);
  });

  it("keeps the locked motion tokens", () => {
    expect(tokens).toContain("--motion-enter: 320ms");
    expect(tokens).toContain("--motion-exit: 280ms");
    expect(tokens).toContain("--motion-overlay: 300ms");
    expect(tokens).toContain("--motion-idle-breath: 5500ms");
    expect(tokens).toContain("--motion-clarity-pulse: 1200ms");
    expect(tokens).toContain("cubic-bezier(0.22, 1, 0.36, 1)");
  });

  it("keeps the locked color tokens", () => {
    for (const token of [
      "--canvas: #fff8ec",
      "--teal: #007a7e",
      "--violet: #7357d5",
      "--amber: #c57800",
      "--danger: #b83a55",
    ]) {
      expect(tokens.toLowerCase()).toContain(token);
    }
  });
});
