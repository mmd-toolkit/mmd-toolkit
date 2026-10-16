/**
 * The rule `flowchart-no-undef`, on the examples of its document and
 * on the inputs of its fixture directory.
 */
import { flowchartNoUndef } from "../../src/rules/flowchart-no-undef.ts"
import { testRule } from "../rule-test.ts"

testRule("flowchart-no-undef", flowchartNoUndef)
