/**
 * The rule `requirement-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { requirementNoEmptyDescriptionBlock } from "../../src/rules/requirement-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule(
  "requirement-no-empty-description-block",
  requirementNoEmptyDescriptionBlock,
)
