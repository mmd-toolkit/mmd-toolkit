/**
 * The rule `sequence-no-link-without-separator`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { sequenceNoLinkWithoutSeparator } from "../../src/rules/sequence-no-link-without-separator.ts"
import { testRule } from "../rule-test.ts"

testRule("sequence-no-link-without-separator", sequenceNoLinkWithoutSeparator)
