import { describe, expect, it } from "vitest"
import type { Options } from "prettier"
import type { FormatResult } from "../src/diagnostic.ts"
import { formatMarkdown } from "../src/markdown.ts"
import { lines } from "./helpers.ts"

/** No Prettier configuration. */
const noConfiguration: Options = {}

/**
 * Formats a Markdown text without a Prettier configuration, with the positions
 * in the text after formatting.
 */
async function format(text: string): Promise<FormatResult> {
  return formatMarkdown(text, noConfiguration, "output")
}

/** Expects a text to be formatted to `expected`, without a diagnostic. */
async function expectFormatted(text: string, expected: string): Promise<void> {
  expect(await format(text)).toEqual({ text: expected, diagnostics: [] })
}

describe("Code blocks in detail: the code blocks whose info string starts with mermaid or mmd", () => {
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

describe("Code blocks in detail: each line written starts with what stands before the opening fence", () => {
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

  it("starts each line that a diagram gains in a block quote with the >, and keeps the closing fence and the lines after the quote", async () => {
    await expectFormatted(
      lines(
        "> ```mermaid",
        "> flowchart LR",
        "> A-->B; B-->C; C-->D",
        "> ```",
        "",
        "after",
      ),
      lines(
        "> ```mermaid",
        "> flowchart LR",
        ">   A --> B",
        ">   B --> C",
        ">   C --> D",
        "> ```",
        "",
        "after",
      ),
    )
  })

  it("writes one > alone for the empty lines that a diagram in a block quote loses", async () => {
    await expectFormatted(
      lines(
        "> ```mermaid",
        "> flowchart LR",
        "> A-->B",
        ">",
        ">",
        ">",
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

  it("starts each line that a diagram gains with every marker of a block quote in a block quote, and of a block quote in a list item", async () => {
    await expectFormatted(
      lines(
        "> > ```mermaid",
        "> > flowchart LR",
        "> > A-->B; B-->C",
        "> > ```",
      ),
      lines(
        "> > ```mermaid",
        "> > flowchart LR",
        "> >   A --> B",
        "> >   B --> C",
        "> > ```",
      ),
    )
    await expectFormatted(
      lines(
        "- item",
        "  > ```mermaid",
        "  > flowchart LR",
        "  > A-->B; B-->C",
        "  > ```",
      ),
      lines(
        "- item",
        "  > ```mermaid",
        "  > flowchart LR",
        "  >   A --> B",
        "  >   B --> C",
        "  > ```",
      ),
    )
  })

  it("starts the lines of a subgraph in a block quote with the >, before their nested indentation", async () => {
    await expectFormatted(
      lines(
        "> ```mermaid",
        "> flowchart LR",
        "> subgraph S; A-->B; end",
        "> ```",
      ),
      lines(
        "> ```mermaid",
        "> flowchart LR",
        ">   subgraph S",
        ">     A --> B",
        ">   end",
        "> ```",
      ),
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

describe("Code blocks in detail: a block that is not closed", () => {
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

  it("leaves a block that holds only blank lines as written", async () => {
    for (const text of [
      "> ```mermaid\n>\n>",
      "```mermaid\n  ",
      "# T\r> ```mermaid\r>\n\n> next\n",
    ]) {
      await expectFormatted(text, text)
    }
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

  it("leaves the empty line at the end of a block in a list item as written, so that the list stays loose", async () => {
    const input = lines(
      "- ```mermaid",
      "  flowchart LR",
      "  A-->B; B-->C",
      "",
      "- b",
    )
    const output = lines(
      "- ```mermaid",
      "  flowchart LR",
      "    A --> B",
      "    B --> C",
      "",
      "- b",
    )
    await expectFormatted(input, output)
    await expectFormatted(output, output)

    const inputWithText = lines(
      "- a",
      "",
      "  ```mermaid",
      "  flowchart LR",
      "  A-->B; B-->C",
      "",
      "- b",
    )
    const outputWithText = lines(
      "- a",
      "",
      "  ```mermaid",
      "  flowchart LR",
      "    A --> B",
      "    B --> C",
      "",
      "- b",
    )
    await expectFormatted(inputWithText, outputWithText)
    await expectFormatted(outputWithText, outputWithText)
  })

  it("leaves a line of only spaces at the end of a block as written", async () => {
    const input = lines(
      "- a",
      "",
      "  ```mermaid",
      "  flowchart LR",
      "  A-->B",
      "  ",
      "- b",
    )
    const output = lines(
      "- a",
      "",
      "  ```mermaid",
      "  flowchart LR",
      "    A --> B",
      "  ",
      "- b",
    )
    await expectFormatted(input, output)
    await expectFormatted(output, output)
  })

  it("leaves a line of only a tab at the end of a block as written, without a warning", async () => {
    const input = lines(
      "- x",
      "",
      "  ```mermaid",
      "  flowchart LR",
      "  A-->B",
      "\t",
      "- b",
    )
    const output = lines(
      "- x",
      "",
      "  ```mermaid",
      "  flowchart LR",
      "    A --> B",
      "\t",
      "- b",
    )
    await expectFormatted(input, output)
    await expectFormatted(output, output)
  })

  it("leaves the lines of only the > at the end of a block in a block quote as written", async () => {
    const input = lines(
      "> ```mermaid",
      "> flowchart LR",
      "> A-->B",
      ">",
      ">",
      "",
      "after",
    )
    const output = lines(
      "> ```mermaid",
      "> flowchart LR",
      ">   A --> B",
      ">",
      ">",
      "",
      "after",
    )
    await expectFormatted(input, output)
    await expectFormatted(output, output)
  })

  it("leaves the empty line at the end of a block that ends the file as written", async () => {
    const input = lines("```mermaid", "flowchart LR", "A-->B", "")
    const output = lines("```mermaid", "flowchart LR", "  A --> B", "")
    await expectFormatted(input, output)
    await expectFormatted(output, output)
  })

  it("removes an empty line before the closing fence, which is the diagram's", async () => {
    const input = lines("```mermaid", "flowchart LR", "A-->B", "", "```")
    const output = lines("```mermaid", "flowchart LR", "  A --> B", "```")
    await expectFormatted(input, output)
    await expectFormatted(output, output)
  })
})

describe("Code blocks in detail: a tab read partly as indentation and partly as text", () => {
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

describe("Code blocks in detail: a block whose opening fence stands on the line of a footnote label", () => {
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

describe("Code blocks in detail: text that is empty or only whitespace", () => {
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

describe("Code blocks in detail: a file keeps its line endings", () => {
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

  it("ends the lines that it writes as the first line ends, except the last, and keeps the others", async () => {
    await expectFormatted(
      "# T\n\n```mermaid\r\nflowchart LR\r\nA-->B\r\n```\r\n",
      "# T\n\n```mermaid\r\nflowchart LR\n  A --> B\r\n```\r\n",
    )
  })

  it("keeps the line ending of the last line, so that a \\r does not join the \\n of an empty line after the block", async () => {
    const input = "# T\r> ```mermaid\n> flowchart LR\n> A-->B\n\n> next\n"
    const output = "# T\r> ```mermaid\n> flowchart LR\r>   A --> B\n\n> next\n"
    await expectFormatted(input, output)
    await expectFormatted(output, output)
  })

  it("keeps the line ending of the last line written before an empty line that is left as written", async () => {
    const input = "# T\r- ```mermaid\n  flowchart LR\n  A-->B\n\n- b\n"
    const output = "# T\r- ```mermaid\n  flowchart LR\r    A --> B\n\n- b\n"
    await expectFormatted(input, output)
    await expectFormatted(output, output)
  })

  it("ends the line of the opening fence as the last line ended when the diagram becomes empty", async () => {
    const input = "# T\r\n```mermaid\r\n  \n```\r\n"
    const output = "# T\r\n```mermaid\n```\r\n"
    await expectFormatted(input, output)
    await expectFormatted(output, output)
  })

  it("keeps the line ending of the last line in a file whose first line ends with \\r\\n", async () => {
    const input = "# T\r\n> ```mermaid\n> flowchart LR\n> A-->B\n\n> next\n"
    const output =
      "# T\r\n> ```mermaid\n> flowchart LR\r\n>   A --> B\n\n> next\n"
    await expectFormatted(input, output)
    await expectFormatted(output, output)
  })

  it("keeps the line ending of the last line in a file of \\n whose block ends its lines with \\r", async () => {
    const input = "# T\n> ```mermaid\r> flowchart LR\r> A-->B\r\r> next\n"
    const output = "# T\n> ```mermaid\r> flowchart LR\n>   A --> B\r\r> next\n"
    await expectFormatted(input, output)
    await expectFormatted(output, output)
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

describe("If you know Prettier: the rules of the plugin apply to the text of a block", () => {
  it("leaves the error pseudo-diagram as written, as the plugin leaves it in a file", async () => {
    const text = lines("```mermaid", "%% note", "  error  ", "```")
    await expectFormatted(text, text)
  })
})

describe("Errors and exit codes: a warning with its position in the file", () => {
  it("rethrows an option error for a rejected diagram", async () => {
    await expect(
      formatMarkdown(
        lines("```mermaid", "flowchart LR", "A-->B)", "```"),
        { tabWidth: 1.5, useTabs: undefined },
        "output",
      ),
    ).rejects.toThrow("tabWidth")
  })

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

  it("moves a warning up by the lines that a diagram before it loses", async () => {
    const text = lines(
      "> ```mermaid",
      "> flowchart LR",
      "> A-->B",
      ">",
      ">",
      ">",
      "> B-->C",
      "> ```",
      "",
      "> ```mermaid",
      "> flowchart LR",
      ">\tA-->B",
      "> ```",
    )
    expect(await format(text)).toEqual({
      text: lines(
        "> ```mermaid",
        "> flowchart LR",
        ">   A --> B",
        ">",
        ">   B --> C",
        "> ```",
        "",
        "> ```mermaid",
        "> flowchart LR",
        ">\tA-->B",
        "> ```",
      ),
      diagnostics: [
        {
          severity: "warning",
          message:
            "not formatted: a tab in the indentation of this line is read partly as the text of the diagram",
          position: { line: 10, column: 2 },
        },
      ],
    })
  })

  /**
   * A file whose two diagrams gain lines before a block that is left as
   * written, with a warning: its opening fence stands on the line of a footnote
   * label. The tests below format it.
   */
  const input = lines(
    "```mermaid",
    "flowchart LR",
    "A-->B; B-->C",
    "```",
    "",
    "> ```mermaid",
    "> flowchart LR",
    "> A-->B; B-->C",
    "> ```",
    "",
    "[^1]: ```mermaid",
    "    flowchart LR",
    "    A-->B",
    "    ```",
  )
  /** The file above after formatting. */
  const formatted = lines(
    "```mermaid",
    "flowchart LR",
    "  A --> B",
    "  B --> C",
    "```",
    "",
    "> ```mermaid",
    "> flowchart LR",
    ">   A --> B",
    ">   B --> C",
    "> ```",
    "",
    "[^1]: ```mermaid",
    "    flowchart LR",
    "    A-->B",
    "    ```",
  )

  it("moves a warning down by the lines that every diagram before it gains", async () => {
    expect(await format(input)).toEqual({
      text: formatted,
      diagnostics: [
        {
          severity: "warning",
          message:
            "not formatted: the opening fence stands on the line of a footnote label",
          position: { line: 13, column: 7 },
        },
      ],
    })
  })

  it("moves a warning up by all the lines of a diagram before it that becomes empty", async () => {
    const text = lines(
      "```mermaid",
      "",
      "",
      "",
      "```",
      "",
      "```mermaid",
      "flowchart LR",
      "A-->B)",
      "```",
    )
    expect(await format(text)).toEqual({
      text: lines(
        "```mermaid",
        "```",
        "",
        "```mermaid",
        "flowchart LR",
        "A-->B)",
        "```",
      ),
      diagnostics: [
        {
          severity: "warning",
          message: "Unexpected character",
          position: { line: 6, column: 6 },
        },
      ],
    })
  })

  it("gives the position in the text as it was read when asked for it", async () => {
    expect(await formatMarkdown(input, noConfiguration, "input")).toEqual({
      text: formatted,
      diagnostics: [
        {
          severity: "warning",
          message:
            "not formatted: the opening fence stands on the line of a footnote label",
          position: { line: 11, column: 7 },
        },
      ],
    })
  })

  it("places an error at the end of a diagram on the empty line left after it", async () => {
    const text = lines("- ```mermaid", "  flowchart LR", "  A-->", "", "- b")
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

  it("moves a warning down by the lines that a block that is not closed gains", async () => {
    const text = lines(
      "- ```mermaid",
      "  flowchart LR",
      "  A-->B; B-->C",
      "",
      "- ```mermaid",
      "  flowchart LR",
      "  A-->B)",
    )
    expect(await format(text)).toEqual({
      text: lines(
        "- ```mermaid",
        "  flowchart LR",
        "    A --> B",
        "    B --> C",
        "",
        "- ```mermaid",
        "  flowchart LR",
        "  A-->B)",
      ),
      diagnostics: [
        {
          severity: "warning",
          message: "Unexpected character",
          position: { line: 8, column: 8 },
        },
      ],
    })
  })

  it("moves a warning down by the lines that a diagram in a block quote in a block quote gains", async () => {
    const text = lines(
      "> > ```mermaid",
      "> > flowchart LR",
      "> > A-->B; B-->C",
      "> > ```",
      ">",
      "> > ```mermaid",
      "> > flowchart LR",
      "> > A-->B)",
      "> > ```",
    )
    expect(await format(text)).toEqual({
      text: lines(
        "> > ```mermaid",
        "> > flowchart LR",
        "> >   A --> B",
        "> >   B --> C",
        "> > ```",
        ">",
        "> > ```mermaid",
        "> > flowchart LR",
        "> > A-->B)",
        "> > ```",
      ),
      diagnostics: [
        {
          severity: "warning",
          message: "Unexpected character",
          position: { line: 9, column: 10 },
        },
      ],
    })
  })

  it("moves a warning down by the lines that a diagram in a block quote in a list item gains", async () => {
    const text = lines(
      "- item",
      "  > ```mermaid",
      "  > flowchart LR",
      "  > A-->B; B-->C",
      "  > ```",
      "",
      "  > ```mermaid",
      "  > flowchart LR",
      "  > A-->B)",
      "  > ```",
    )
    expect(await format(text)).toEqual({
      text: lines(
        "- item",
        "  > ```mermaid",
        "  > flowchart LR",
        "  >   A --> B",
        "  >   B --> C",
        "  > ```",
        "",
        "  > ```mermaid",
        "  > flowchart LR",
        "  > A-->B)",
        "  > ```",
      ),
      diagnostics: [
        {
          severity: "warning",
          message: "Unexpected character",
          position: { line: 10, column: 10 },
        },
      ],
    })
  })

  it("moves a warning down by the lines that a diagram gains in a file with a byte order mark", async () => {
    const text =
      "\uFEFF```mermaid\nflowchart LR\nA-->B; B-->C\n```\n\n```mermaid\nflowchart LR\nA-->B)\n```\n"
    const output =
      "\uFEFF```mermaid\nflowchart LR\n  A --> B\n  B --> C\n```\n\n```mermaid\nflowchart LR\nA-->B)\n```\n"
    expect(await format(text)).toEqual({
      text: output,
      diagnostics: [
        {
          severity: "warning",
          message: "Unexpected character",
          position: { line: 9, column: 6 },
        },
      ],
    })
  })
})
