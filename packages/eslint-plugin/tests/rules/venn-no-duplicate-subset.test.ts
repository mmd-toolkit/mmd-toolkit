/**
 * The rule `venn-no-duplicate-subset`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { vennNoDuplicateSubset } from "../../src/rules/venn-no-duplicate-subset.ts"
import { testRule } from "../rule-test.ts"

testRule("venn-no-duplicate-subset", vennNoDuplicateSubset)
