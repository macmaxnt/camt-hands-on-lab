import { getSeedCorpusService } from "../../../../lib/corpus/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  // TODO(Lab 2): do not expose this ledger until a server session authorizes its classifications.
  const service = getSeedCorpusService();
  return Response.json({ corpus: service.manifest, documents: service.listDocuments() });
}
