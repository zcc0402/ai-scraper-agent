import { describe, it, expect, vi } from "vitest";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{
          id: "test-id",
          userInput: "test",
          status: "pending",
          createdAt: new Date(),
        }]),
      }),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            offset: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

vi.mock("@/lib/queue/producer", () => ({
  addScrapeJob: vi.fn().mockResolvedValue({ id: "job-1" }),
}));

describe("Tasks API", () => {
  it("POST /api/tasks should create a task", async () => {
    const { POST } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        userInput: "抓取 Hacker News 前10条标题",
        outputFormat: "json",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
