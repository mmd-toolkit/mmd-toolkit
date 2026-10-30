/** The rule on its document examples and fixtures. */
import { wardleyNoDuplicateEvolve } from "../../src/rules/wardley-no-duplicate-evolve.ts"
import { testRule } from "../rule-test.ts"

testRule("wardley-no-duplicate-evolve", wardleyNoDuplicateEvolve)
