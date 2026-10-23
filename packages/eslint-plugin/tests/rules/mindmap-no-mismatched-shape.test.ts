/**
 * The rule `mindmap-no-mismatched-shape`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { mindmapNoMismatchedShape } from "../../src/rules/mindmap-no-mismatched-shape.ts"
import { testRule } from "../rule-test.ts"

testRule("mindmap-no-mismatched-shape", mindmapNoMismatchedShape)
