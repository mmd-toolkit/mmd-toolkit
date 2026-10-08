/**
 * The rule `sequence-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { sequenceNoDuplicateTitle } from "../../src/rules/sequence-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("sequence-no-duplicate-title", sequenceNoDuplicateTitle)
