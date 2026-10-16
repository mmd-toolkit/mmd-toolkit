# @mmd-toolkit/er-no-duplicate-description

英語版: [er-no-duplicate-description.md](./er-no-duplicate-description.md)

説明をもう一度設定する `accDescr` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

図の説明は 1 つである。
mermaid.js はどの `accDescr` の文も受理し、
説明を設定する文は、それより前に設定した説明を黙って置き換える。
2 つ目の説明は、たいてい、テキストを書き直した残りか、
同じ部分を 2 回貼り付けたものである。

## 規則の詳細

この規則は、説明を設定する文のうち、最初のもの以外を、
前と違う説明を設定するときに報告する。
対象の図種は `er` である。

`accDescr:` も、テキストのある説明のブロックも説明を設定し、混ぜてもよい。
`accDescr: a` と `accDescr { b }` の後、説明は `b` になる。
行にテキストのない `accDescr:` は、`accTitle:` と同じように、
テキストを持つ次の行を取る。
テキストの終わりでは、mermaid.js はそれを拒否する。
subgraph の中の文も、図全体の説明を設定するので、数える。
mermaid.js は、そのテキストを subgraph の要素にも加える。

説明を持たないブロックは、数えない。
それは、
[er-no-empty-description-block](./er-no-empty-description-block.ja.md)
が報告する。

図がすでに持つ説明を設定する文は、どちらの形でも報告しない。
`accDescr: d` の後のブロック `accDescr { d }` は、何も失わない。
説明は、mermaid.js が持つとおりに、
両端の空白と、各改行の後の空白を除いて比べる。
そのため、ブロックの行の字下げと、その中の空行は数えない。
改行は、LF、CRLF、CR のどれも LF として読む。
そのため、CRLF で書いたブロックは、LF で書いたブロックと同じ説明を設定する。
`accDescr: a` と `accDescr: b` の後の 3 つ目の `accDescr: a` は、
`b` を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-description: error
erDiagram
  accDescr: first
  accDescr: second
  A
```

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-description: error
erDiagram
  accDescr: first
  accDescr { second }
  A
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-description: error
erDiagram
  accTitle: first
  accDescr: second
  A
```

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-description: error
erDiagram
  accDescr: first
  accDescr {
    first
  }
  A
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.ja.md)
- [er-no-duplicate-title](./er-no-duplicate-title.ja.md)
- [er-no-empty-description-block](./er-no-empty-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/er-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/er-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
