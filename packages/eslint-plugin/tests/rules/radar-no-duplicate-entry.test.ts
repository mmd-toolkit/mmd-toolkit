/** The rule on its document examples and fixtures. */
import { radarNoDuplicateEntry } from "../../src/rules/radar-no-duplicate-entry.ts"
import { testRule } from "../rule-test.ts"

testRule("radar-no-duplicate-entry", radarNoDuplicateEntry)
