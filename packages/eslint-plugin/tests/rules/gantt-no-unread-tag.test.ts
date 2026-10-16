/**
 * The rule `gantt-no-unread-tag`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { ganttNoUnreadTag } from "../../src/rules/gantt-no-unread-tag.ts"
import { testRule } from "../rule-test.ts"

testRule("gantt-no-unread-tag", ganttNoUnreadTag)
