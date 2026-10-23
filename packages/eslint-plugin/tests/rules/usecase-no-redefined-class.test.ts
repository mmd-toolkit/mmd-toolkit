/** The rule `usecase-no-redefined-class`, on its document examples and fixture inputs. */
import { usecaseNoRedefinedClass } from "../../src/rules/usecase-no-redefined-class.ts"
import { testRule } from "../rule-test.ts"

testRule("usecase-no-redefined-class", usecaseNoRedefinedClass)
