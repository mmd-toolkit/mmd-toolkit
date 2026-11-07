import { describe, expect, it } from "vitest"
import type { Indentation } from "../src/diagram.ts"
import type { FormatResult } from "../src/diagnostic.ts"
import { formatMarkdown } from "../src/markdown.ts"

/** The indentation without a Prettier configuration. */
const noConfiguration: Indentation = { tabWidth: undefined, useTabs: undefined }

/** Formats a Markdown text without a Prettier configuration. */
async function format(text: string): Promise<FormatResult> {
  return formatMarkdown(text, noConfiguration)
}

/** A text of lines, each ended by `\n`. */
function lines(...texts: readonly string[]): string {
  return texts.map((text) => `${text}\n`).join("")
}

/** Expects a text to be formatted to `expected`, without a diagnostic. */
async function expectFormatted(text: string, expected: string): Promise<void> {
  expect(await format(text)).toEqual({ text: expected, diagnostics: [] })
}

describe("What is formatted: the code blocks whose info string starts with mermaid or mmd", () => {
  it("formats a mermaid block and keeps the rest of the file byte for byte", async () => {
    await expectFormatted(
      lines(
        "# Title  ",
        "",
        "```js",
        "const   x=1",
        "```",
        "",
        "| a |b|",
        "|--|--|",
        "",
        "```mermaid",
        "flowchart LR",
        "A-->B",
        "```",
        "",
        "*  text\t",
      ),
      lines(
        "# Title  ",
        "",
        "```js",
        "const   x=1",
        "```",
        "",
        "| a |b|",
        "|--|--|",
        "",
        "```mermaid",
        "flowchart LR",
        "  A --> B",
        "```",
        "",
        "*  text\t",
      ),
    )
  })

  it.each([
    ["```mmd", "```"],
    ["~~~mermaid", "~~~"],
    ["````mermaid", "````"],
    ["```mermaid title", "```"],
  ])("formats the block of %s", async (open, close) => {
    await expectFormatted(
      lines(open, "flowchart LR", "A-->B", close),
      lines(open, "flowchart LR", "  A --> B", close),
    )
  })

  it.each(["```Mermaid", "```MMD", "```mermaidjs", "```js", "```"])(
    "does not format the block of %s",
    async (open) => {
      const text = lines(open, "flowchart LR", "A-->B", "```")
      await expectFormatted(text, text)
    },
  )

  it("does not format an indented code block", async () => {
    const text = lines(
      "    ```mermaid",
      "    flowchart LR",
      "    A-->B",
      "    ```",
    )
    await expectFormatted(text, text)
  })

  it("does not take a fence inside another code block for a diagram", async () => {
    const text = lines(
      "````md",
      "```mermaid",
      "flowchart LR",
      "A-->B",
      "```",
      "````",
    )
    await expectFormatted(text, text)
  })
})

describe("What is formatted: each line written starts with what stands before the opening fence", () => {
  it("keeps the indentation of a list item", async () => {
    await expectFormatted(
      lines("- item", "", "  ```mermaid", "  flowchart LR", "  A-->B", "  ```"),
      lines(
        "- item",
        "",
        "  ```mermaid",
        "  flowchart LR",
        "    A --> B",
        "  ```",
      ),
    )
  })

  it("writes an empty line of a list item without the indentation", async () => {
    await expectFormatted(
      lines(
        "- item",
        "",
        "  ```mermaid",
        "  flowchart LR",
        "  A-->B",
        "  ",
        "  B-->C",
        "  ```",
      ),
      lines(
        "- item",
        "",
        "  ```mermaid",
        "  flowchart LR",
        "    A --> B",
        "",
        "    B --> C",
        "  ```",
      ),
    )
  })

  it("replaces a bullet list marker before the fence by a space", async () => {
    await expectFormatted(
      lines("- ```mermaid", "  flowchart LR", "  A-->B", "  ```"),
      lines("- ```mermaid", "  flowchart LR", "    A --> B", "  ```"),
    )
  })

  it("replaces an ordered list marker before the fence by spaces", async () => {
    await expectFormatted(
      lines("10. ```mermaid", "    flowchart LR", "    A-->B", "    ```"),
      lines("10. ```mermaid", "    flowchart LR", "      A --> B", "    ```"),
    )
  })

  it("keeps the > of a block quote, and writes an empty line as > alone", async () => {
    await expectFormatted(
      lines(
        "> ```mermaid",
        "> flowchart LR",
        "> A-->B",
        "> ",
        "> B-->C",
        "> ```",
      ),
      lines(
        "> ```mermaid",
        "> flowchart LR",
        ">   A --> B",
        ">",
        ">   B --> C",
        "> ```",
      ),
    )
  })

  it("adds the space after a > that the opening fence follows at once", async () => {
    await expectFormatted(
      lines(">```mermaid", ">flowchart LR", ">A-->B", ">```"),
      lines(">```mermaid", "> flowchart LR", ">   A --> B", ">```"),
    )
  })

  it("keeps the containers of a block nested in a list, a block quote, and a list", async () => {
    await expectFormatted(
      lines(
        "- a",
        "  > - b",
        "  >   ```mmd",
        "  >   flowchart LR",
        "  >   A-->B",
        "  >   ```",
      ),
      lines(
        "- a",
        "  > - b",
        "  >   ```mmd",
        "  >   flowchart LR",
        "  >     A --> B",
        "  >   ```",
      ),
    )
  })

  it("gives every line the indentation of the opening fence", async () => {
    await expectFormatted(
      lines("  ```mermaid", "  flowchart LR", "  A-->B", "  ```"),
      lines("  ```mermaid", "  flowchart LR", "    A --> B", "  ```"),
    )
    await expectFormatted(
      lines(
        "- x",
        "",
        "    ```mermaid",
        "  flowchart LR",
        "  A-->B",
        "    ```",
      ),
      lines(
        "- x",
        "",
        "    ```mermaid",
        "    flowchart LR",
        "      A --> B",
        "    ```",
      ),
    )
  })

  it("keeps a tab that is wholly the indentation of the list item", async () => {
    await expectFormatted(
      lines(
        "1.\tStep",
        "",
        "\t```mermaid",
        "\tflowchart LR",
        "\tA-->B",
        "\t```",
      ),
      lines(
        "1.\tStep",
        "",
        "\t```mermaid",
        "\tflowchart LR",
        "\t  A --> B",
        "\t```",
      ),
    )
  })
})

