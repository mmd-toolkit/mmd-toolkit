---
"prettier-plugin-mmd": minor
---

Normalize indentation of safely formatted `eventmodeling` data and note bodies,
single-paragraph bodies in `state` notes, and ordinary `accDescr` bodies while
preserving meaningful text and rendering. Align structural continuations around
comments and directives, and put spaces around `=` in C4 named attributes so the
key/value boundary is easier to read.

Clarify block header indentation, keep comment-bearing list and grammar
alternatives readable, normalize method and supported style boundaries, and
format ordinary Wardley names containing `style` instead of preserving their
spacing.

Keep wrapped GWT source-frame names inside their header, and align the trimmed
first line of state note bodies even when they contain HTML or Markdown. Align
all eligible paragraph lines, including inline emphasis, same-line code and
inline `<br/>`, while preserving blank rows at their edges and margins that
affect block rendering. Match the first line of protected state notes to their
later lines when those share one indentation.
