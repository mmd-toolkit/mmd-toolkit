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

This rule reports every field of a body after the first one of the same field.
It applies to `requirement`.

After `id: 1`, a second `id: 2` leaves the id `1`, and so for the other fields:
after `risk: low` and `risk: high`, the risk is `Low`. The keywords are read in
any case, so `ID: 2` after `id: 1` is reported too. Each later field is
reported, two for three fields of one kind, also with an empty description block
between them.

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

## Options

This rule has no options.

## Related Rules

- [requirement-no-duplicate-name](./requirement-no-duplicate-name.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/requirement-no-duplicate-field.ts)
- [Tests source](../../tests/rules/requirement-no-duplicate-field.test.ts)

<!-- end auto-generated rule resources -->