describe("What is formatted: a block that is not closed", () => {
  it("runs to the end of the file, and keeps its last line without a line ending", async () => {
    await expectFormatted(
      "```mermaid\nflowchart LR\nA-->B",
      "```mermaid\nflowchart LR\n  A --> B",
    )
    await expectFormatted(
      lines("```mermaid", "flowchart LR", "A-->B"),
      lines("```mermaid", "flowchart LR", "  A --> B"),
    )
    const formatted = "```mermaid\nflowchart LR\n  A --> B"
    await expectFormatted(formatted, formatted)
  })

  it("leaves out a last line without a line ending that holds only the >, as Prettier's parser reads it", async () => {
    await expectFormatted("> ```mermaid\n>\n>", "> ```mermaid\n>")
  })

  it("runs to the end of its list item", async () => {
    await expectFormatted(
      lines("- ```mermaid", "  flowchart LR", "  A-->B", "- next"),
      lines("- ```mermaid", "  flowchart LR", "    A --> B", "- next"),
    )
  })

  it("runs to the end of its block quote", async () => {
    await expectFormatted(
      lines("> ```mermaid", "> flowchart LR", "> A-->B", "", "after"),
      lines("> ```mermaid", "> flowchart LR", ">   A --> B", "", "after"),
    )
  })
})

describe("What is formatted: a tab read partly as indentation and partly as text", () => {
  it("leaves the block of a list item as it is, with a warning at the tab", async () => {
    const text = lines(
      "- x",
      "",
      "  ```mermaid",
      "  flowchart LR",
      "\tA-->B",
      "  ```",
      "",
      "```mermaid",
      "flowchart LR",
      "C-->D",
      "```",
    )
    expect(await format(text)).toEqual({
      text: text.replace("C-->D", "  C --> D"),
      diagnostics: [
        {
          severity: "warning",
          message:
            "not formatted: a tab in the indentation of this line is read partly as the text of the diagram",
          position: { line: 5, column: 1 },
        },
      ],
    })
  })

  it("leaves the block of a block quote as it is, with a warning at the tab", async () => {
    const text = lines("> ```mermaid", "> flowchart LR", ">\tA-->B", "> ```")
    expect(await format(text)).toEqual({
      text,
      diagnostics: [
        {
          severity: "warning",
          message:
            "not formatted: a tab in the indentation of this line is read partly as the text of the diagram",
          position: { line: 3, column: 2 },
        },
      ],
    })
  })
})

