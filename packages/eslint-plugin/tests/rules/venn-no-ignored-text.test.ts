/**
 * The rule `venn-no-ignored-text`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { vennNoIgnoredText } from "../../src/rules/venn-no-ignored-text.ts"
import { testRule } from "../rule-test.ts"

testRule("venn-no-ignored-text", vennNoIgnoredText)
