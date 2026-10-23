/**
 * The rule `quadrant-no-redefined-axis`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { quadrantNoRedefinedAxis } from "../../src/rules/quadrant-no-redefined-axis.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-redefined-axis", quadrantNoRedefinedAxis)
