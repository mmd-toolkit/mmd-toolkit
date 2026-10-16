/**
 * The rule `sequence-no-create-destroy`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { sequenceNoCreateDestroy } from "../../src/rules/sequence-no-create-destroy.ts"
import { testRule } from "../rule-test.ts"

testRule("sequence-no-create-destroy", sequenceNoCreateDestroy)
