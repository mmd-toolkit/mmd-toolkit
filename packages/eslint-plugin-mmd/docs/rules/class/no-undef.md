# mmd/class/no-undef

Japanese version: [no-undef.ja.md](./no-undef.ja.md)

Disallow a statement that refers to a class that the diagram does not define.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

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
any namespace. Unlike in a flowchart, where `style` makes the vertex that it
names, `style Z fill:#f00` with no class `Z` makes no class and changes nothing.
`cssClass "C" c`, `click C href "…"`, `link C "…"`, and `callback C "f"` with no
class `C` change nothing either. `note for Z "x"` keeps the note, and mermaid.js
draws it without the line to a class, because it finds no class `Z` when it
draws the diagram
([`getData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L810-L829)).

Each name of the list of `cssClass` is checked. A space after a `,`, as in
`cssClass "A, B" c`, is part of the name ` B`, which names no class, and
mermaid.js gives `B` no CSS class.

Examples of **incorrect** code for this rule:

```mmd
%% eslint mmd/class/no-undef: error
classDiagram
  class A
  cssClass "C" c
```

```mmd
%% eslint mmd/class/no-undef: error
classDiagram
  class A
  click C href "https://x.example"
```

```mmd
%% eslint mmd/class/no-undef: error
classDiagram
  note for Z "x"
```

Examples of **correct** code for this rule:

```mmd
%% eslint mmd/class/no-undef: error
classDiagram
  class A
  style A fill : #f00 , stroke-width: 2px
```

```mmd
%% eslint mmd/class/no-undef: error
classDiagram
  Class11 <|.. Class12
  note for Class11 "test"
```

## Options

This rule has no options.

## Related Rules

- [flowchart/no-undef](../flowchart/no-undef.md)
