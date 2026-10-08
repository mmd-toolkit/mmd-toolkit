/**
 * The rule `sequence-no-ignored-text`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { sequenceNoIgnoredText } from "../../src/rules/sequence-no-ignored-text.ts"
import { testRule } from "../rule-test.ts"

testRule("sequence-no-ignored-text", sequenceNoIgnoredText)
