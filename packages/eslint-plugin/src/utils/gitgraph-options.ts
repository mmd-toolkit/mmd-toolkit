import type {
  GitgraphCommitStatement,
  GitgraphIdOption,
  GitgraphMessageOption,
  GitgraphMergeStatement,
  GitgraphParentOption,
  GitgraphTagOption,
  GitgraphTypeOption,
} from "@mmd-toolkit/parser"
import { normalizeLineTerminators } from "./acc-text.ts"

/** A single-valued option, compared without mermaid.js's preprocessing. */
interface ScalarOption {
  readonly name: "id" | "type" | "parent"
  readonly value: string
}

/** Tags accumulate and messages are not drawn; neither replaces a scalar value. */
export function gitgraphScalarOption(
  option:
    | GitgraphIdOption
    | GitgraphTypeOption
    | GitgraphParentOption
    | GitgraphTagOption
    | GitgraphMessageOption,
): ScalarOption | null {
  switch (option.type) {
    case "GitgraphIdOption":
      return { name: "id", value: normalizeLineTerminators(option.value.value) }
    case "GitgraphParentOption":
      return {
        name: "parent",
        value: normalizeLineTerminators(option.value.value),
      }
    case "GitgraphTypeOption":
      return { name: "type", value: option.value }
    default:
      return null
  }
}

/** The final authored id; an absent or empty id creates an anonymous commit. */
export function finalGitgraphId(
  statement: GitgraphCommitStatement | GitgraphMergeStatement,
): string {
  let id = ""
  for (const option of statement.options) {
    const scalar = gitgraphScalarOption(option)
    if (scalar?.name === "id") id = scalar.value
  }
  return id
}
