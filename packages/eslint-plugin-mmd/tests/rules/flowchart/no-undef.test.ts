/**
 * The rule `flowchart/no-undef`, on the examples of its document and on the
 * fixtures that record what mermaid.js does with a `style`, `class`, or
 * `click` statement whose id names nothing of the diagram.
 */
import { noUndef } from "../../../src/rules/flowchart/no-undef.ts"
import { testRule } from "../../rule-test.ts"

testRule("flowchart/no-undef", noUndef)
