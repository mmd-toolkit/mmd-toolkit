// Fails when a Markdown document in the repository has no Japanese version
// next to it (`<name>.ja.md`), or when a `.ja.md` has no English original.
// Which documents are covered: scripts/markdown-files.mjs.
import { markdownFiles } from "./markdown-files.mjs"

const files = new Set(markdownFiles(process.cwd()))
const problems = []
for (const file of files) {
  if (file.endsWith(".ja.md")) {
    const english = file.replace(/\.ja\.md$/u, ".md")
    if (!files.has(english))
      problems.push(`${file}: no English original ${english}`)
  } else {
    const japanese = file.replace(/\.md$/u, ".ja.md")
    if (!files.has(japanese))
      problems.push(`${file}: missing Japanese version ${japanese}`)
  }
}

if (problems.length > 0) {
  process.stderr.write(
    "Markdown documents must come in English and Japanese pairs:\n",
  )
  for (const p of problems) process.stderr.write(`  ${p}\n`)
  process.exitCode = 1
} else {
  process.stdout.write(
    `check-ja-docs: ${files.size} Markdown files, all paired.\n`,
  )
}
