/**
 * The rule `c4-no-undef`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { c4NoUndef } from "../../src/rules/c4-no-undef.ts"
import { testRule } from "../rule-test.ts"

testRule("c4-no-undef", c4NoUndef)
