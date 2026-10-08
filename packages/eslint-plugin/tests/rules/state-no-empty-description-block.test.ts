/**
 * The rule `state-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { stateNoEmptyDescriptionBlock } from "../../src/rules/state-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("state-no-empty-description-block", stateNoEmptyDescriptionBlock)
