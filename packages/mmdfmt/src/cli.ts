#!/usr/bin/env node
import { main } from "./main.ts"

/** Reads standard input to its end, as UTF-8. */
async function readStdin(): Promise<string> {
  process.stdin.setEncoding("utf8")
  let text = ""
  for await (const chunk of process.stdin) text += chunk
  return text
}

process.exitCode = await main(process.argv.slice(2), {
  cwd: process.cwd(),
  readStdin,
  stdout: (text) => {
    process.stdout.write(text)
  },
  stderr: (text) => {
    process.stderr.write(text)
  },
})
