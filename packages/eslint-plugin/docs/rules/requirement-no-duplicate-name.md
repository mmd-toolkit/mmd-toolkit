# @mmd-toolkit/requirement-no-duplicate-name

Japanese version:
[requirement-no-duplicate-name.ja.md](./requirement-no-duplicate-name.ja.md)

Disallow a requirement or an element that reuses the name of an earlier one.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js keeps the first requirement and the first element of each name. A
later one with the same name gives no error, and its kind and its fields are
dropped: only its classes apply. A reused name is usually left over from copying
a block.

## Rule Details

This rule reports the name of a requirement or an element in two cases.
mermaid.js keeps the requirements and the elements apart, so a requirement is
compared with the earlier requirements, and an element with the earlier
elements. When one of them has the same name, the later statement is reported if
it holds a field or, for a requirement, is another kind of requirement. When
none of them has the name but a statement of the other kind has it, the later
statement makes a second box of that name, and it is reported. It applies to
`requirement`.

After `requirement r` with `id: 1`, a second `requirement r` with `id: 2` and
`text: second` leaves `r` with the id `1` and no text, and a second
`functionalRequirement r` leaves its kind `requirement`. An element with the
name of a requirement, or a requirement with the name of an element, is a second
box of that name: `style`, `class`, and the classes after `:::` with that name
go to the requirement. After `element x` and `requirement x`, a third
`requirement x` with `id: 2` is reported, and its id is dropped; a third
`requirement x` without a field is not reported. After `requirement x` and
`element x`, `element x:::c` is not reported, and it gives the class `c` to the
requirement. A name in quotes is the same name: `requirement "r"` after
`requirement r` is reported. Names differ in case: `requirement r` and
`requirement R` are two requirements. Each statement that the rule reports
counts once: three `requirement r` with fields give two reports.

A later statement of the same kind without a field, as `requirement r:::c {`
followed by `}`, only gives the classes, and is not reported; `r:::c` writes the
same.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-name: error
requirementDiagram
  requirement r {
    id: 1
  }
  requirement r {
    text: second
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-name: error
requirementDiagram
  requirement r {
    id: 1
  }
  requirement s {
    text: second
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-name: error
requirementDiagram
  requirement r {
    id: 1
  }
  r:::important
```

## Options

This rule has no options.

## Related Rules

- [er-no-redefined-entity](./er-no-redefined-entity.md)
- [requirement-no-undef](./requirement-no-undef.md)
- [requirement-no-duplicate-field](./requirement-no-duplicate-field.md)

## Background

mermaid.js adds a requirement or an element only when it has none of that name,
and then forgets the fields read for it
([`addRequirement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L126-L141)
and
[`addElement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L172-L185)).

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/requirement-no-duplicate-name.ts)
- [Tests source](../../tests/rules/requirement-no-duplicate-name.test.ts)

<!-- end auto-generated rule resources -->
