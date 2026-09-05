import { readFile } from "node:fs/promises";
import { getSeedCorpusService } from "../../../../../../lib/corpus/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Context) {
  // TODO(Lab 2): authorize source-file downloads; this intentionally exposes both classifications.
  const source = getSeedCorpusService().getSourceFile((await params).id);
  if (!source) return Response.json({ error: "Document not found." }, { status: 404 });
  try {
    return new Response(await readFile(source.path), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${source.filename.replace(/"/gu, "")}"`,
        "Cache-Control": "private, max-age=0",
        "X-Lab-2-Access-Control": "not-implemented",
      },
    });
  } catch { return Response.json({ error: "The seeded source file is unavailable." }, { status: 404 }); }
}
