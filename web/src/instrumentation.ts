export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Register default skills
    const { skillRegistry } = await import("@/lib/skills/registry");
    const { genericSkill } = await import("@/lib/skills/generic");
    skillRegistry.register(genericSkill);
    console.log("[skills] Default skills registered");

    // Start BullMQ worker
    const { startWorker } = await import("@/lib/queue/worker");
    startWorker();
    console.log("[worker] BullMQ worker started");
  }
}
