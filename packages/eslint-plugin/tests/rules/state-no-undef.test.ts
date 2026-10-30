/**
 * The rule `state-no-undef`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { stateNoUndef } from "../../src/rules/state-no-undef.ts"
import { testRule } from "../rule-test.ts"

testRule("state-no-undef", stateNoUndef)
