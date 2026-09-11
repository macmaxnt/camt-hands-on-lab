import test from "node:test";

test.skip("agent run derives role from signed session");
test.skip("unsafe intake cannot reach planner/search/draft/provider");
test.skip("public task never receives staff evidence or provider context");
test.skip("only the three declared tools are accepted");
test.skip("invalid payload/tool/evidence ID safely stops");
test.skip("max steps prevents repeated calls");
test.skip("no completion occurs before version-bound human approval");
test.skip("stale and duplicate approvals cannot create a second result");
test.skip("persisted traces omit raw task/draft/evidence/provider text");
