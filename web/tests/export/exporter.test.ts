import { describe, it, expect } from "vitest";
import { readFile } from "fs/promises";

describe("Data Exporter", () => {
  const sampleData = [
    { title: "Item 1", url: "https://a.com" },
    { title: "Item 2", url: "https://b.com" },
  ];

  it("should export as JSON", async () => {
    const { exportData } = await import("@/lib/export/exporter");
    const filePath = await exportData(sampleData, "json", "test-json-1");
    const content = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(content);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].title).toBe("Item 1");
  });

  it("should export as CSV", async () => {
    const { exportData } = await import("@/lib/export/exporter");
    const filePath = await exportData(sampleData, "csv", "test-csv-1");
    const content = await readFile(filePath, "utf-8");
    expect(content).toContain("title");
    expect(content).toContain("Item 1");
  });

  it("should export as Excel", async () => {
    const { exportData } = await import("@/lib/export/exporter");
    const filePath = await exportData(sampleData, "excel", "test-excel-1");
    expect(filePath).toContain(".xlsx");
    // Verify file exists and has content
    const buffer = await readFile(filePath);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
