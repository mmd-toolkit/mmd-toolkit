/** The rule on its document examples and fixtures. */
import { wardleyNoDuplicateEvolution } from "../../src/rules/wardley-no-duplicate-evolution.ts"
import { testRule } from "../rule-test.ts"

testRule("wardley-no-duplicate-evolution", wardleyNoDuplicateEvolution)
