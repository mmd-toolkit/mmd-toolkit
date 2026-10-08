/**
 * The rule `sequence-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { sequenceNoDuplicateDescription } from "../../src/rules/sequence-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("sequence-no-duplicate-description", sequenceNoDuplicateDescription)
