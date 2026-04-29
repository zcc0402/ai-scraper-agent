import { readdir, stat } from "fs/promises";
import { join } from "path";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const screenshotsDir = join(process.cwd(), "uploads", "screenshots", taskId);

  try {
    const files = await readdir(screenshotsDir);
    const pngFiles = files.filter((f) => f.endsWith(".png")).sort();

    const screenshots = await Promise.all(
      pngFiles.map(async (file, i) => {
        const filePath = join(screenshotsDir, file);
        const fileStat = await stat(filePath);
        return {
          index: i + 1,
          url: `/api/tasks/${taskId}/screenshots/${i + 1}`,
          timestamp: fileStat.mtimeMs,
        };
      })
    );

    return Response.json({ screenshots });
  } catch {
    return Response.json({ screenshots: [] });
  }
}
