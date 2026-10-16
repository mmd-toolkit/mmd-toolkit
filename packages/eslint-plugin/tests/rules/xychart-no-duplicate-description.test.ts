/**
 * The rule `xychart-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { xychartNoDuplicateDescription } from "../../src/rules/xychart-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("xychart-no-duplicate-description", xychartNoDuplicateDescription)
