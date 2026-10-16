/**
 * The rule `er-no-undef`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { erNoUndef } from "../../src/rules/er-no-undef.ts"
import { testRule } from "../rule-test.ts"

testRule("er-no-undef", erNoUndef)
