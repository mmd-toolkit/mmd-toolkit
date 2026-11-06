import { describe, expect, it } from "vitest"
import { dataBlockEmbeddedForFormattingComparison } from "./data-block-margins.ts"

describe("data blocks' permitted uniform margins", () => {
  it.each([
    {
      name: "unchanged inline and empty blocks",
      before: "@{ label: Alpha }",
      after: "@{ label: Alpha }",
    },
    {
      name: "an inline block padded with one space inside each end",
      before: "@{label: Alpha}",
      after: "@{ label: Alpha }",
    },
    {
      name: "an inline block whose spaces and tabs at the ends are replaced",
      before: "@{ \t label: Alpha\t  }",
      after: "@{ label: Alpha }",
    },
    {
      name: "an inline block that starts with a no-break space inside",
      before: "@{\u00a0label: Alpha}",
      after: "@{ \u00a0label: Alpha }",
    },
    {
      name: "an inward move with relative indentation",
      before: "@{\ncustom:\n  nested: yes\n}",
      after: "@{\n    custom:\n      nested: yes\n  }",
    },
    {
      name: "an outward move and a closer at the column of the statement",
      before: "@{\n        label: Alpha\n  }",
      after: "@{\n    label: Alpha\n  }",
    },
    {
      name: "a closer on the last body line",
      before: "@{\n      label: Alpha }",
      after: "@{\n    label: Alpha }",
    },
    {
      name: "space-only rows shifted inward and empty rows kept empty",
      before: "@{\nlabel: |+\n  alpha  \n    \n\n  beta\n}",
      after: "@{\n    label: |+\n      alpha  \n        \n\n      beta\n  }",
    },
    {
      name: "space-only rows shortened or emptied by an outward move",
      before:
        "@{\n      label: |+\n        alpha\n          \n \n\n        beta\n}",
      after: "@{\n    label: |+\n      alpha\n        \n\n\n      beta\n  }",
    },
    {
      name: "trailing whitespace and interior tabs preserved",
      before: "@{\nlabel: alpha\tbeta \t\n}",
      after: "@{\n    label: alpha\tbeta \t\n  }",
    },
    {
      name: "only the separate closer moving",
      before: "@{\n    label: Alpha\n}",
      after: "@{\n    label: Alpha\n  }",
    },
  ])("accepts $name", ({ before, after }) => {
    expect(dataBlockEmbeddedForFormattingComparison([before], [after])).toEqual(
      [before],
    )
  })

  it.each([
    {
      name: "a closer with a tab before it",
      before: "@{\nlabel: |+\n  alpha\n}",
      after: "@{\n    label: |+\n      alpha\n\t}",
    },
    {
      name: "a closer with a no-break space before it",
      before: "@{\nlabel: |+\n  alpha\n}",
      after: "@{\n    label: |+\n      alpha\n\u00a0  }",
    },
    {
      name: "a closer deeper than the text moving to the statement",
      before: "@{\nlabel: |\n  alpha\n        }",
      after: "@{\n    label: |\n      alpha\n  }",
    },
    {
      name: "changed content",
      before: "@{\nlabel: Alpha\n}",
      after: "@{\n    label: Beta\n  }",
    },
    {
      name: "an added line",
      before: "@{\nlabel: Alpha\n}",
      after: "@{\n    label: Alpha\n\n  }",
    },
    {
      name: "a removed line",
      before: "@{\nlabel: Alpha\n\n}",
      after: "@{\n    label: Alpha\n  }",
    },
    {
      name: "different movement on different body lines",
      before: "@{\ncustom:\n  nested: yes\n}",
      after: "@{\n    custom:\n     nested: yes\n  }",
    },
    {
      name: "an independently moved space-only row",
      before: "@{\nlabel: |+\n  alpha\n    \n}",
      after: "@{\n    label: |+\n      alpha\n      \n  }",
    },
    {
      name: "spaces added to an empty row",
      before: "@{\nlabel: Alpha\n\n}",
      after: "@{\n    label: Alpha\n    \n  }",
    },
    {
      name: "a text row replaced by a blank row",
      before: "@{\nlabel: Alpha\n}",
      after: "@{\n    \n  }",
    },
    {
      name: "changed trailing whitespace",
      before: "@{\nlabel: Alpha \t\n}",
      after: "@{\n    label: Alpha\n  }",
    },
    {
      name: "changed opening text",
      before: "@{\nlabel: Alpha\n}",
      after: "@{ \n    label: Alpha\n  }",
    },
    {
      name: "a tab substituted for body spaces",
      before: "@{\nlabel: Alpha\n}",
      after: "@{\n\tlabel: Alpha\n  }",
    },
    {
      name: "a closer moved onto the last body line",
      before: "@{\nlabel: Alpha\n}",
      after: "@{\n    label: Alpha }\n",
    },
    {
      name: "an inline block padded with two spaces",
      before: "@{ label: Alpha }",
      after: "@{  label: Alpha }",
    },
    {
      name: "an inline block changed inside",
      before: "@{label: Alpha}",
      after: "@{ label: Beta }",
    },
    {
      name: "an inline block with a no-break space removed at its end",
      before: "@{label: Alpha\u00a0}",
      after: "@{ label: Alpha }",
    },
    {
      name: "an inline block of spaces only",
      before: "@{   }",
      after: "@{ }",
    },
    {
      name: "an inline block of one line made several",
      before: "@{label: Alpha}",
      after: "@{\nlabel: Alpha\n}",
    },
    {
      name: "changed spaces in a block without body text",
      before: "@{\n \n}",
      after: "@{\n   \n  }",
    },
  ])("leaves $name visible", ({ before, after }) => {
    expect(dataBlockEmbeddedForFormattingComparison([before], [after])).toEqual(
      [after],
    )
  })

  it("keeps order, changed directives and extra entries visible without mutation", () => {
    const before = ["%%{init: {}}%%", "@{\nlabel: Alpha\n}"]
    const after = [
      "%%{init: {x: 1}}%%",
      "@{\n    label: Alpha\n  }",
      "@{ label: Beta }",
    ]
    const originalBefore = [...before]
    const originalAfter = [...after]
    expect(dataBlockEmbeddedForFormattingComparison(before, after)).toEqual([
      after[0],
      before[1],
      after[2],
    ])
    expect(
      dataBlockEmbeddedForFormattingComparison(before, after.toReversed()),
    ).toEqual([after[2], before[1], after[0]])
    expect(dataBlockEmbeddedForFormattingComparison(before, [])).toEqual([])
    expect(before).toEqual(originalBefore)
    expect(after).toEqual(originalAfter)
  })
})
