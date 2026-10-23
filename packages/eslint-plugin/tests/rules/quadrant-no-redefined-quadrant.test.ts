/**
 * The rule `quadrant-no-redefined-quadrant`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { quadrantNoRedefinedQuadrant } from "../../src/rules/quadrant-no-redefined-quadrant.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-redefined-quadrant", quadrantNoRedefinedQuadrant)
