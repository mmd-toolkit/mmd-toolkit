/**
 * The rule `quadrant-no-duplicate-style`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { quadrantNoDuplicateStyle } from "../../src/rules/quadrant-no-duplicate-style.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-duplicate-style", quadrantNoDuplicateStyle)
