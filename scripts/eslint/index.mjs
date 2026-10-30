import { jaLineBreaks } from "./rules/ja-line-breaks.mjs"

export const localPlugin = {
  meta: { name: "local", version: "0.0.0" },
  rules: { "ja-line-breaks": jaLineBreaks },
}
