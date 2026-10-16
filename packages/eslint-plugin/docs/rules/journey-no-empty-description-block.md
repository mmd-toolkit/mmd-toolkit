# @mmd-toolkit/journey-no-empty-description-block

Japanese version:
[journey-no-empty-description-block.ja.md](./journey-no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A description block is written to give the journey its description. When the
block holds nothing, or only whitespace, mermaid.js accepts it and does nothing
with it, so the block has no effect.

## Rule Details

This rule reports an `accDescr` block that holds nothing or only whitespace. It
applies to `journey`. A directive in the block is no text: a block that holds
only directives is reported too, and mermaid.js still applies their settings.

The description stays what it was before the block: after `accDescr: a`, the
block `accDescr {}` leaves the description `a`.

A block that holds only comments is not reported. The author who turns the lines
of a description into comments means the block to do nothing, and mermaid.js
reads it so. A block that holds a comment line is not reported also when it
holds directives besides; mermaid.js applies their settings. A block left to be
filled in later is written with a comment in it, as `accDescr {`, `%% TODO`, and
`}`, and it is not reported.

An empty block may also stand on the line of another statement: after the
header, as in `journey accDescr {}`, before a task, as in `accDescr {} A: 5`,
after another block, and next to another empty block. It sets no description
there either, and the rule reports each block in the same way. Inside the text
of a title, a section, or a task, and in the data of a task, `accDescr {}` is
part of that text, and the rule does not report it.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/journey-no-empty-description-block: error
journey
  accDescr {}
  section Work
    Make tea: 5: Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-empty-description-block: error
journey
  accDescr { }
  section Work
    Make tea: 5: Me
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/journey-no-empty-description-block: error
journey
  accDescr { y }
  section Work
    Make tea: 5: Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-empty-description-block: error
journey
  accDescr {
    %% old description
  }
  section Work
    Make tea: 5: Me
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.md)
- [journey-no-duplicate-description](./journey-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/journey-no-empty-description-block.ts)
- [Tests source](../../tests/rules/journey-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
