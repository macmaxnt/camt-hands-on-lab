import { NextRequest, NextResponse } from "next/server";
import { getFeedbackRecords, validateAndRecordFeedback } from "../../../lib/evaluation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const record = validateAndRecordFeedback(body);
    return NextResponse.json({ ok: true, record });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid feedback";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ feedback: getFeedbackRecords() });
}
