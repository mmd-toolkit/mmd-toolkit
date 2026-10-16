# @mmd-toolkit/class-no-unclosed-backquote

Japanese version:
[class-no-unclosed-backquote.ja.md](./class-no-unclosed-backquote.ja.md)

Disallow a backquoted class name without its closing backquote.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A class name in backquotes may hold whitespace and other characters, as in
``class `Animal Class!` ``. mermaid.js accepts a backquoted name that is never
closed: the rest of the text becomes the name of one class.

## Rule Details

This rule reports a backquoted class name that is not closed by a backquote. It
applies to `classDiagram`.

After ``class `x``, a line break, and `class B`, the diagram has one class,
whose name is `x`, a line break, `class B`, and the line breaks at the end of
the text. Every statement after the opening backquote is part of the name.

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
