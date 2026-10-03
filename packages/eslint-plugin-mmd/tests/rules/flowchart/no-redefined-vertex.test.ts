/**
 * The rule `flowchart/no-redefined-vertex`, on the examples of its document and on the
 * fixtures that record what mermaid.js does with a vertex written again.
 */
import { noRedefinedVertex } from "../../../src/rules/flowchart/no-redefined-vertex.ts"
import { testRule } from "../../rule-test.ts"

testRule("flowchart/no-redefined-vertex", noRedefinedVertex)
