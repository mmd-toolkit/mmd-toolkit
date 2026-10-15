/**
 * The rule `xychart-no-extra-value`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { xychartNoExtraValue } from "../../src/rules/xychart-no-extra-value.ts"
import { testRule } from "../rule-test.ts"

testRule("xychart-no-extra-value", xychartNoExtraValue)
