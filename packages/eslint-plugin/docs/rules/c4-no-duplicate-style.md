# @mmd-toolkit/c4-no-duplicate-style

Japanese version: [c4-no-duplicate-style.ja.md](./c4-no-duplicate-style.ja.md)

Disallow a style update that replaces a value that an earlier update gave.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`UpdateElementStyle` and `UpdateRelStyle` set the style of an element, a
boundary, or a relationship, and a later update replaces only the fields that it
gives. When it gives a field again, the earlier value is lost without an error:
after `UpdateElementStyle(a, $bgColor="red")`, the update
`UpdateElementStyle(a, $bgColor="blue")` leaves only the blue background.

## Rule Details

This rule reports an argument of `UpdateElementStyle` or `UpdateRelStyle` that
gives a field of its target a value other than the one that an earlier update,
or an earlier argument of the same update, gave that field. It applies to `c4`.
`UpdateElementStyle` updates an element or a boundary, the initial boundary
`global` included, and `UpdateRelStyle` updates a relationship; the grammar of
mermaid.js has no other style update.

The target is the one that the update finds, as [c4-no-undef](./c4-no-undef.md)
describes: the first element, or else the first boundary, whose alias equals the
first argument, or the first relationship whose endpoints, in their order, equal
the first two arguments, among those declared before the update. A named
`$alias`, `$from`, or `$to` changes what later updates find, and the field that
it gives is not compared. An update that finds no target changes nothing and is
not compared.

A field is the parameter of the place of an argument, as `bgColor` for the
second argument of `UpdateElementStyle`, or the key of a named attribute, as
`$bgColor`, in any place: `UpdateElementStyle(a, "red", $bgColor="blue")` gives
`bgColor` twice. Keys are compared with their case: `$BgColor` is another field,
which [c4-no-invalid-attribute-key](./c4-no-invalid-attribute-key.md) reports. A
value that a declaration gives is not compared. When a declaration writes a
field, that field's previous update value is no longer compared; update values
of fields that the declaration leaves unchanged are kept.

An empty argument gives its field the empty value: after
`UpdateElementStyle(a, $bgColor="red")`, the update
`UpdateElementStyle(a, , "white")` replaces `red` with the empty value. The
empty argument has no text of its own, so the rule reports its update.

A value that the field already has is not reported, nor a field that the target
has not had. After `red` and `blue`, a third `red` is reported, because it
replaces `blue`. Values are compared without the whitespace at their ends, and
otherwise as written: mermaid.js turns character references, as `#35;`, and the
quotes of HTML attributes into other characters before it reads a value, and it
reads the offsets in the fifth and sixth places of `UpdateRelStyle` as whole
numbers, so two values that differ only in those, as `10` and `010` for an
offset, may be one value for mermaid.js and two for this rule.

Give each field of a target once. To give one field, use a named attribute, as
`UpdateElementStyle(a, $fontColor="white")`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-style: error
C4Context
  Person(a, "A")
  UpdateElementStyle(a, $bgColor="red")
  UpdateElementStyle(a, $bgColor="blue")
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-style: error
C4Context
  Person(a, "A")
  UpdateElementStyle(a, $bgColor="red")
  UpdateElementStyle(a, , "white")
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-style: error
C4Context
  Person(a, "A")
  UpdateElementStyle(a, $bgColor="red")
  UpdateElementStyle(a, $fontColor="white")
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-style: error
C4Context
  Person(a, "A")
  Person(b, "B")
  Rel(a, b, "Uses")
  UpdateRelStyle(a, b, $textColor="red", $lineColor="blue")
```

## Options

This rule has no options.

## Related Rules

- [c4-no-undef](./c4-no-undef.md)
- [c4-no-invalid-attribute-key](./c4-no-invalid-attribute-key.md)

## Background

[`updateElStyle`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Db.ts#L494-L590)
and
[`updateRelStyle`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Db.ts#L593-L638)
assign each field that an argument gives, an empty argument included, over the
value that the target had.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/c4-no-duplicate-style.ts)
- [Tests source](../../tests/rules/c4-no-duplicate-style.test.ts)

<!-- end auto-generated rule resources -->
