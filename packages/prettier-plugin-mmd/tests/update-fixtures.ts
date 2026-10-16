/**
 * Writes the `-output.mmd` file of every formatting fixture by formatting
 * its `-input.mmd`. Review the changes as a diff before committing them.
 *
 * Run it with `pnpm --filter prettier-plugin-mmd run test:update`, which
 * builds the parser first: this script imports `@mmd-toolkit/parser` from
 * its build.
 */
import { writeFile } from "node:fs/promises"
import * as prettier from "prettier"
import plugin from "../src/index.ts"
import { loadFormatFixtures } from "./fixtures.ts"

for (const fixture of await loadFormatFixtures()) {
  const formatted = prettier.format(fixture.input, {
    ...fixture.options,
    filepath: "fixture.mmd",
    plugins: [plugin],
  })
  const output = fixture.rejected
    ? await formatted.then(
        () => {
          throw new Error(`Expected rejection: ${fixture.id}`)
        },
        (error: unknown) => {
          if (!(error instanceof SyntaxError)) throw error
          return fixture.input
        },
      )
    : await formatted
  if (output !== fixture.output) {
    await writeFile(fixture.outputPath, output)
    process.stdout.write(`updated ${fixture.id}\n`)
  }
}
