/**
 * The rule `mindmap-no-duplicate-decoration`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { mindmapNoDuplicateDecoration } from "../../src/rules/mindmap-no-duplicate-decoration.ts"
import { testRule } from "../rule-test.ts"

testRule("mindmap-no-duplicate-decoration", mindmapNoDuplicateDecoration)
