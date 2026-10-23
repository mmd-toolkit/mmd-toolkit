/**
 * The rule `c4-no-redefined-element`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { c4NoRedefinedElement } from "../../src/rules/c4-no-redefined-element.ts"
import { testRule } from "../rule-test.ts"

testRule("c4-no-redefined-element", c4NoRedefinedElement)
