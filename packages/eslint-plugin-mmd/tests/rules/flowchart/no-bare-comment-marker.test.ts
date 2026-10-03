/**
 * The rule `flowchart/no-bare-comment-marker`, on the examples of its document and on the
 * fixtures that record what mermaid.js does with a line that holds only `%%`.
 */
import { noBareCommentMarker } from "../../../src/rules/flowchart/no-bare-comment-marker.ts"
import { testRule } from "../../rule-test.ts"

testRule("flowchart/no-bare-comment-marker", noBareCommentMarker)
