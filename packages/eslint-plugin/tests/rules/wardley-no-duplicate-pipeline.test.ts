/** The rule on its document examples and fixtures. */
import { wardleyNoDuplicatePipeline } from "../../src/rules/wardley-no-duplicate-pipeline.ts"
import { testRule } from "../rule-test.ts"

testRule("wardley-no-duplicate-pipeline", wardleyNoDuplicatePipeline)
