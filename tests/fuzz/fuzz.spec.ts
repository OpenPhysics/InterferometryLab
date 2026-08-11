/**
 * Optional Playwright fuzz smoke for the SceneryStack template.
 *
 * Usage:
 *   npm run test:fuzz
 *   npm run test:fuzz:quick
 *   FUZZ_SEED=12345 npm run test:fuzz
 */

import { expect, test } from "@playwright/test";

const FUZZ_DURATION: number = parseInt(process.env["FUZZ_DURATION"] || "15", 10) * 1000;
const FUZZ_SEED: string = process.env["FUZZ_SEED"] || Math.floor(Math.random() * 1_000_000).toString();
const FUZZ_RATE: string = process.env["FUZZ_RATE"] || "100";
const FUZZ_POINTERS: string = process.env["FUZZ_POINTERS"] || "1";

interface ConsoleMessage {
  type: string;
  text: string;
  location: string;
  timestamp: number;
}

test.describe("Fuzz Testing", () => {
  test("should run without console errors", async ({ page }) => {
    const errors: ConsoleMessage[] = [];
    const assertions: ConsoleMessage[] = [];
    const startTime = Date.now();

    const fuzzUrl = `/?fuzz&randomSeed=${FUZZ_SEED}&fuzzRate=${FUZZ_RATE}&fuzzPointers=${FUZZ_POINTERS}`;

    page.on("console", (msg) => {
      const type = msg.type();
      const text = msg.text();
      const location = msg.location();
      const timestamp = Date.now() - startTime;
      const message: ConsoleMessage = {
        type,
        text,
        location: `${location.url}:${location.lineNumber}:${location.columnNumber}`,
        timestamp,
      };
      if (type === "error") {
        errors.push(message);
      } else if (text.includes("Assertion failed") || text.includes("AssertionError")) {
        assertions.push(message);
      }
    });

    page.on("pageerror", (error) => {
      errors.push({
        type: "pageerror",
        text: error.message,
        location: error.stack || "unknown",
        timestamp: Date.now() - startTime,
      });
    });

    await page.goto(fuzzUrl);
    await page.waitForSelector("#sim", { timeout: 30_000 });

    const checkInterval = 2000;
    let elapsed = 0;
    while (elapsed < FUZZ_DURATION) {
      const waitTime = Math.min(checkInterval, FUZZ_DURATION - elapsed);
      await page.waitForTimeout(waitTime);
      elapsed += waitTime;
      try {
        await page.evaluate(() => window.document.hasFocus);
      } catch {
        break;
      }
    }

    expect(errors.length, `Found ${errors.length} console errors`).toBe(0);
    expect(assertions.length, `Found ${assertions.length} assertion failures`).toBe(0);
  });
});
