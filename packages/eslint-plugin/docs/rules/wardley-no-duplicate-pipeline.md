# @mmd-toolkit/wardley-no-duplicate-pipeline

Japanese version:
[wardley-no-duplicate-pipeline.ja.md](./wardley-no-duplicate-pipeline.ja.md)

Disallow a pipeline that replaces the children of an earlier pipeline of the
same parent.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A parent has one pipeline. A later pipeline of the parent does not add its
children to the earlier ones: mermaid.js replaces them without an error, and a
child of the earlier pipeline is left out of the box of the pipeline, though it
is still drawn as a node.

## Rule Details

This rule applies to Wardley maps (`wardley-beta`). It reports a pipeline with
different children from the preceding pipeline for the same parent. A pipeline
with the same children, even in a different order, is not reported. A child
given a different position in the later pipeline is reported instead by
[wardley-no-redefined-node](./wardley-no-redefined-node.md).

Pipelines written before their parent is declared are compared too. Names are
compared as [wardley-no-undef](./wardley-no-undef.md) compares them.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-pipeline: error
wardley-beta
  component Database [0.4, 0.8]
  pipeline Database {
    component SQL [0.5]
  }
  pipeline Database {
    component Cloud [0.9]
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-pipeline: error
wardley-beta
  component Database [0.4, 0.8]
  pipeline Database {
    component SQL [0.5]
    component Cloud [0.9]
  }
```

## Options

This rule has no options.

## Related Rules

- [wardley-no-redefined-node](./wardley-no-redefined-node.md)
- [wardley-no-undef](./wardley-no-undef.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-duplicate-pipeline.ts)
- [Tests source](../../tests/rules/wardley-no-duplicate-pipeline.test.ts)

<!-- end auto-generated rule resources -->
