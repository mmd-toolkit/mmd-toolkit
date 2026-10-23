/**
 * The rule `requirement-no-unclosed-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { requirementNoUnclosedDescriptionBlock } from "../../src/rules/requirement-no-unclosed-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "requirement-no-unclosed-description-block",
  requirementNoUnclosedDescriptionBlock,
)
