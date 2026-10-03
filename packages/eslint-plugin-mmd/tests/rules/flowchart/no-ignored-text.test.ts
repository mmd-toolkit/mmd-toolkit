/**
 * The rule `flowchart/no-ignored-text`, on the examples of its document and on the
 * fixtures that record what mermaid.js does with text on a direction line.
 */
import { noIgnoredText } from "../../../src/rules/flowchart/no-ignored-text.ts"
import { testRule } from "../../rule-test.ts"

testRule("flowchart/no-ignored-text", noIgnoredText, {
  kind: "anyRule",
  because:
    "The text split off becomes statements, and any rule may report a mistake in them.",
})
