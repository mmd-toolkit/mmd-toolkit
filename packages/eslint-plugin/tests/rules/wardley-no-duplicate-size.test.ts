/** The rule on its document examples and fixtures. */
import { wardleyNoDuplicateSize } from "../../src/rules/wardley-no-duplicate-size.ts"
import { testRule } from "../rule-test.ts"

testRule("wardley-no-duplicate-size", wardleyNoDuplicateSize)
