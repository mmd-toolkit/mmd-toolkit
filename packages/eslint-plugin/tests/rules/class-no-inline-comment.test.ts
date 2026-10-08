/**
 * The rule `class-no-inline-comment`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { classNoInlineComment } from "../../src/rules/class-no-inline-comment.ts"
import { testRule } from "../rule-test.ts"

testRule("class-no-inline-comment", classNoInlineComment)
