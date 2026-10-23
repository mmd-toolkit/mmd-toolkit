/**
 * The rule `class-no-redefined-class`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { classNoRedefinedClass } from "../../src/rules/class-no-redefined-class.ts"
import { testRule } from "../rule-test.ts"

testRule("class-no-redefined-class", classNoRedefinedClass)
