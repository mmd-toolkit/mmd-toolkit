/**
 * The rule `xychart-no-empty-description-block`, on the examples of its document and on the
 * inputs of its fixture directory.
 */

import { xychartNoEmptyDescriptionBlock } from "../../src/rules/xychart-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("xychart-no-empty-description-block", xychartNoEmptyDescriptionBlock)
