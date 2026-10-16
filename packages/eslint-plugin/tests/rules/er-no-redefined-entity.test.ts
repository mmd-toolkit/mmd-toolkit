/**
 * The rule `er-no-redefined-entity`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { erNoRedefinedEntity } from "../../src/rules/er-no-redefined-entity.ts"
import { testRule } from "../rule-test.ts"

testRule("er-no-redefined-entity", erNoRedefinedEntity)
