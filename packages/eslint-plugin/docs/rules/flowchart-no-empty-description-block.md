# @mmd-toolkit/flowchart-no-empty-description-block

Japanese version:
[flowchart-no-empty-description-block.ja.md](./flowchart-no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A description block is written to give the diagram its description. When the
block holds nothing, or only whitespace, mermaid.js accepts it and takes no
description from it.

## Rule Details

This rule reports a closed `accDescr` block that holds nothing or only
whitespace. It applies to `flowchart-v2`, `flowchart-elk`, and `swimlane`. A
directive in the block is no text: a block that holds only directives is
reported too, and mermaid.js still applies their settings.

The description stays what it was before the block: after `accDescr: x`, the
block `accDescr { }` leaves the description `x`, and with no description before
it, the description stays empty. An empty description written as a line is
different: `accDescr:` with no line that holds text after it sets the
description to the empty text.

A block that holds only comments is not reported. The author who turns the lines
of a description into comments means the block to do nothing, and mermaid.js
reads it so: the description before the block stays. A block that holds a
comment line is not reported also when it holds directives besides; mermaid.js
applies their settings. A block left to be filled in later is written with a
comment in it, as `accDescr {`, `%% TODO`, and `}`, and it is not reported.

An empty block may also follow the last part of a statement on the same line, as
in `A accDescr {}`, or the header, as in `flowchart LR accDescr {}`. It sets no
description there either, and the rule reports it in the same way.

After the name of a subgraph that has no title, the whitespace around an empty
block can become part of the name, and a name that holds whitespace gives the
subgraph a generated id, such as `subGraph0`, instead of the name. When the name
has no whitespace of its own and the subgraph gets a generated id in this way,
as in `subgraph S accDescr {}`, `style S` and links to `S` no longer reach it.
The message of the rule says so for each empty block between the name and the
end of its line or a `;`.

For a block that starts its line, the rule suggests removing it, with the
whitespace after it, or with its line when nothing else is on the line. A `;`
after it stays. mermaid.js then reads the diagram as before, because the block
changed nothing. A block that holds a directive gets no suggestion: removing the
block would remove the directive, whose settings mermaid.js applies. A block
that follows something on its line gets no suggestion: whether removing the
whitespace before it changes how mermaid.js reads what comes before depends on
that statement, as after the name of a subgraph, where the whitespace can be
part of the name. Nor does a block at the start of the body of a subgraph get
one when a U+2028, a U+2029, or an unclosed directive stands between the name
and the block: such a character or directive carries line breaks into the name,
and without the block mermaid.js may read the lines after it as part of the
name.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr {}
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr { }
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr {
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr { y }
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr {
    %% c
  }
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.md)
- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/flowchart-no-empty-description-block.ts)
- [Tests source](../../tests/rules/flowchart-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
