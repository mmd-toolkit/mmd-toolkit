# @mmd-toolkit/requirement-no-duplicate-name

Japanese version:
[requirement-no-duplicate-name.ja.md](./requirement-no-duplicate-name.ja.md)

Disallow a requirement or an element that reuses the name of an earlier one.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js keeps the first requirement and the first element of each name. A
later requirement with the name of a requirement, or a later element with the
name of an element, gives no error, and its kind and its fields are dropped:
only its classes apply. A reused name is usually left over from copying a block.

## Rule Details

This rule applies to requirement diagrams (`requirementDiagram`). It reports a
requirement or element that reuses a name when its kind or a field value is
lost: the requirement kind differs from the first requirement of that name, or
it has a field that the first statement does not have with the same value.
Requirements and elements are compared separately with the first of the same
name.

Each later statement that loses something gives one report.

A later statement that only repeats fields with their kept values is not
reported. Values are compared without surrounding whitespace or string quotes,
and `risk` and `verifyMethod` ignore case. Names are case-sensitive, but quotes
around a name do not change it.

A requirement and an element with the same name are not reported because
mermaid.js keeps both. A later statement of the same kind without fields only
applies its classes, to the requirement when the name has one, and is not
reported.

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

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-name: error
requirementDiagram
  requirement x {
    id: 1
  }
  element x {
    type: module
  }
```

## Options

This rule has no options.

## Related Rules

- [er-no-redefined-entity](./er-no-redefined-entity.md)
- [requirement-no-undef](./requirement-no-undef.md)
- [requirement-no-duplicate-field](./requirement-no-duplicate-field.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/requirement-no-duplicate-name.ts)
- [Tests source](../../tests/rules/requirement-no-duplicate-name.test.ts)

<!-- end auto-generated rule resources -->
