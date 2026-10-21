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
  const output = await prettier.format(fixture.input, {
    ...fixture.options,
    filepath: "fixture.mmd",
    plugins: [plugin],
  })
  if (output !== fixture.output) {
    await writeFile(fixture.outputPath, output)
    process.stdout.write(`updated ${fixture.id}\n`)
  }
}
