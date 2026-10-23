/**
 * The rule `er-no-ignored-text`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { erNoIgnoredText } from "../../src/rules/er-no-ignored-text.ts"
import { testRule } from "../rule-test.ts"

testRule("er-no-ignored-text", erNoIgnoredText)
