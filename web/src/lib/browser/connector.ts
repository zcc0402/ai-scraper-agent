import { chromium, type Browser } from "playwright";

export interface BrowserOptions {
  mode: "managed" | "cdp";
  cdpEndpoint?: string;
  headless?: boolean;
}

export async function connectBrowser(options: BrowserOptions): Promise<Browser> {
  if (options.mode === "cdp" && options.cdpEndpoint) {
    return chromium.connectOverCDP(options.cdpEndpoint);
  }
  return chromium.launch({ headless: options.headless ?? true });
}
