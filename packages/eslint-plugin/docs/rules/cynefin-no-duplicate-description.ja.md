# @mmd-toolkit/cynefin-no-duplicate-description

英語版:
[cynefin-no-duplicate-description.md](./cynefin-no-duplicate-description.md)

前に設定した説明を置き換える `accDescr` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

cynefin の図は、
`accDescr` が行かブロックで設定するアクセシブルな説明を 1 つ持つ。
後の `accDescr` は、前に設定した説明をエラーなしに置き換え、前の説明は失われる。

## 規則の詳細

この規則は、
前の `accDescr` が設定した空でない説明を変える `accDescr` 文を報告する。
対象の図種は `cynefin` である。

行の形とブロックの形は混ぜてよく、どちらが後でも、最後に書いた説明が使われる。
文字のない、または空白だけの `accDescr:` は説明を空にし、次の行を取らない。
説明の後では、これを報告する。
コメント行だけのブロックも、mermaid.js がコメントを取り除くので説明を空にし、
`accDescr: d` の後のブロック `accDescr {`、`%% TODO`、
`}` は `d` を取り除くので報告する。
ほかに何も持たないブロックは
[cynefin-no-empty-description-block](./cynefin-no-empty-description-block.ja.md)
が報告する。
空の説明の後の文は何も失わず、報告しない。

図がすでに持つ説明を設定する文は、どちらの形でも報告しない。
`accDescr: d` の後のブロック `accDescr { d }` は何も失わない。
説明は mermaid.js が保つとおりに、各行の先頭と末尾の空白を除き、空の行を除き、
2 つ以上の空白やタブの連なりを 1 つの空白として比べるので、
ブロックの行の字下げと行の間の空の行は数えない。
すべての改行（LF、CRLF、CR）は LF として読む。
ブロックでは U+2028 と U+2029 も行を終え、その両側の空白もともに除く。
`accDescr:` の行では、それらは文字である。
`accDescr: a` と `accDescr: b` の後の 3 つ目の `accDescr: a` は、
`b` を置き換えるので報告する。
説明はそのほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
説明を読む前にほかの文字に変えるので、それだけが違う 2 つの説明は、
mermaid.js には 1 つで、この規則には 2 つのことがある。

`accDescr` 文は 1 つにする。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/cynefin-no-duplicate-description: error
cynefin-beta
  accDescr: First
  accDescr: Second
  complex
    "Investigate"
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/cynefin-no-duplicate-description: error
cynefin-beta
  accDescr: Second
  complex
    "Investigate"
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [cynefin-no-duplicate-title](./cynefin-no-duplicate-title.ja.md)
- [cynefin-no-empty-description-block](./cynefin-no-empty-description-block.ja.md)

## 背景

[値の変換](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L57-L68)
は、説明の両端とブロックの各行の両端の空白、ブロックの空の行を除き、
2 つ以上の空白やタブの連なりを 1 つの空白にする。
パーサーは最後の説明を保ち、
[`populateCommonDb`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L14)
は、それが空でないときだけそれを設定する。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/cynefin-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/cynefin-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
