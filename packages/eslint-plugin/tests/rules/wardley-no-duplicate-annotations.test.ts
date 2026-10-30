/** The rule on its document examples and fixtures. */
import { wardleyNoDuplicateAnnotations } from "../../src/rules/wardley-no-duplicate-annotations.ts"
import { testRule } from "../rule-test.ts"

testRule("wardley-no-duplicate-annotations", wardleyNoDuplicateAnnotations)
