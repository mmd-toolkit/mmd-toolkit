import { describe, expect, it } from "vitest"
import type { DbSummary, JsonObject } from "@mmd-toolkit/tests"
import { dbOfText, defaultEmbedded } from "./db-reading.ts"
import { stateDbForFormattingComparison } from "./state-note-margins.ts"

describe("state's permitted attached-note margins", () => {
  it.each([
    {
      name: "inline emphasis",
      before:
        "stateDiagram-v2\nnote right of A\nPay **by card\n            or wallet**.\nend note\n",
      after:
        "stateDiagram-v2\n  note right of A\n    Pay **by card\n    or wallet**.\n  end note\n",
    },
    {
      name: "same-line code",
      before:
        "stateDiagram-v2\nnote right of A\nUse `card` or ``wallet``.\n            Receipt follows.\nend note\n",
      after:
        "stateDiagram-v2\n  note right of A\n    Use `card` or ``wallet``.\n    Receipt follows.\n  end note\n",
    },
    {
      name: "inline HTML breaks",
      before:
        "stateDiagram-v2\nnote right of A\nPayment<br/>confirmed\n            Receipt sent\nend note\n",
      after:
        "stateDiagram-v2\n  note right of A\n    Payment<br/>confirmed\n    Receipt sent\n  end note\n",
    },
    {
      name: "outer blank rows and tab padding",
      before:
        "stateDiagram-v2\nnote right of A\n\n\tFirst\n second\n     \n\nend note\n",
      after:
        "stateDiagram-v2\n  note right of A\n\n    First\n    second\n     \n\n  end note\n",
    },
    {
      name: "literal markers within an indented paragraph",
      before:
        "stateDiagram-v2\nnote right of A\nPayment methods\n    - Card\n        - Debit\nend note\n",
      after:
        "stateDiagram-v2\n  note right of A\n    Payment methods\n    - Card\n    - Debit\n  end note\n",
    },
  ])("allows $name without changing other Db values", ({ before, after }) => {
    const beforeDb = dbOfText(before, defaultEmbedded())
    const afterDb = dbOfText(after, defaultEmbedded())
    expect(afterDb).not.toEqual(beforeDb)
    expect(
      stateDbForFormattingComparison(beforeDb, afterDb, before, after),
    ).toEqual(beforeDb)
  })

  it("aligns the first markup row while requiring exact raw Db equality", () => {
    const beforeSource =
      "stateDiagram-v2\nPaid\nnote right of Paid\n        Payment<br/>confirmed\n    Receipt sent\nend note\n"
    const afterSource =
      "stateDiagram-v2\n  Paid\n  note right of Paid\n    Payment<br/>confirmed\n    Receipt sent\n  end note\n"
    const before = dbOfText(beforeSource, defaultEmbedded())
    const after = dbOfText(afterSource, defaultEmbedded()) as DbSummary
    expect(after).toEqual(before)
    expect(
      stateDbForFormattingComparison(before, after, beforeSource, afterSource),
    ).toEqual(after)
    const notes = after.notes as JsonObject[]
    const incorrect: DbSummary = {
      ...after,
      notes: [{ ...notes[0], text: "Payment<br/>confirmed\n Receipt sent" }],
    }
    expect(
      stateDbForFormattingComparison(
        before,
        incorrect,
        beforeSource,
        afterSource,
      ),
    ).toEqual(incorrect)
  })

  it("aligns a trimmed first-row tab while retaining later markup margins", () => {
    const beforeSource =
      "stateDiagram-v2\nnote right of A\n\t<pre>Payment\n            confirmed</pre>\nend note\n"
    const afterSource =
      "stateDiagram-v2\n  note right of A\n    <pre>Payment\n            confirmed</pre>\n  end note\n"
    const before = dbOfText(beforeSource, defaultEmbedded())
    const after = dbOfText(afterSource, defaultEmbedded())
    expect(after).toEqual(before)
    expect(
      stateDbForFormattingComparison(before, after, beforeSource, afterSource),
    ).toEqual(after)
  })

  it("matches a protected tab margin while requiring exact raw Db equality", () => {
    const beforeSource =
      "stateDiagram-v2\nnote right of A\n        Card payments\n \t  \n\t\tfinish immediately.\nend note\n"
    const afterSource =
      "stateDiagram-v2\n  note right of A\n\t\tCard payments\n \t  \n\t\tfinish immediately.\n  end note\n"
    const before = dbOfText(beforeSource, defaultEmbedded())
    const after = dbOfText(afterSource, defaultEmbedded())
    expect(after).toEqual(before)
    expect(
      stateDbForFormattingComparison(before, after, beforeSource, afterSource),
    ).toEqual(after)
  })

  it("checks nested notes in source order, leaving inline notes and raw Dbs intact", () => {
    const beforeSource =
      "stateDiagram-v2\nnote left of A : kept\nstate S {\nnote right of B\ncard & wallet \n   online payments  \nend note\n}\nnote left of C\n  final prose\nend note\n"
    const afterSource =
      "stateDiagram-v2\n  note left of A : kept\n  state S {\n    note right of B\n      card & wallet \n      online payments  \n    end note\n  }\n  note left of C\nfinal prose\n  end note\n"
    const before = dbOfText(beforeSource, defaultEmbedded())
    const after = dbOfText(afterSource, defaultEmbedded())
    const originalBefore = structuredClone(before)
    const originalAfter = structuredClone(after)
    expect(
      stateDbForFormattingComparison(before, after, beforeSource, afterSource),
    ).toEqual(before)
    expect(before).toEqual(originalBefore)
    expect(after).toEqual(originalAfter)
  })

  it("accepts the formatter's existing line-ending conversion", () => {
    const beforeSource =
      "stateDiagram-v2\r\nnote right of A\r\nfirst line\r\n second line\r\nend note\r\n"
    const afterSource =
      "stateDiagram-v2\n  note right of A\n    first line\n    second line\n  end note\n"
    expect(
      stateDbForFormattingComparison(
        dbOfText(beforeSource, defaultEmbedded()),
        dbOfText(afterSource, defaultEmbedded()),
        beforeSource,
        afterSource,
      ),
    ).toEqual(dbOfText(beforeSource, defaultEmbedded()))
  })

  it("separates surrounding statements and structural Unicode whitespace from the body", () => {
    const beforeSource =
      "stateDiagram-v2\nPaid note right of Paid\u00a0\nfirst\n second\n\u00a0end note Other\n"
    const afterSource =
      "stateDiagram-v2\n  Paid\n  note right of Paid\n    first\n    second\n  end note\n  Other\n"
    expect(
      stateDbForFormattingComparison(
        dbOfText(beforeSource, defaultEmbedded()),
        dbOfText(afterSource, defaultEmbedded()),
        beforeSource,
        afterSource,
      ),
    ).toEqual(dbOfText(beforeSource, defaultEmbedded()))
  })

  it.each([
    {
      name: "different output margins",
      before: "stateDiagram-v2\nnote right of A\nfirst\n second\nend note\n",
      after: "stateDiagram-v2\nnote right of A\n  first\n   second\nend note\n",
    },
    {
      name: "changed prose content",
      before: "stateDiagram-v2\nnote right of A\nfirst\n second\nend note\n",
      after: "stateDiagram-v2\nnote right of A\n  first\n  changed\nend note\n",
    },
    {
      name: "changed trailing whitespace",
      before: "stateDiagram-v2\nnote right of A\nfirst \n second\nend note\n",
      after: "stateDiagram-v2\nnote right of A\n  first\n  second\nend note\n",
    },
    {
      name: "a blank row",
      before: "stateDiagram-v2\nnote right of A\nfirst\n\nsecond\nend note\n",
      after:
        "stateDiagram-v2\nnote right of A\n  first\n\n  second\nend note\n",
    },
    {
      name: "removed outer blank rows",
      before: "stateDiagram-v2\nnote right of A\n\nfirst\n\nend note\n",
      after: "stateDiagram-v2\nnote right of A\n  first\nend note\n",
    },
    {
      name: "a heading after the first row",
      before: "stateDiagram-v2\nnote right of A\nIntro\n# Heading\nend note\n",
      after: "stateDiagram-v2\nnote right of A\nIntro\n  # Heading\nend note\n",
    },
    {
      name: "code spanning physical rows",
      before:
        "stateDiagram-v2\nnote right of A\nUse `card\n            here`\nend note\n",
      after:
        "stateDiagram-v2\nnote right of A\n  Use `card\n  here`\nend note\n",
    },
    {
      name: "unmatched code delimiters",
      before:
        "stateDiagram-v2\nnote right of A\nUse ``card`\n            here`\nend note\n",
      after:
        "stateDiagram-v2\nnote right of A\n  Use ``card`\n  here`\nend note\n",
    },
    {
      name: "strikethrough spanning physical rows",
      before:
        "stateDiagram-v2\nnote right of A\nPay ~~by card\n            or wallet~~.\nend note\n",
      after:
        "stateDiagram-v2\nnote right of A\n    Pay ~~by card\n    or wallet~~.\nend note\n",
    },
    {
      name: "a link",
      before:
        "stateDiagram-v2\nnote right of A\nIntro\nUse [card](pay) here\nend note\n",
      after:
        "stateDiagram-v2\nnote right of A\n  Intro\n  Use [card](pay) here\nend note\n",
    },
    {
      name: "HTML markup",
      before:
        "stateDiagram-v2\nnote right of A\nIntro\nUse <pre>card</pre> here\nend note\n",
      after:
        "stateDiagram-v2\nnote right of A\n  Intro\n  Use <pre>card</pre> here\nend note\n",
    },
    {
      name: "a backslash",
      before:
        "stateDiagram-v2\nnote right of A\nIntro\nUse \\card here\nend note\n",
      after:
        "stateDiagram-v2\nnote right of A\n  Intro\n  Use \\card here\nend note\n",
    },
    {
      name: "an empty ordered-list marker",
      before: "stateDiagram-v2\nnote right of A\n1.\n    Payment\nend note\n",
      after: "stateDiagram-v2\nnote right of A\n  1.\n  Payment\nend note\n",
    },
    {
      name: "an ordered-list marker followed by prose",
      before: "stateDiagram-v2\nnote right of A\nIntro\n1) Payment\nend note\n",
      after:
        "stateDiagram-v2\nnote right of A\nIntro\n  1) Payment\nend note\n",
    },
    {
      name: "a hard break whose following indentation remains visible",
      before:
        "stateDiagram-v2\nnote right of A\nPayment can be card,  \n            wallet too\nend note\n",
      after:
        "stateDiagram-v2\nnote right of A\n    Payment can be card,  \n    wallet too\nend note\n",
    },
    {
      name: "a non-ASCII space",
      before: "stateDiagram-v2\nnote right of A\n\u00a0Payment\nend note\n",
      after: "stateDiagram-v2\nnote right of A\n  \u00a0Payment\nend note\n",
    },
    {
      name: "an internal tab in the body",
      before:
        "stateDiagram-v2\nnote right of A\nFirst\nPayment\tconfirmed\nend note\n",
      after:
        "stateDiagram-v2\nnote right of A\n  First\n  Payment\tconfirmed\nend note\n",
    },
    {
      name: "tab padding after the first content row",
      before:
        "stateDiagram\nnote right of A\n\n\tPayment confirmed\n\t\tReceipt sent\n     \n\nend note\n",
      after:
        "stateDiagram\nnote right of A\n\n    Payment confirmed\n    Receipt sent\n     \n\nend note\n",
    },
    {
      name: "a native entity or protected semicolon",
      before: "stateDiagram-v2\nnote right of A\nPayment #35;\nend note\n",
      after: "stateDiagram-v2\nnote right of A\n  Payment #35;\nend note\n",
    },
    {
      name: "a directive",
      before:
        "stateDiagram-v2\nnote right of A\nPayment %%{wrap}%% now\nend note\n",
      after:
        "stateDiagram-v2\nnote right of A\n  Payment %%{wrap}%% now\nend note\n",
    },
    {
      name: "an inline note",
      before: "stateDiagram-v2\nnote right of A : Payment\n",
      after: "stateDiagram-v2\nnote right of A : Changed\n",
    },
    {
      name: "a note whose id starts on another line",
      before: "stateDiagram-v2\nnote right of\nA\nPayment\nend note\n",
      after: "stateDiagram-v2\nnote right of\nA\n  Payment\nend note\n",
    },
  ])("rejects $name", ({ before, after }) => {
    const beforeDb = dbOfText(before, defaultEmbedded())
    const afterDb = dbOfText(after, defaultEmbedded())
    expect(() =>
      stateDbForFormattingComparison(beforeDb, afterDb, before, after),
    ).toThrow()
  })
})

