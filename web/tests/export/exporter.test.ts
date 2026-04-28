import { describe, it, expect } from "vitest";

describe("Data Exporter", () => {
  const sampleData = [
    { title: "Item 1", url: "https://a.com" },
    { title: "Item 2", url: "https://b.com" },
  ];

  it("should export as JSON", async () => {
    const { exportData } = await import("@/lib/export/exporter");
    const result = await exportData(sampleData, "json");
    const parsed = JSON.parse(result as string);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].title).toBe("Item 1");
  });

  it("should export as CSV", async () => {
    const { exportData } = await import("@/lib/export/exporter");
    const result = await exportData(sampleData, "csv");
    expect(result).toContain("title");
    expect(result).toContain("Item 1");
  });
});
