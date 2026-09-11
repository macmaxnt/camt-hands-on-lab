import { getSeedCorpusService } from "../../../../lib/corpus/service";
import { resolveSession } from "../../../../lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const service = getSeedCorpusService();
  return Response.json({ corpus: service.manifest, documents: service.listDocuments(resolveSession(request).role) }, { headers: { "Cache-Control": "no-store" } });
}
