/**
 * The rule `quadrant-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { quadrantNoDuplicateDescription } from "../../src/rules/quadrant-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-duplicate-description", quadrantNoDuplicateDescription)
