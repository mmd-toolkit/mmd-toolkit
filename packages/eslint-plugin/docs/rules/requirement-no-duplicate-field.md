# @mmd-toolkit/requirement-no-duplicate-field

Japanese version:
[requirement-no-duplicate-field.ja.md](./requirement-no-duplicate-field.ja.md)

Disallow a field that the body of a requirement or an element already has.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

Each field of a requirement, `id`, `text`, `risk`, and `verifyMethod`, and of an
element, `type` and `docRef`, holds one value. When a body writes a field twice,
mermaid.js keeps the first value and drops the later ones without an error.

## Rule Details

This rule reports every field of a body after the first one of the same field,
when its value is not the value of the first one. It applies to `requirement`.

After `id: 1`, a second `id: 2` leaves the id `1`, and so for the other fields:
after `risk: low` and `risk: high`, the risk is `Low`. The keywords are read in
any case, so `ID: 2` after `id: 1` is reported too. A later field with the value
of the first one loses nothing, and it is not reported: after `id: 1`, a second
`id: 1` changes nothing. The values are compared as mermaid.js keeps them:
without the whitespace at their ends, a string as its text without the quotes,
as `text: "t"` and `text: t`, and `risk` and `verifyMethod` in any case, as
`risk: low` and `risk: Low`. Each later field with another value is reported,
two for `id: 1`, `id: 2`, and `id: 3`, also with an empty description block
between them; `id: 1`, `id: 2`, and `id: 1` give one report, since the third is
the value kept.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-field: error
requirementDiagram
  requirement r {
    id: 1
    id: 2
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-field: error
requirementDiagram
  requirement r {
    id: 1
    text: second
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-field: error
requirementDiagram
  requirement r {
    id: 1
    risk: low
    risk: Low
  }
```

## Options

This rule has no options.

## Related Rules

- [requirement-no-duplicate-name](./requirement-no-duplicate-name.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/requirement-no-duplicate-field.ts)
- [Tests source](../../tests/rules/requirement-no-duplicate-field.test.ts)

<!-- end auto-generated rule resources -->
