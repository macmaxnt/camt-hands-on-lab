import test from "node:test";

// Lab 4 target. These tests describe evaluation and release-readiness work that
// is not implemented in this starter. They must stay skipped until the
// evaluation runner, feedback endpoint, and release record exist.

test.skip("the evaluation set is versioned and every case declares an expected outcome");
test.skip("citation support and safe-stop results are measured for each evaluation case");
test.skip("evaluation records exclude raw prompts, drafts, evidence text, and personal data");
test.skip("a provider or quota failure selects only the approved fallback or safe-error path");
test.skip("feedback payloads are validated, bounded, and privacy-minimised");
test.skip("release criteria block release when a required evaluation case fails");
test.skip("a release decision records its evidence and a documented limitation");
