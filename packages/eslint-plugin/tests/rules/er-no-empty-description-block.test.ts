/**
 * The rule `er-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { erNoEmptyDescriptionBlock } from "../../src/rules/er-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("er-no-empty-description-block", erNoEmptyDescriptionBlock)
