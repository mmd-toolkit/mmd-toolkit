# @mmd-toolkit/class-no-undef

Japanese version: [class-no-undef.ja.md](./class-no-undef.ja.md)

Disallow a statement that refers to a class that the diagram does not define.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`style`, `cssClass`, `click`, `link`, `callback`, and `note for` name a class.
An unknown name gives no error: the statement does nothing, or draws a note that
points at nothing.

## Rule Details

This rule applies to class diagrams (`classDiagram` and `classDiagram-v2`). It
reports an unknown class name in a `style`, `cssClass`, `click`, `link`,
`callback`, or `note for` statement. Classes declared by a class statement, a
relation, or a member statement count, anywhere in the diagram or in any
namespace.

A relation with a lollipop at only one end declares an interface at that end,
not a class; with lollipops at both ends, both ends are classes. A statement
before the class it names is not reported, although only `note for` takes effect
there.

Statements naming classes with ids starting with an ASCII digit are not
reported, although `cssClass`, `link`, and `click … href` have no effect on
them. Nor is `note for A~T~ "x"` after `class A~T~` reported, although
mermaid.js draws the note without its line to the class.

Each name in a `cssClass` list is checked; whitespace after `,` is part of the
name, so ` B` in `cssClass "A, B" c` is reported. Backquoted names in `click`,
`link`, and `callback` are also split at `,` and each part checked. The name
after `note for` is not split.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-undef: error
classDiagram
  class A
  cssClass "C" c
```

```mmd
%% eslint @mmd-toolkit/class-no-undef: error
classDiagram
  class A
  click C href "https://x.example"
```

```mmd
%% eslint @mmd-toolkit/class-no-undef: error
classDiagram
  note for Z "x"
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-undef: error
classDiagram
  class A
  style A fill : #f00 , stroke-width: 2px
```

```mmd
%% eslint @mmd-toolkit/class-no-undef: error
classDiagram
  Class11 <|.. Class12
  note for Class11 "test"
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-undef](./flowchart-no-undef.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/class-no-undef.ts)
- [Tests source](../../tests/rules/class-no-undef.test.ts)

<!-- end auto-generated rule resources -->