describe("state's explicit Db comparison", () => {
  const beforeSource =
    "stateDiagram-v2\nnote right of A\nfirst\n second\nend note\n"
  const afterSource =
    "stateDiagram-v2\nnote right of A\n  first\n  second\nend note\n"

  it("keeps other note fields, other Db fields and added notes observable", () => {
    const before = dbOfText(beforeSource, defaultEmbedded())
    const rawAfter = dbOfText(afterSource, defaultEmbedded()) as DbSummary
    const notes = rawAfter.notes as JsonObject[]
    const after: DbSummary = {
      ...rawAfter,
      title: "changed",
      notes: [
        { ...notes[0], position: "left of" },
        { state: "B", position: "right of", text: "extra" },
      ],
    }
    const comparison = stateDbForFormattingComparison(
      before,
      after,
      beforeSource,
      afterSource,
    )
    expect(comparison).not.toEqual(before)
    expect(comparison).toMatchObject({
      title: "changed",
      notes: [
        { state: "A", position: "left of", text: "first\n second" },
        { state: "B", position: "right of", text: "extra" },
      ],
    })
  })

  it("does not hide an unrelated Db text change behind a source margin", () => {
    const before = dbOfText(beforeSource, defaultEmbedded())
    const rawAfter = dbOfText(afterSource, defaultEmbedded()) as DbSummary
    const after: DbSummary = {
      ...rawAfter,
      notes: [{ state: "A", position: "right of", text: "changed" }],
    }
    expect(
      stateDbForFormattingComparison(before, after, beforeSource, afterSource),
    ).toEqual(after)
  })

  it("does not hide an incorrect Db first-row prefix behind a valid source margin", () => {
    const written =
      "stateDiagram-v2\nnote right of A\nfirst\n second\nend note\n"
    const printed =
      "stateDiagram-v2\n  note right of A\n    first\n    second\n  end note\n"
    const before = dbOfText(written, defaultEmbedded())
    const rawAfter = dbOfText(printed, defaultEmbedded()) as DbSummary
    const notes = rawAfter.notes as JsonObject[]
    const after: DbSummary = {
      ...rawAfter,
      notes: [{ ...notes[0], text: "    first\n    second" }],
    }
    expect(
      stateDbForFormattingComparison(before, after, written, printed),
    ).toEqual(after)
  })
})
