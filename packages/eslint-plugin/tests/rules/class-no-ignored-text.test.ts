/**
 * The rule `class-no-ignored-text`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { classNoIgnoredText } from "../../src/rules/class-no-ignored-text.ts"
import { testRule } from "../rule-test.ts"

testRule("class-no-ignored-text", classNoIgnoredText)
