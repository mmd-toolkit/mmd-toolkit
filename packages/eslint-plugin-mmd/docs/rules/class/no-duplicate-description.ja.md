# mmd/class/no-duplicate-description

英語版: [no-duplicate-description.md](./no-duplicate-description.md)

説明をもう一度設定する `accDescr` の文を禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

図の説明は 1 つである。
mermaid.js はどの `accDescr` の文も受理し、
それぞれの文は、それより前に設定した説明を黙って置き換える。
2 つ目の説明は、たいてい、テキストを書き直した残りか、
同じ部分を 2 回貼り付けたものである。

## 規則の詳細

この規則は、説明を設定する文のうち、最初のもの以外をすべて報告する。
対象の図種は `classDiagram` である。

`accDescr:` も、テキストのある説明のブロックも、説明を設定する。
1 行の形とブロックの形を混ぜても、どちらが先でも、
後に書いたほうの説明が使われる。
`accDescr: first` と `accDescr: second` の後、説明は `second` になり、
`first` を持つブロックの後の `accDescr: second` でも同じである。

この規則に**反する**コードの例:

```mmd
%% eslint mmd/class/no-duplicate-description: error
classDiagram
  accDescr: first
  accDescr: second
  class A
```

```mmd
%% eslint mmd/class/no-duplicate-description: error
classDiagram
  accDescr {
first
  }
  accDescr: second
  class A
```

この規則に**従う**コードの例:

```mmd
%% eslint mmd/class/no-duplicate-description: error
classDiagram
  accTitle: x
  accDescr: y
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-duplicate-title](./no-duplicate-title.ja.md)
- [flowchart/no-duplicate-description](../flowchart/no-duplicate-description.ja.md)
- [sequence/no-duplicate-description](../sequence/no-duplicate-description.ja.md)
