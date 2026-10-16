/**
 * The rule `class-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { classNoDuplicateTitle } from "../../src/rules/class-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("class-no-duplicate-title", classNoDuplicateTitle)
