import { describe, expect, it } from "vitest";

import {
  getFrameworkColumn,
  getFrameworkColumns,
  isValidFrameworkColumn,
} from "@/lib/framework-columns";

describe("framework columns", () => {
  it("returns the Start/Stop/Continue columns in order", () => {
    const columns = getFrameworkColumns("start_stop_continue");
    expect(columns.map((c) => c.id)).toEqual(["start", "stop", "continue"]);
  });

  it("returns the Mad/Sad/Glad columns in order", () => {
    const columns = getFrameworkColumns("mad_sad_glad");
    expect(columns.map((c) => c.id)).toEqual(["mad", "sad", "glad"]);
  });

  it("returns the four Sailboat columns", () => {
    const columns = getFrameworkColumns("sailboat");
    expect(columns.map((c) => c.id)).toEqual([
      "wind",
      "anchor",
      "rocks",
      "island",
    ]);
  });

  it("gives every column a label, description and accent color", () => {
    for (const framework of [
      "start_stop_continue",
      "mad_sad_glad",
      "sailboat",
    ] as const) {
      for (const column of getFrameworkColumns(framework)) {
        expect(column.label).toBeTruthy();
        expect(column.description).toBeTruthy();
        expect(column.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it("looks up a single column by id", () => {
    expect(getFrameworkColumn("start_stop_continue", "stop")?.label).toBe(
      "Stop",
    );
  });

  it("returns undefined for an unknown column id", () => {
    expect(getFrameworkColumn("start_stop_continue", "nope")).toBeUndefined();
  });

  it("validates whether a column belongs to a framework", () => {
    expect(isValidFrameworkColumn("mad_sad_glad", "mad")).toBe(true);
    expect(isValidFrameworkColumn("mad_sad_glad", "start")).toBe(false);
  });
});
