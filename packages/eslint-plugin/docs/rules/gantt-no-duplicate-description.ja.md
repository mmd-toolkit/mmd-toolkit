# @mmd-toolkit/gantt-no-duplicate-description

英語版:
[gantt-no-duplicate-description.md](./gantt-no-duplicate-description.md)

説明をもう一度設定する `accDescr` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

ガントチャートの説明は 1 つである。
mermaid.js は `accDescr` の文をすべて受理し、説明を設定する文のそれぞれが、
前に設定した説明を黙って置き換える。
2 つ目の説明は、たいてい、テキストを書き直した残りか、
一部分を 2 回貼り付けたものである。

## 規則の詳細

この規則は、説明を設定する文のうち、最初のものより後のものを、
前と違う説明を設定するときに報告する。
対象の図種は `gantt` である。

`accDescr:` と、テキストのある説明のブロックは、どちらも説明を設定し、
混ぜて書いてもよい。
`accDescr: a` と `accDescr { b }` の後、説明は `b` になり、
`accDescr { a }` と `accDescr: b` の後も `b` になる。
行にテキストのない `accDescr:` は、`accTitle:` と同じく、
テキストを持つ次の行を取る。

説明を持たないブロックは数えない。
`accDescr: a` の後のブロック `accDescr {}` は、説明を `a` のままにする。
これは [gantt-no-empty-description-block](./gantt-no-empty-description-block.ja.md) が報告する。

図がすでに持つ説明を設定する文は、どちらの形でも報告しない。
`accDescr: d` の後のブロック `accDescr { d }` は、何も失わない。
説明は、mermaid.js が持つとおりに、両端の空白と、
各改行の後の空白を除いて比べる。
そのため、ブロックの行の字下げと、その中の空行は数えない。
改行は、LF、CRLF、CR のどれも LF として読む。
そのため、CRLF で書いたブロックは、LF で書いたブロックと同じ説明を設定する。
`accDescr: a` と `accDescr: b` の後の 3 つ目の `accDescr: a` は、
`b` を置き換えるので報告する。

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
