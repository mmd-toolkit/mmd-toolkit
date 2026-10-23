/** The rule `usecase-no-duplicate-direction`, on its document examples and fixture inputs. */
import { usecaseNoDuplicateDirection } from "../../src/rules/usecase-no-duplicate-direction.ts"
import { testRule } from "../rule-test.ts"

testRule("usecase-no-duplicate-direction", usecaseNoDuplicateDirection)
