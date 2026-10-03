/**
 * The rule `flowchart/no-duplicate-title`, on the examples of its document and on the
 * fixtures that record what mermaid.js does with `accTitle` statements.
 */
import { noDuplicateTitle } from "../../../src/rules/flowchart/no-duplicate-title.ts"
import { testRule } from "../../rule-test.ts"

testRule("flowchart/no-duplicate-title", noDuplicateTitle)
