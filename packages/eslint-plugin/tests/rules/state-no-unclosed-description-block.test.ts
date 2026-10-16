/**
 * The rule `state-no-unclosed-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { stateNoUnclosedDescriptionBlock } from "../../src/rules/state-no-unclosed-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("state-no-unclosed-description-block", stateNoUnclosedDescriptionBlock)
