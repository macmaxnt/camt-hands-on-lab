import { NextResponse } from "next/server";
import { runLocalEvaluation } from "../../../lib/evaluation";

export async function POST() {
  try {
    const run = runLocalEvaluation();
    return NextResponse.json(run);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Evaluation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const run = runLocalEvaluation();
    return NextResponse.json(run);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Evaluation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
