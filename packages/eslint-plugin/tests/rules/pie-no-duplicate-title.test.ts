/** The rule on its document examples and fixture inputs. */
import { pieNoDuplicateTitle } from "../../src/rules/pie-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("pie-no-duplicate-title", pieNoDuplicateTitle)
