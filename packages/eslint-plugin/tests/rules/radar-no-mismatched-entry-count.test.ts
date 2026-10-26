/** The rule on its document examples and fixtures. */
import { radarNoMismatchedEntryCount } from "../../src/rules/radar-no-mismatched-entry-count.ts"
import { testRule } from "../rule-test.ts"

testRule("radar-no-mismatched-entry-count", radarNoMismatchedEntryCount)
