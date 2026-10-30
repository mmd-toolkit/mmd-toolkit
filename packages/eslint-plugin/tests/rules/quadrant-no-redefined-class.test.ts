/**
 * The rule `quadrant-no-redefined-class`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { quadrantNoRedefinedClass } from "../../src/rules/quadrant-no-redefined-class.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-redefined-class", quadrantNoRedefinedClass)
