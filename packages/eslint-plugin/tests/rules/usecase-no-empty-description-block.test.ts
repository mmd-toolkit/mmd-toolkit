/** The rule `usecase-no-empty-description-block`, on its document examples and fixture inputs. */
import { usecaseNoEmptyDescriptionBlock } from "../../src/rules/usecase-no-empty-description-block.ts"
import { testRule } from "../rule-test.ts"

testRule("usecase-no-empty-description-block", usecaseNoEmptyDescriptionBlock)
