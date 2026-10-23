/**
 * The rule `xychart-no-invalid-orientation`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { xychartNoInvalidOrientation } from "../../src/rules/xychart-no-invalid-orientation.ts"
import { testRule } from "../rule-test.ts"

testRule("xychart-no-invalid-orientation", xychartNoInvalidOrientation)
