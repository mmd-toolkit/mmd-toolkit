/**
 * The rule `state-no-ignored-text`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { stateNoIgnoredText } from "../../src/rules/state-no-ignored-text.ts"
import { testRule } from "../rule-test.ts"

testRule("state-no-ignored-text", stateNoIgnoredText)
