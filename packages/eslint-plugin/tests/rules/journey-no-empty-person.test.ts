/**
 * The rule `journey-no-empty-person`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { journeyNoEmptyPerson } from "../../src/rules/journey-no-empty-person.ts"
import { testRule } from "../rule-test.ts"

testRule("journey-no-empty-person", journeyNoEmptyPerson)
