/**
 * The rule `c4-no-useless-argument`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { c4NoUselessArgument } from "../../src/rules/c4-no-useless-argument.ts"
import { testRule } from "../rule-test.ts"

testRule("c4-no-useless-argument", c4NoUselessArgument)
