# @mmd-toolkit/usecase-no-unclosed-description-block

Japanese version:
[usecase-no-unclosed-description-block.ja.md](./usecase-no-unclosed-description-block.ja.md)

Disallow an `accDescr {` block that a `}` written for a later statement closes.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

An `accDescr {` block runs to the first `}` after its opening brace. If its own
`}` is missing, mermaid.js can close it at a later statement's `}` without an
error. The intervening statements become description text and disappear from the
diagram.

## Rule Details

This rule applies to use case diagrams (`usecase-beta`). It reports an
`accDescr` block containing a `{` on a later line than its opening brace, unless
the closing `}` stands alone on its line. A closing brace is alone when only
whitespace precedes it on that line. A block without any closing `}` is not
reported, because mermaid.js gives an error for it.

A `{` in a comment line is not counted, and a `}` in a comment line does not
close the block. A same-line form such as `accDescr { a { b }` is not reported.
A later metadata closing brace on a line of its own is not reported either, even
when it closes the description by mistake.

An intentional description such as `accDescr {` followed by `a {b }` is reported
because the rule cannot distinguish its brace from metadata.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-unclosed-description-block: error
usecase-beta
  accDescr { first
  A --> B
  actor C@{ type: hollow }
  D
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-unclosed-description-block: error
usecase-beta
  accDescr { first }
  A --> B
  actor C@{ type: hollow }
  D
```

```mmd
%% eslint @mmd-toolkit/usecase-no-unclosed-description-block: error
usecase-beta
  accDescr {
    uses { here
  }
  A
```

## Options

This rule has no options.

## Related Rules

- [usecase-no-empty-description-block](./usecase-no-empty-description-block.md)
- [usecase-no-duplicate-description](./usecase-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/usecase-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/usecase-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
