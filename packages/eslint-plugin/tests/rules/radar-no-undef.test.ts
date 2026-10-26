/** The rule on its document examples and fixtures. */
import { radarNoUndef } from "../../src/rules/radar-no-undef.ts"
import { testRule } from "../rule-test.ts"

testRule("radar-no-undef", radarNoUndef)
