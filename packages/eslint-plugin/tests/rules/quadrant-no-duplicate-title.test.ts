/**
 * The rule `quadrant-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { quadrantNoDuplicateTitle } from "../../src/rules/quadrant-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-duplicate-title", quadrantNoDuplicateTitle)
