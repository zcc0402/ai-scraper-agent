import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ taskId: string; index: string }> }
) {
  const { taskId, index } = await params;
  const screenshotsDir = join(process.cwd(), "uploads", "screenshots", taskId);

  try {
    const files = await readdir(screenshotsDir);
    const pngFiles = files.filter((f) => f.endsWith(".png")).sort();
    const idx = parseInt(index, 10) - 1;

    if (idx < 0 || idx >= pngFiles.length) {
      return new NextResponse("Not found", { status: 404 });
    }

    const filePath = join(screenshotsDir, pngFiles[idx]);
    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
