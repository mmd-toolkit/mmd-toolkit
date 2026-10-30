# @mmd-toolkit/class-no-unclosed-backquote

Japanese version:
[class-no-unclosed-backquote.ja.md](./class-no-unclosed-backquote.ja.md)

Disallow a backquoted class name without its closing backquote.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A backquoted class name can contain whitespace and other characters, as in
``class `Animal Class!` ``. mermaid.js accepts a name without its closing
backquote without an error: the rest of the text becomes the name of one class.

## Rule Details

This rule applies to class diagrams (`classDiagram` and `classDiagram-v2`). It
reports a backquoted class name with no closing backquote.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-unclosed-backquote: error
classDiagram
  class `x
class B
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-unclosed-backquote: error
classDiagram
  class `Animal Class!`
  class `Car Class`
  `Animal Class!` --> `Car Class`
```

## Options

This rule has no options.

## Related Rules

- [no-unclosed-directive](./no-unclosed-directive.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/class-no-unclosed-backquote.ts)
- [Tests source](../../tests/rules/class-no-unclosed-backquote.test.ts)

<!-- end auto-generated rule resources -->
