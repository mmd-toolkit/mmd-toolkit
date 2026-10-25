/** The rule on its document examples and fixture files. */
import { architectureNoUngroupedModifier } from "../../src/rules/architecture-no-ungrouped-modifier.ts"
import { testRule } from "../rule-test.ts"

testRule("architecture-no-ungrouped-modifier", architectureNoUngroupedModifier)
