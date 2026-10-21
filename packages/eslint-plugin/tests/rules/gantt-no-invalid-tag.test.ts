/**
 * The rule `gantt-no-invalid-tag`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { ganttNoInvalidTag } from "../../src/rules/gantt-no-invalid-tag.ts"
import { testRule } from "../rule-test.ts"

testRule("gantt-no-invalid-tag", ganttNoInvalidTag)
