/**
 * The rule `class-no-undef`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { classNoUndef } from "../../src/rules/class-no-undef.ts"
import { testRule } from "../rule-test.ts"

testRule("class-no-undef", classNoUndef)
