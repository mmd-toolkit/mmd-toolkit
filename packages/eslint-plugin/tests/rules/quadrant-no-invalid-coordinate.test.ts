/**
 * The rule `quadrant-no-invalid-coordinate`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { quadrantNoInvalidCoordinate } from "../../src/rules/quadrant-no-invalid-coordinate.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-invalid-coordinate", quadrantNoInvalidCoordinate)
