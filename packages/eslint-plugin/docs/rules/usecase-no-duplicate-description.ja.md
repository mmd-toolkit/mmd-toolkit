# @mmd-toolkit/usecase-no-duplicate-description

英語版:
[usecase-no-duplicate-description.md](./usecase-no-duplicate-description.md)

前に設定した説明を置き換える `accDescr` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

ユースケース図は、
`accDescr` が行かブロックで設定するアクセシブルな説明を 1 つ持つ。
後の `accDescr` は、前に設定した説明をエラーなしに置き換え、前の説明は失われる。

## 規則の詳細

この規則は、
前の `accDescr` が設定した空でない説明を変える `accDescr` 文を報告する。
対象の図種は `usecase` である。

行の形とブロックの形は混ぜてよく、どちらが先でも、最後に書いた説明が使われる。
文字のない `accDescr:` は空の説明を設定し、次の行を取らない。
説明の後では報告する。
コメント行だけを持つブロックも空の説明を設定する。
mermaid.js はコメントを取り除くので、`accDescr: d` の後のブロック `accDescr {`、
`%% TODO`、`}` は `d` を取り除き、報告する。
何も持たないブロックは
[usecase-no-empty-description-block](./usecase-no-empty-description-block.ja.md)
が報告する。
空の説明の後の文は何も失わず、報告しない。

図がすでに持つ説明を設定する文は、どちらの形でも報告しない。
`accDescr: d` の後のブロック `accDescr { d }` は何も失わない。
説明は mermaid.js が保つとおりに、
両端の空白と各改行の後の空白を除いて比べるので、
ブロックの行の字下げとその中の空の行は数えない。
改行（LF、CRLF、CR）はどれも LF として読む。
`accDescr: a` と `accDescr: b` の後の 3 つ目の `accDescr: a` は、
`b` を置き換えるので報告する。
説明はそのほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
説明を読む前にほかの文字に変えるので、それだけが違う 2 つの説明は、
mermaid.js には 1 つで、この規則には 2 つのことがある。

説明は 1 つにし、複数行の説明は 1 つのブロックに書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-description: error
usecase-beta
  accDescr: first
  accDescr: second
  A
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-description: error
usecase-beta
  accDescr: first
  A
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [usecase-no-duplicate-title](./usecase-no-duplicate-title.ja.md)
- [usecase-no-empty-description-block](./usecase-no-empty-description-block.ja.md)
- [usecase-no-unclosed-description-block](./usecase-no-unclosed-description-block.ja.md)

## 背景

[`accDescr` 文](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecase.visitor.ts#L132-L140)
は両端の空白を除いた説明を与え、
[モデル](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseModelBuilder.ts#L243-L245)
は最後のものだけを保ち、
共通の
[`setAccDescription`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L22-L24)
は各改行の後の空白を取り除く。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/usecase-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/usecase-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
