import { NextResponse } from "next/server";
import { ActionRecorder } from "@/lib/rpa/recorder";

let recorder: ActionRecorder | null = null;

export async function POST(req: Request) {
  const { url } = await req.json();
  recorder = new ActionRecorder();
  await recorder.start(url);
  return NextResponse.json({ status: "recording" });
}
