# @mmd-toolkit/class-no-duplicate-description

英語版: [class-no-duplicate-description.md](./class-no-duplicate-description.md)

説明をもう一度設定する `accDescr` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

図の説明は 1 つである。
mermaid.js はどの `accDescr` の文も受理し、
それぞれの文は、それより前に設定した説明を黙って置き換える。
2 つ目の説明は、たいてい、テキストを書き直した残りか、
同じ部分を 2 回貼り付けたものである。

## 規則の詳細

この規則は、説明を設定する文のうち、最初のもの以外を、
前と違う説明を設定するときに報告する。
対象の図種は `classDiagram` である。

`accDescr:` も、テキストのある説明のブロックも、説明を設定する。
テキストのない `accDescr:` は、空行、コメント行、ディレクティブを飛ばして、
テキストを持つ次の行を説明にする。
そうした行が後になければ、mermaid.js はそれを拒否する。
1 行の形とブロックの形を混ぜても、どちらが先でも、
後に書いたほうの説明が使われる。
`accDescr: first` と `accDescr: second` の後、説明は `second` になり、
`first` を持つブロックの後の `accDescr: second` でも同じである。

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
%% eslint @mmd-toolkit/class-no-duplicate-description: error
classDiagram
  accDescr: first
  accDescr: second
  class A
```

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-description: error
classDiagram
  accDescr {
first
  }
  accDescr: second
  class A
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-description: error
classDiagram
  accTitle: x
  accDescr: y
```

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-description: error
classDiagram
  accDescr: first
  accDescr {
    first
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [class-no-duplicate-title](./class-no-duplicate-title.ja.md)
- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.ja.md)
- [sequence-no-duplicate-description](./sequence-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/class-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/class-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
