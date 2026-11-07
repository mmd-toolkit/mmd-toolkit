/**
 * The listener of the errors of standard output. When the reader of standard
 * output goes away, as `head` does once it has its lines, writing fails with
 * `EPIPE`. Other command-line tools then end without a word; so does this
 * tool, and it finishes the run, so that `--write` still rewrites every file
 * and the exit code still tells the result (README, Usage). Any other error is
 * thrown, as Node.js throws it when the stream has no listener.
 */
export function ignoreBrokenPipe(error: NodeJS.ErrnoException): void {
  if (error.code !== "EPIPE") throw error
}
