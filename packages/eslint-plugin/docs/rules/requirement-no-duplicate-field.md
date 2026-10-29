# @mmd-toolkit/requirement-no-duplicate-field

Japanese version:
[requirement-no-duplicate-field.ja.md](./requirement-no-duplicate-field.ja.md)

Disallow a field that the body of a requirement or an element already has.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

Each field of a requirement, `id`, `text`, `risk`, and `verifyMethod`, and of an
element, `type` and `docRef`, holds one value. When a body writes a field twice,
mermaid.js keeps the first value and drops the later ones without an error.

## Rule Details

This rule applies to requirement diagrams (`requirementDiagram`). It reports
each repeated field in a requirement or element body whose value differs from
the first value of that field in the same body. Field keywords are read in any
case.

Values are compared without surrounding whitespace or string quotes; `risk` and
`verifyMethod` are also compared without case. A field that repeats the first
value is not reported: `id: 1`, `id: 2`, and `id: 1` give one report, while
`id: 1`, `id: 2`, and `id: 3` give two. An empty description block between
fields does not affect the comparison.

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
