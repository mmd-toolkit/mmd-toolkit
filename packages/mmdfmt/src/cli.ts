#!/usr/bin/env node
import { text } from "node:stream/consumers"
import { ignoreBrokenPipe } from "./broken-pipe.ts"
import { main } from "./main.ts"

/** Reads standard input to its end, as UTF-8. */
async function readStdin(): Promise<string> {
  // Decoding here keeps the byte order mark that text() drops from bytes.
  return text(process.stdin.setEncoding("utf8"))
}

process.stdout.on("error", ignoreBrokenPipe)

process.exitCode = await main(process.argv.slice(2), {
  cwd: process.cwd(),
  readStdin,
  stdout: (output) => {
    process.stdout.write(output)
  },
  stderr: (output) => {
    process.stderr.write(output)
  },
})
