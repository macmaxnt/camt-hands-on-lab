import { getSeedCorpusService } from "../../../../../lib/corpus/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Context) {
  // TODO(Lab 2): authorize this detail request against the resolved session.
  const document = getSeedCorpusService().getDocument((await params).id);
  return document ? Response.json({ document }) : Response.json({ error: "Document not found." }, { status: 404 });
}
