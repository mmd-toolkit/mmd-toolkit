import { describe, expect, it } from "vitest"
import { withArticle } from "../src/check-tree/problems.ts"
import { NODE_FIELDS } from "../src/check-tree/node-fields.ts"

// The article of a name in a message of the check of a tree: `an` before a name
// that starts with A, E, I, or O, `a` before any other.

describe("withArticle", () => {
  it("puts `an` before the names that start with A, E, I, or O", () => {
    expect(withArticle("Identifier")).toBe("an Identifier")
    expect(withArticle("ArchitectureLiteral")).toBe("an ArchitectureLiteral")
    expect(withArticle("EventmodelingLiteral")).toBe("an EventmodelingLiteral")
    expect(withArticle("InfoLiteral")).toBe("an InfoLiteral")
    expect(withArticle("OrderedList")).toBe("an OrderedList")
    expect(withArticle("icon")).toBe("an icon")
    expect(withArticle("accTitle")).toBe("an accTitle")
  })

  it("puts `a` before the names that start with any other letter, U included", () => {
    expect(withArticle("Punctuator")).toBe("a Punctuator")
    expect(withArticle("RequirementIdentifier")).toBe("a RequirementIdentifier")
    expect(withArticle("UsecaseLiteral")).toBe("a UsecaseLiteral")
    expect(withArticle("shape")).toBe("a shape")
  })

  it("is right for every node type: the only types that start with U are the usecase diagram's, which are read as `you`", () => {
    const types = Object.keys(NODE_FIELDS)
    for (const type of types.filter((name) => name.startsWith("U"))) {
      expect(type.startsWith("Usecase"), type).toBe(true)
    }
    for (const type of types) {
      const article = "AEIO".includes(type.charAt(0)) ? "an" : "a"
      expect(withArticle(type), type).toBe(`${article} ${type}`)
    }
  })
})
