/**
 * The rule `gantt-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { ganttNoEmptyDescriptionBlock } from "../../src/rules/gantt-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("gantt-no-empty-description-block", ganttNoEmptyDescriptionBlock)
