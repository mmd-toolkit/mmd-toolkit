/**
 * The rule `xychart-no-redefined-axis`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { xychartNoRedefinedAxis } from "../../src/rules/xychart-no-redefined-axis.ts"
import { testRule } from "../rule-test.ts"

testRule("xychart-no-redefined-axis", xychartNoRedefinedAxis)
