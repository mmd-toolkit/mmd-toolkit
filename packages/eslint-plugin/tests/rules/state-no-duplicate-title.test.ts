/**
 * The rule `state-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { stateNoDuplicateTitle } from "../../src/rules/state-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("state-no-duplicate-title", stateNoDuplicateTitle)
