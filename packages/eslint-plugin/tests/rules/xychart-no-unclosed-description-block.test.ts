/**
 * The rule `xychart-no-unclosed-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { xychartNoUnclosedDescriptionBlock } from "../../src/rules/xychart-no-unclosed-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "xychart-no-unclosed-description-block",
  xychartNoUnclosedDescriptionBlock,
)
