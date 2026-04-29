export type TaskEvent = {
  type: string;
  [key: string]: unknown;
};

type Listener = (event: TaskEvent) => void;

export class TaskEventBus {
  private listeners = new Map<string, Set<Listener>>();
  private persistFn: ((taskId: string, event: TaskEvent) => void) | null = null;

  setPersistFn(fn: (taskId: string, event: TaskEvent) => void) {
    this.persistFn = fn;
  }

  subscribe(taskId: string, listener: Listener): () => void {
    if (!this.listeners.has(taskId)) {
      this.listeners.set(taskId, new Set());
    }
    this.listeners.get(taskId)!.add(listener);

    return () => {
      this.listeners.get(taskId)?.delete(listener);
    };
  }

  publish(taskId: string, event: TaskEvent): void {
    // Persist to database if handler is set
    if (this.persistFn) {
      this.persistFn(taskId, event);
    }

    // Notify live listeners
    const listeners = this.listeners.get(taskId);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }
}

export const taskEvents = new TaskEventBus();
