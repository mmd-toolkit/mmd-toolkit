/**
 * The rule `xychart-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { xychartNoDuplicateTitle } from "../../src/rules/xychart-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("xychart-no-duplicate-title", xychartNoDuplicateTitle)