describe("What is formatted: a block whose opening fence stands on the line of a footnote label", () => {
  it("leaves the block as it is, with a warning at the fence", async () => {
    const text = lines(
      "[^1]: ```mermaid",
      "    flowchart LR",
      "    A-->B",
      "    ```",
    )
    expect(await format(text)).toEqual({
      text,
      diagnostics: [
        {
          severity: "warning",
          message:
            "not formatted: the opening fence stands on the line of a footnote label",
          position: { line: 1, column: 7 },
        },
      ],
    })
  })

  it("formats a block of a footnote whose fence has a line of its own", async () => {
    await expectFormatted(
      lines(
        "[^1]:",
        "    ```mermaid",
        "    flowchart LR",
        "    A-->B",
        "    ```",
      ),
      lines(
        "[^1]:",
        "    ```mermaid",
        "    flowchart LR",
        "      A --> B",
        "    ```",
      ),
    )
  })
})

describe("What is formatted: text that is empty or only whitespace", () => {
  it("leaves an empty block as it is", async () => {
    const text = lines("```mermaid", "```")
    await expectFormatted(text, text)
    const quoted = lines("> ```mermaid", "> ```")
    await expectFormatted(quoted, quoted)
  })

  it("removes the lines of a block of one empty line", async () => {
    await expectFormatted(
      lines("```mermaid", "", "```"),
      lines("```mermaid", "```"),
    )
    await expectFormatted(
      lines("> ```mermaid", ">", "> ```"),
      lines("> ```mermaid", "> ```"),
    )
  })

  it("removes the lines of a block of blank lines", async () => {
    await expectFormatted(
      lines("```mermaid", "  ", "", "```"),
      lines("```mermaid", "```"),
    )
  })
})

describe("What is formatted: a file keeps its line endings", () => {
  it("ends the lines that it writes with \\r\\n in a file of \\r\\n", async () => {
    await expectFormatted(
      "# T\r\n\r\n```mermaid\r\nflowchart LR\r\nA-->B\r\n```\r\n",
      "# T\r\n\r\n```mermaid\r\nflowchart LR\r\n  A --> B\r\n```\r\n",
    )
  })

  it("ends the lines that it writes with \\r in a file of \\r", async () => {
    await expectFormatted(
      "```mermaid\rflowchart LR\rA-->B\r```\r",
      "```mermaid\rflowchart LR\r  A --> B\r```\r",
    )
  })

  it("ends the lines that it writes as the first line ends, and keeps the others", async () => {
    await expectFormatted(
      "# T\n\n```mermaid\r\nflowchart LR\r\nA-->B\r\n```\r\n",
      "# T\n\n```mermaid\r\nflowchart LR\n  A --> B\n```\r\n",
    )
  })

  it("keeps a byte order mark", async () => {
    await expectFormatted(
      "\uFEFF```mermaid\nflowchart LR\nA-->B\n```\n",
      "\uFEFF```mermaid\nflowchart LR\n  A --> B\n```\n",
    )
  })

  it("does not end a line at U+2028 inside a diagram", async () => {
    await expectFormatted(
      lines(
        "- x",
        "",
        "  ```mermaid",
        "  flowchart LR",
        "  A[a\u2028b]-->B",
        "  ```",
      ),
      lines(
        "- x",
        "",
        "  ```mermaid",
        "  flowchart LR",
        "    A[a\u2028b] --> B",
        "  ```",
      ),
    )
  })
})

describe("How it relates to the other packages: the rules of the plugin apply to the text of a block", () => {
  it("leaves the error pseudo-diagram as written, as the plugin leaves it in a file", async () => {
    const text = lines("```mermaid", "%% note", "  error  ", "```")
    await expectFormatted(text, text)
  })
})

describe("When a diagram cannot be read: a warning with its position in the file", () => {
  it("leaves a rejected block and formats the other blocks", async () => {
    const text = lines(
      "```mermaid",
      "flowchart LR",
      "A-->B)",
      "```",
      "",
      "```mermaid",
      "flowchart LR",
      "C-->D",
      "```",
    )
    expect(await format(text)).toEqual({
      text: text.replace("C-->D", "  C --> D"),
      diagnostics: [
        {
          severity: "warning",
          message: "Unexpected character",
          position: { line: 3, column: 6 },
        },
      ],
    })
  })

  it("counts the column from the start of the line in the file", async () => {
    const text = lines(
      "- x",
      "",
      "  ```mermaid",
      "  flowchart LR",
      "  A-->B)",
      "  ```",
    )
    expect(await format(text)).toEqual({
      text,
      diagnostics: [
        {
          severity: "warning",
          message: "Unexpected character",
          position: { line: 5, column: 8 },
        },
      ],
    })
  })

  it("places an error at the end of the diagram on the line after it", async () => {
    const text = lines("> ```mermaid", "> flowchart LR", "> A-->", "> ```")
    expect(await format(text)).toEqual({
      text,
      diagnostics: [
        {
          severity: "warning",
          message: "Unexpected end of text",
          position: { line: 4, column: 1 },
        },
      ],
    })
  })
})
