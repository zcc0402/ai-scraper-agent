import { Parser } from "json2csv";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const UPLOADS_DIR = join(process.cwd(), "uploads");

async function ensureUploadsDir() {
  await mkdir(UPLOADS_DIR, { recursive: true });
}

export async function exportData(
  data: Record<string, unknown>[],
  format: "json" | "csv" | "excel",
  taskId: string
): Promise<string> {
  await ensureUploadsDir();

  switch (format) {
    case "json": {
      const content = JSON.stringify(data, null, 2);
      const filePath = join(UPLOADS_DIR, `${taskId}.json`);
      await writeFile(filePath, content, "utf-8");
      return filePath;
    }

    case "csv": {
      if (data.length === 0) {
        const filePath = join(UPLOADS_DIR, `${taskId}.csv`);
        await writeFile(filePath, "", "utf-8");
        return filePath;
      }
      const parser = new Parser({ fields: Object.keys(data[0]) });
      const content = parser.parse(data);
      const filePath = join(UPLOADS_DIR, `${taskId}.csv`);
      await writeFile(filePath, content, "utf-8");
      return filePath;
    }

    case "excel": {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      const filePath = join(UPLOADS_DIR, `${taskId}.xlsx`);
      await writeFile(filePath, buffer);
      return filePath;
    }

    default: {
      const content = JSON.stringify(data, null, 2);
      const filePath = join(UPLOADS_DIR, `${taskId}.json`);
      await writeFile(filePath, content, "utf-8");
      return filePath;
    }
  }
}
