# @mmd-toolkit/quadrant-no-duplicate-description

英語版:
[quadrant-no-duplicate-description.md](./quadrant-no-duplicate-description.md)

チャートの説明をもう一度設定する文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

図の説明は 1 つである。
別の `accDescr` の文が説明を設定すると、
mermaid.js はエラーなしに後の説明を使い、前の説明は失われる。

## 規則の詳細

この規則は、象限チャート（`quadrantChart`）に当てる。
現在の説明を別の値に置き換える `accDescr:` の文か説明のブロックを報告する。
現在の説明を繰り返す文は、2 つの形を混ぜても報告しない。

説明は、両端の空白と各改行の後の空白を除いて比べるので、
ブロックの字下げと空行は数えない。
LF、CRLF、CR の改行は、LF として比べる。
`accDescr: a` と `accDescr: b` の後の 3 つ目の `accDescr: a` は、
`b` を置き換えるので報告する。

キーワードは大文字小文字を問わず読む。
行にテキストのない `accDescr:` は、テキストを持つ次の行を取る。
空行、コメント行、ディレクティブは飛ばす。
説明を持たないブロックは、コメントだけかディレクティブだけのものも含めて、
数えない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-description: error
quadrantChart
  accDescr: first
  accDescr {
    second
  }
  A: [0.3, 0.6]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-description: error
quadrantChart
  accDescr: first
  A: [0.3, 0.6]
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-description: error
quadrantChart
  accDescr: first
  accDescr {
    first
  }
  A: [0.3, 0.6]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [quadrant-no-duplicate-title](./quadrant-no-duplicate-title.ja.md)
- [quadrant-no-empty-description-block](./quadrant-no-empty-description-block.ja.md)
- [xychart-no-duplicate-description](./xychart-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/quadrant-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/quadrant-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
