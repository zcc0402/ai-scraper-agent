import { type Page } from "playwright";

export async function extractText(page: Page, selector: string): Promise<string[]> {
  return page.locator(selector).allTextContents();
}

export async function extractTable(page: Page, selector: string): Promise<Record<string, string>[]> {
  const rows = await page.locator(`${selector} tr`).all();
  const headers = await rows[0]?.locator("th").allTextContents() || [];
  const data: Record<string, string>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cells = await rows[i].locator("td").allTextContents();
    const row: Record<string, string> = {};
    headers.forEach((h, j) => { row[h] = cells[j] || ""; });
    data.push(row);
  }

  return data;
}
