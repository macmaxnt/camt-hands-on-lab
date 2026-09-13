import { NextRequest, NextResponse } from "next/server";
import { getLatestReleaseDecision, recordReleaseDecision } from "../../../lib/evaluation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { runId, reviewerName, honestLimitation, decision, gatePass } = body;
    const record = recordReleaseDecision(runId, reviewerName, honestLimitation, decision, gatePass);
    return NextResponse.json({ ok: true, record });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to record release decision";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function GET() {
  const latest = getLatestReleaseDecision();
  return NextResponse.json({ latest });
}
