# @mmd-toolkit/c4-no-duplicate-title

Japanese version: [c4-no-duplicate-title.ja.md](./c4-no-duplicate-title.ja.md)

Disallow a title statement that replaces a different title set by another title
statement.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A second `title` replaces the visible title of the whole diagram. mermaid.js
accepts both statements without an error, and the earlier title is lost.

## Rule Details

This rule applies to C4 diagrams (`C4Context`, `C4Container`, `C4Component`,
`C4Dynamic`, and `C4Deployment`). It reports a `title` with a different value
from the latest preceding title-setting statement when that statement is also a
`title`. Titles inside boundaries also set the title of the whole diagram.
Repeating the same value is not reported. After `title First` and
`title Second`, a third `title First` is reported too.

Quotes and whitespace after the first separator are significant, so
`title "Banking"` differs from `title Banking`. `accTitle:` is not reported and
ends comparison with the preceding `title`. mermaid.js incorrectly uses this
form as a visible title. The rule does not report that accessibility defect as
an author mistake.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-title: error
C4Context
  title Banking
  title Payments
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-title: error
C4Context
  title Banking
  title Banking
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-title: error
C4Context
  title Banking
  accTitle: Accessible banking
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-title: error
C4Context
  accTitle: Accessible banking
  title Banking
```

## Options

This rule has no options.

## Related Rules

- [c4-no-duplicate-description](./c4-no-duplicate-description.md)

## Further Reading

- [Issue #8040: C4: accTitle sets the visible title instead of the accessible title](https://github.com/mermaid-js/mermaid/issues/8040)
- [Pull request #8041: fix(c4): send accTitle to the accessible title](https://github.com/mermaid-js/mermaid/pull/8041)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/c4-no-duplicate-title.ts)
- [Tests source](../../tests/rules/c4-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
