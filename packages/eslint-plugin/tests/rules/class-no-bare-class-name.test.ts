/**
 * The rule `class-no-bare-class-name`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { classNoBareClassName } from "../../src/rules/class-no-bare-class-name.ts"
import { testRule } from "../rule-test.ts"

testRule("class-no-bare-class-name", classNoBareClassName)
