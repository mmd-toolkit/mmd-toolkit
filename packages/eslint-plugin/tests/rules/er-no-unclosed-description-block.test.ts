/**
 * The rule `er-no-unclosed-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { erNoUnclosedDescriptionBlock } from "../../src/rules/er-no-unclosed-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("er-no-unclosed-description-block", erNoUnclosedDescriptionBlock)
