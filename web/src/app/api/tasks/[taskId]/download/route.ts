import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { readFile } from "fs/promises";
import { join, basename } from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  const [task] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId));

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (!task.outputFile) {
    return NextResponse.json({ error: "No output file" }, { status: 404 });
  }

  const filePath = task.outputFile;

  // Security: ensure the file is within uploads directory
  const uploadsDir = join(process.cwd(), "uploads");
  if (!filePath.startsWith(uploadsDir)) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  try {
    const fileBuffer = await readFile(filePath);
    const fileName = basename(filePath);

    const mimeTypes: Record<string, string> = {
      ".json": "application/json",
      ".csv": "text/csv",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
    const ext = fileName.substring(fileName.lastIndexOf("."));
    const contentType = mimeTypes[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
