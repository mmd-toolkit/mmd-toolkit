/**
 * The rule `sequence-no-unclosed-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { sequenceNoUnclosedDescriptionBlock } from "../../src/rules/sequence-no-unclosed-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "sequence-no-unclosed-description-block",
  sequenceNoUnclosedDescriptionBlock,
)
