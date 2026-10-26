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

This rule reports a pipeline whose children differ from the ones of the pipeline
of the same parent before it. It applies to `wardley`.

After a pipeline of `Database` with `SQL` and one with `Cloud`, the box of the
pipeline holds only `Cloud`.

A pipeline with the same children, also in another order, is not reported; a
child given another position there is reported by
[wardley-no-redefined-node](./wardley-no-redefined-node.md). A parent declared
after the pipeline counts. Names are compared as
[wardley-no-undef](./wardley-no-undef.md) compares them.

Write the children of a parent in one pipeline.

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

## Background

[`startPipeline`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyBuilder.ts#L112-L120)
starts the children of a parent anew.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-duplicate-pipeline.ts)
- [Tests source](../../tests/rules/wardley-no-duplicate-pipeline.test.ts)

<!-- end auto-generated rule resources -->
