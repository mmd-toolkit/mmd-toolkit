/**
 * The rule `flowchart/no-duplicate-description`, on the examples of its document and on the
 * fixtures that record what mermaid.js does with statements that set the description.
 */
import { noDuplicateDescription } from "../../../src/rules/flowchart/no-duplicate-description.ts"
import { testRule } from "../../rule-test.ts"

testRule("flowchart/no-duplicate-description", noDuplicateDescription, {
  claims: {
    // The last description is the one that mermaid.js uses.
    removePrevious: { kind: "keepsField", field: "accDescr" },
    removeThis: { kind: "usesLastRemaining", field: "accDescr" },
  },
})
