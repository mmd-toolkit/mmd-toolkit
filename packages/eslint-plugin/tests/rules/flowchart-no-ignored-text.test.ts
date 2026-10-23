/**
 * The rule `flowchart-no-ignored-text`, on the examples of its document and
 * on the inputs of its fixture directory.
 */
import { flowchartNoIgnoredText } from "../../src/rules/flowchart-no-ignored-text.ts"
import { testRule } from "../rule-test.ts"

testRule("flowchart-no-ignored-text", flowchartNoIgnoredText)
