import type {
  RequirementElementStatement,
  RequirementRequirementStatement,
} from "@mmd-toolkit/parser"

/** A statement that defines a requirement or an element, with a body. */
export type BoxStatement =
  RequirementRequirementStatement | RequirementElementStatement

/** An item of the body of a requirement or an element. */
type BodyItem = BoxStatement["body"][number]

/** A field that an item of a body sets: its keyword in lower case and its value. */
export interface Field {
  readonly name: string
  readonly value: string
}

/**
 * The field that `item` sets, or null for an item that sets none (an empty
 * description block). The value is the text of a literal or the content of a
 * string, without the whitespace at its ends; `risk` and `verifyMethod` have
 * their keyword in lower case.
 */
export function fieldOf(item: BodyItem): Field | null {
  if (
    item.type === "RequirementValueField" ||
    item.type === "RequirementElementField"
  ) {
    return { name: item.field, value: item.value.value.trim() }
  }
  if (item.type === "RequirementRiskField") {
    return { name: "risk", value: item.risk }
  }
  if (item.type === "RequirementVerifyMethodField") {
    return { name: "verifymethod", value: item.verifyMethod }
  }
  return null
}
