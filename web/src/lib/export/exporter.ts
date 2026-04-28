import { Parser } from "json2csv";

export async function exportData(
  data: Record<string, unknown>[],
  format: "json" | "csv" | "excel"
): Promise<string | Buffer> {
  switch (format) {
    case "json":
      return JSON.stringify(data, null, 2);

    case "csv": {
      if (data.length === 0) return "";
      const parser = new Parser({ fields: Object.keys(data[0]) });
      return parser.parse(data);
    }

    case "excel": {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    }

    default:
      return JSON.stringify(data, null, 2);
  }
}
