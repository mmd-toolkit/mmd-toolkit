/**
 * The rule `gantt-no-undef`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { ganttNoUndef } from "../../src/rules/gantt-no-undef.ts"
import { testRule } from "../rule-test.ts"

testRule("gantt-no-undef", ganttNoUndef)
