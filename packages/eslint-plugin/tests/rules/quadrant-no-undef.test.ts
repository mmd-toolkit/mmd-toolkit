/**
 * The rule `quadrant-no-undef`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { quadrantNoUndef } from "../../src/rules/quadrant-no-undef.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-undef", quadrantNoUndef)
