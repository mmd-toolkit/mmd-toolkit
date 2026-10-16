# @mmd-toolkit/class-no-undef

Japanese version: [class-no-undef.ja.md](./class-no-undef.ja.md)

Disallow a statement that refers to a class that the diagram does not define.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`style`, `cssClass`, `click`, `link`, `callback`, and `note for` name a class.
When the name is that of no class of the diagram, mermaid.js accepts the
statement and does nothing with it, or draws a note that points at nothing. A
misspelled name gives no error.

## Rule Details

This rule reports a class name in such a statement that is the id of no class of
the diagram. It applies to `classDiagram`.

The classes of a diagram are those that a class statement, a relation, or a
member statement such as `A : +int x` declares, anywhere in the diagram and in
any namespace. When only one end of a relation is a lollipop, as `bar` in
`bar ()-- foo`, the relation declares no class at that end: mermaid.js makes it
an interface, and `style bar fill:#f00` changes nothing. With a lollipop at both
ends, as in `A ()--() B`, both are classes. Unlike in a flowchart, where `style`
makes the vertex that it names, `style Z fill:#f00` with no class `Z` makes no
class and changes nothing. `cssClass "C" c`, `click C href "…"`, `link C "…"`,
and `callback C "f"` with no class `C` change nothing either. `note for Z "x"`
keeps the note, and mermaid.js draws it without the line to a class, because it
finds no class `Z` when it draws the diagram
([`getData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L810-L829)).

A statement written before the class is declared changes nothing in mermaid.js
either: `style A fill:#f00`, `cssClass "A" c`, `click A href "…"`, `link A "…"`,
and `callback A "f"` before `class A` change nothing, while after a relation or
a member statement that declares `A` they apply. `note for A "x"` before
`class A` still points at `A`. Such a statement names a class of the diagram,
which is written correctly, and the rule does not report it.

Two more statements name a class correctly and do nothing, and the rule does not
report them either. A class whose id starts with an ASCII digit, as `1A`, gets
nothing from `cssClass`, `link`, and `click … href`, wherever they stand,
because mermaid.js looks it up under another id; `style` and `callback` apply to
it. And `note for A~T~ "x"` after `class A~T~` points at the class `A`, while
mermaid.js looks the class up with its generic type and draws the note without
the line.

Each name of the list of `cssClass` is checked. A space after a `,`, as in
`cssClass "A, B" c`, is part of the name ` B`, which names no class, and
mermaid.js gives `B` no CSS class. A backquoted name of `click`, `link`, and
`callback` is divided at `,` in the same way, and each part is checked:
``click `A,B` href "…"`` makes both `A` and `B` links. The name after `note for`
is not divided.

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
