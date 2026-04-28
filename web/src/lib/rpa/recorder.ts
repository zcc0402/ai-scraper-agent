import { chromium, type Browser, type Page } from "playwright";

export interface RecordedAction {
  type: "navigate" | "click" | "fill" | "scroll" | "wait";
  selector?: string;
  ref?: string;
  value?: string;
  url?: string;
  timestamp: number;
}

export class ActionRecorder {
  private actions: RecordedAction[] = [];
  private browser: Browser | null = null;
  private page: Page | null = null;

  async start(url: string): Promise<void> {
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();

    await this.page.addInitScript(() => {
      (window as any).__recordedActions = [];

      function generateSelector(el: HTMLElement): string {
        if (el.id) return `#${el.id}`;
        const classes = Array.from(el.classList).slice(0, 2).join(".");
        return `${el.tagName.toLowerCase()}${classes ? "." + classes : ""}`;
      }

      document.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        (window as any).__recordedActions.push({
          type: "click",
          selector: generateSelector(target),
          timestamp: Date.now(),
        });
      });

      document.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        (window as any).__recordedActions.push({
          type: "fill",
          selector: generateSelector(target),
          value: target.value,
          timestamp: Date.now(),
        });
      });
    });

    await this.page.goto(url);
    this.actions = [{ type: "navigate", url, timestamp: Date.now() }];
  }

  async getActions(): Promise<RecordedAction[]> {
    if (!this.page) return this.actions;
    const pageActions = await this.page.evaluate(
      () => (window as any).__recordedActions || []
    );
    return [...this.actions, ...pageActions];
  }

  async stop(): Promise<RecordedAction[]> {
    const actions = await this.getActions();
    await this.browser?.close();
    this.browser = null;
    this.page = null;
    return actions;
  }
}
