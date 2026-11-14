# Reading a Jison diagram (spec)

1. Read the lexer rules of the grammar definition (`*.jison`) from top to
   bottom, and settle these points:
   - The exclusive states (`%x`), the rules without a state (they match only in
     the initial state), and the `<*>` rules (they match in every state, but the
     rules of that state that come earlier in the file match first). Flowchart
     example: the string rule `<*>["]` also matches in the click state and the
     dir state.
   - Rules that return no token. Flowchart examples: `"click"[\s]+` only enters
     a state, so the grammar never sees the word `click` (the known divergence
     `click-reserved-word`); the rules for `""`, for `call` with empty
     parentheses, and for `accDescr {}` return no token either
     (`tokenless-empty-forms`).
   - Rules that can match the empty string (such as `[^\s\n]*`). At the end of
     the text they return an empty token, which makes the input rejected.
   - Whitespace rules that include line feeds, such as `[\s]+`. They also take
     the line feed that mermaid.js appends to the text (End of text in
     common.md).
2. Read the grammar rules and the action of each (the Db functions it calls).
3. Read the Db class. Look for plain objects used as sets of keys
   (`hasOwnProperty`, `__proto__`), the difference between `Object.assign` and
   spreading, rewrites with regular expressions, the places that throw
   (rejections outside the grammar), and the values that depend on the browser
   rather than on the text, such as `window.CSS` or `document` (sequence: the
   colour of a box). Such a value is supplied from outside, as a site
   configuration is; `docs/db-from-tree/<diagram>.md` of `@mmd-toolkit/tests`
   says so, written with the steps of the tests-tree-checks SKILL.
4. Check the order of the preprocessing (Reading a source in common.md) and the
   detection (detection.md).
