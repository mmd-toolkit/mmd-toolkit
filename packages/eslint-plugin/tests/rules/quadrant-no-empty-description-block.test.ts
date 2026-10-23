/**
 * The rule `quadrant-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { quadrantNoEmptyDescriptionBlock } from "../../src/rules/quadrant-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-empty-description-block", quadrantNoEmptyDescriptionBlock)
