import { NextResponse } from "next/server";
import { optimizeToRPA } from "@/lib/rpa/optimizer";

export async function POST(req: Request) {
  const { actions, goal } = await req.json();
  const steps = await optimizeToRPA(actions, goal);
  return NextResponse.json({ steps });
}
