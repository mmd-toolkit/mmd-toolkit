/**
 * The rule `c4-no-invalid-attribute-key`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { c4NoInvalidAttributeKey } from "../../src/rules/c4-no-invalid-attribute-key.ts"
import { testRule } from "../rule-test.ts"

testRule("c4-no-invalid-attribute-key", c4NoInvalidAttributeKey)
