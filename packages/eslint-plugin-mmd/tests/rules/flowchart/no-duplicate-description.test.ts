/**
 * The rule `flowchart/no-duplicate-description`, on the examples of its document and on the
 * fixtures that record what mermaid.js does with statements that set the description.
 */
import { noDuplicateDescription } from "../../../src/rules/flowchart/no-duplicate-description.ts"
import { testRule } from "../../rule-test.ts"

testRule("flowchart/no-duplicate-description", noDuplicateDescription)
