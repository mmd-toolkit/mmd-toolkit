# @mmd-toolkit/gantt-no-duplicate-description

英語版: [gantt-no-duplicate-description.md](./gantt-no-duplicate-description.md)

説明をもう一度設定する `accDescr` の文を禁止する。

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

この規則は、ガントチャート（`gantt`）に当てる。
現在の説明を別の値に置き換える `accDescr:` の文か説明のブロックを報告する。
現在の説明を繰り返す文は、2 つの形を混ぜても報告しない。

説明は、両端の空白と各改行の後の空白を除いて比べるので、
ブロックの字下げと空行は数えない。
LF、CRLF、CR の改行は、LF として比べる。
`accDescr: a` と `accDescr: b` の後の 3 つ目の `accDescr: a` は、
`b` を置き換えるので報告する。

行にテキストのない `accDescr:` も説明を設定するので数える。
その文は、テキストを持つ次の行を取る。
説明を持たないブロックは数えない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-description: error
gantt
  accDescr: first
  accDescr { second }
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-description: error
gantt
  accDescr: first
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-description: error
gantt
  accDescr: first
  accDescr {
    first
  }
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.ja.md)
- [gantt-no-duplicate-title](./gantt-no-duplicate-title.ja.md)
- [gantt-no-empty-description-block](./gantt-no-empty-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gantt-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/gantt-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
