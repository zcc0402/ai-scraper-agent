import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";

class PlaywrightMCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private connecting = false;

  async connect() {
    if (this.client || this.connecting) return;
    this.connecting = true;

    try {
      this.transport = new StdioClientTransport({
        command: "npx",
        args: ["@playwright/mcp@latest", "--headless", "--isolated"],
      });

      this.client = new Client({ name: "ai-scraper", version: "1.0.0" });
      await this.client.connect(this.transport);
    } finally {
      this.connecting = false;
    }
  }

  async callTool(name: string, args?: Record<string, unknown>) {
    if (!this.client) await this.connect();
    return this.client!.callTool({ name, arguments: args });
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.transport = null;
    }
  }
}

export const mcpClient = new PlaywrightMCPClient();
