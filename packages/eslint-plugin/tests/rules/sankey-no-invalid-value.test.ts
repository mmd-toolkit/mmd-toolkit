/**
 * The rule `sankey-no-invalid-value`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { sankeyNoInvalidValue } from "../../src/rules/sankey-no-invalid-value.ts"
import { testRule } from "../rule-test.ts"

testRule("sankey-no-invalid-value", sankeyNoInvalidValue)
