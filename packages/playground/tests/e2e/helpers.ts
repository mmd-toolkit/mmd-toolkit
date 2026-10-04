import type { Page } from "@playwright/test"
import { decodeState } from "../../src/share.ts"

/** Uses the modifier Monaco chooses from the browser UA, including emulated devices. */
export async function shortcut(page: Page, key: string): Promise<void> {
  const modifier = await page.evaluate(() =>
    navigator.userAgent.includes("Macintosh") ? "Meta" : "Control",
  )
  await page.keyboard.press(`${modifier}+${key}`)
}

/** Types with key events, including actual Enter keys rather than bulk composition. */
export async function edit(page: Page, source: string): Promise<void> {
  const editor = page.getByRole("textbox", {
    name: "Mermaid source",
    exact: true,
    includeHidden: true,
  })
  await editor.focus()
  await shortcut(page, "A")
  await page.keyboard.press("Backspace")
  const lines = source.split("\n")
  const wordModifier = await page.evaluate(() =>
    navigator.userAgent.includes("Macintosh") ? "Alt" : "Control",
  )
  for (const [index, line] of lines.entries()) {
    if (index > 0) {
      await page.keyboard.press("Enter")
      // Remove indentation inherited from the preceding line before typing it.
      if (
        lines[index - 1].startsWith(" ") ||
        lines[index - 1].startsWith("\t")
      ) {
        await page.keyboard.press(`${wordModifier}+Backspace`)
      }
    }
    await page.keyboard.type(line)
  }
}

/** Reads the saved snapshot to verify the exact editable source after normalization. */
export async function savedSource(page: Page): Promise<string | null> {
  const hash = new URL(page.url()).hash
  return hash ? (await decodeState(hash)).source : null
}
