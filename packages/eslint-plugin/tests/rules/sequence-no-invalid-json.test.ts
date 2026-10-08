/**
 * The rule `sequence-no-invalid-json`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { sequenceNoInvalidJson } from "../../src/rules/sequence-no-invalid-json.ts"
import { testRule } from "../rule-test.ts"

testRule("sequence-no-invalid-json", sequenceNoInvalidJson)
