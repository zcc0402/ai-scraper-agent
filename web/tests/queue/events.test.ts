import { describe, it, expect } from "vitest";

describe("Event System", () => {
  it("should publish and subscribe to events", async () => {
    const { TaskEventBus } = await import("@/lib/queue/events");
    const bus = new TaskEventBus();

    const received: unknown[] = [];
    bus.subscribe("task-1", (event) => received.push(event));

    bus.publish("task-1", { type: "status", status: "running" });
    bus.publish("task-1", { type: "completed" });

    expect(received).toHaveLength(2);
    expect(received[0]).toEqual({ type: "status", status: "running" });
  });

  it("should not receive events for other tasks", async () => {
    const { TaskEventBus } = await import("@/lib/queue/events");
    const bus = new TaskEventBus();

    const received: unknown[] = [];
    bus.subscribe("task-1", (event) => received.push(event));
    bus.publish("task-2", { type: "status" });

    expect(received).toHaveLength(0);
  });

  it("should unsubscribe correctly", async () => {
    const { TaskEventBus } = await import("@/lib/queue/events");
    const bus = new TaskEventBus();

    const received: unknown[] = [];
    const unsub = bus.subscribe("task-1", (event) => received.push(event));
    bus.publish("task-1", { type: "a" });
    unsub();
    bus.publish("task-1", { type: "b" });

    expect(received).toHaveLength(1);
  });
});
