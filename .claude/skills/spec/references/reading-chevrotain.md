# Reading a Chevrotain diagram (spec)

For Chevrotain diagrams, read each active mode's token array in order, including
custom matchers, skipped tokens, categories, push/pop transitions, and explicit
`longer_alt`; do not assume longest match or infer precedence from declaration
order outside those arrays. Read parser rule methods, gates and lookahead as the
grammar, then visitor/model validation as acceptance conditions. Distinguish a
composite token's authored components when stating directive and
ignored-semicolon boundaries. Check mode-specific whitespace/comments, custom
matcher failure, category versus exact-unit acceptance, and longer-alternative
controls; Jison's automatic word boundary does not apply. Check full input
consumption and the wrapper's error handling: the first lexer error is reported
before any parser error, and a recovered CST need not be accepted.
