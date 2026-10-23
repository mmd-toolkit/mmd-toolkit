/**
 * The rule `state-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { stateNoDuplicateDescription } from "../../src/rules/state-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("state-no-duplicate-description", stateNoDuplicateDescription)
