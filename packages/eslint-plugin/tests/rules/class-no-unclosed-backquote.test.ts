/**
 * The rule `class-no-unclosed-backquote`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { classNoUnclosedBackquote } from "../../src/rules/class-no-unclosed-backquote.ts"
import { testRule } from "../rule-test.ts"

testRule("class-no-unclosed-backquote", classNoUnclosedBackquote)
