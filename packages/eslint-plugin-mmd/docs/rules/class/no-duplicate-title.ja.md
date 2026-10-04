# mmd/class/no-duplicate-title

英語版: [no-duplicate-title.md](./no-duplicate-title.md)

タイトルをもう一度設定する `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

図のアクセシブルなタイトルは 1 つである。
mermaid.js はどの `accTitle` の文も受理し、
それぞれの文は、それより前に設定したタイトルを黙って置き換える。
2 つ目のタイトルは、たいてい、テキストを書き直した残りか、
同じ部分を 2 回貼り付けたものであり、
整形したテキストを見ても、どちらが効くかは分からない。

## 規則の詳細

この規則は、`accTitle` の文のうち、最初のもの以外をすべて報告する。
`classDiagram` に当たる。

`accTitle: first` と `accTitle: second` の後、タイトルは `second` になる。

この規則に**反する**コードの例:

```mmd
%% eslint mmd/class/no-duplicate-title: error
classDiagram
  accTitle: first
  accTitle: second
  class A
```

この規則に**従う**コードの例:

```mmd
%% eslint mmd/class/no-duplicate-title: error
classDiagram
  accTitle: x
  accDescr: y
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-duplicate-description](./no-duplicate-description.ja.md)
- [flowchart/no-duplicate-title](../flowchart/no-duplicate-title.ja.md)
- [sequence/no-duplicate-title](../sequence/no-duplicate-title.ja.md)
