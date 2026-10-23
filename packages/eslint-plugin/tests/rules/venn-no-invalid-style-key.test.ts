/**
 * The rule `venn-no-invalid-style-key`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { vennNoInvalidStyleKey } from "../../src/rules/venn-no-invalid-style-key.ts"
import { testRule } from "../rule-test.ts"

testRule("venn-no-invalid-style-key", vennNoInvalidStyleKey)
