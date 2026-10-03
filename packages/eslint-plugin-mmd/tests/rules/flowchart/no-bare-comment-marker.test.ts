/**
 * The rule `flowchart/no-bare-comment-marker`, on the examples of its document and on the
 * fixtures that record what mermaid.js does with a line that holds only `%%`.
 */
import { noBareCommentMarker } from "../../../src/rules/flowchart/no-bare-comment-marker.ts"
import { testRule } from "../../rule-test.ts"

testRule("flowchart/no-bare-comment-marker", noBareCommentMarker, {
  claims: {
    removeMarker: { kind: "removesVertex", id: "%%" },
    removeTextLine: { kind: "removesBareMarkerLine" },
    removeDataLine: { kind: "removesBareMarkerLine" },
    removeCallbackLine: {
      kind: "notShownByDb",
      what: "the name of the function that `click` calls",
    },
  },
  notShownByDb: {
    "invalid/click-call-arguments-line":
      "the arguments of the call that `click` makes",
  },
})
