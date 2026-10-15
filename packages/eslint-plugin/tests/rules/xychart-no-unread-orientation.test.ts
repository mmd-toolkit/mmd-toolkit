/**
 * The rule `xychart-no-unread-orientation`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { xychartNoUnreadOrientation } from "../../src/rules/xychart-no-unread-orientation.ts"
import { testRule } from "../rule-test.ts"

testRule("xychart-no-unread-orientation", xychartNoUnreadOrientation)
