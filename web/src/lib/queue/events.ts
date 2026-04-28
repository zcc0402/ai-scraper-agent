export type TaskEvent = {
  type: string;
  [key: string]: unknown;
};

type Listener = (event: TaskEvent) => void;

export class TaskEventBus {
  private listeners = new Map<string, Set<Listener>>();

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
    const listeners = this.listeners.get(taskId);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }
}

export const taskEvents = new TaskEventBus();
