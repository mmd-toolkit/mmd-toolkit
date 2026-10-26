# @mmd-toolkit/eventmodeling-no-undef

Japanese version: [eventmodeling-no-undef.ja.md](./eventmodeling-no-undef.ja.md)

Disallow a source or a data reference that names nothing.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A time frame names its sources by their numbers after `->>`, and its data block
by its name between `[[` and `]]`. When the name is the name of no frame or of
no data block, mermaid.js accepts it without an error, and draws no relation
from that source and no data of that reference.

## Rule Details

This rule reports a source of a `tf` or `timeframe` statement that names no
frame, and a `[[ ]]` reference of a frame that names no `data` block. It applies
to `eventmodeling`.

After `tf 01 ui Cart`, the frame `tf 02 cmd Buy ->> 99` has no relation: a frame
with sources draws relations only from them, and not from the frame before it.
With `data Payload`, the frame `tf 01 evt Bought [[Paylod]]` shows no data; with
inline data, as in `tf 01 evt Bought [[Paylod]] {fallback }`, it shows the
inline data in place of the block.

A frame or a data block declared after the reference counts. Names are compared
as written, with their case: `1`, `01`, and `001` name three frames. A source
that names a frame declared later counts too, though mermaid.js draws no
relation from it, since it draws the relations of a frame when it places the
frame. The sources of a reset frame (`rf` or `resetframe`) are not checked:
mermaid.js draws no relation of a reset frame, whatever its sources name. The
frames that `note` and `gwt` name are not checked either, since mermaid.js draws
neither statement.

Correct the name, or declare the frame or the data block.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-undef: error
eventmodeling
  tf 01 ui Cart
  tf 02 cmd Buy ->> 99
```

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-undef: error
eventmodeling
  tf 01 evt Bought [[Paylod]]
  data Payload {
items
}
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-undef: error
eventmodeling
  tf 01 ui Cart
  tf 02 cmd Buy ->> 01
```

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-undef: error
eventmodeling
  tf 01 evt Bought [[Payload]]
  data Payload {
items
}
```

## Options

This rule has no options.

## Related Rules

- [eventmodeling-no-redefined-data](./eventmodeling-no-redefined-data.md)

## Background

[`getState`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/db.ts#L106-L128)
takes the frames whose numbers the sources give and draws a relation from each
of them, and infers one from the frame before only for a frame without sources;
[`decidePositionRelation`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/db.ts#L570-L593)
draws no relation of a reset frame, and none from a frame not placed yet. The
[data of a frame](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/db.ts#L339-L362)
is the first data block of the name, or its inline data when no block has the
name.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/eventmodeling-no-undef.ts)
- [Tests source](../../tests/rules/eventmodeling-no-undef.test.ts)

<!-- end auto-generated rule resources -->
