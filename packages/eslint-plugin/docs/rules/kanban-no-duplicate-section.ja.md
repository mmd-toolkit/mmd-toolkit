# @mmd-toolkit/kanban-no-duplicate-section

英語版: [kanban-no-duplicate-section.md](./kanban-no-duplicate-section.md)

項目を重ねて列挙する、重複した列の id を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

列はそれぞれ自分の id を持つ必要がある。
2 つの列が `Todo` を使うと、mermaid.js は両方をエラーなしに受理し、
`Todo` に属する項目をすべて両方の列に列挙する。
一方の列の下だけに書いた項目も、2 度現れる。

## 規則の詳細

この規則は、同じ id の最初の列より後の列を、
ボードのどれかの項目がその id に属するときに報告する。
対象の図種は `kanban` である。

最初のノードの字下げが列の深さを設定する。
その深さのノードはすべて列であり、ほかのノードは直前の列の項目である。
項目はボード全体で調べる。
重複した列の後に書いた項目も、それより前の列に現れる。
同じ id の 3 つ目の列も、もう 1 つの報告となる。

id は大文字小文字を区別し、末尾の空白も残して比べる。
id のない形は、ラベルを id にする。
メタデータによるタイトルの変更は id を変えない。
項目の id の重複、列と同じ id の項目、その id に属する項目がない空の列の重複は、
項目の再掲を加えず、報告しない。

`Todo` と `Ready` のように、列にそれぞれ自分の id を与える。
id が異なる 2 つの列に、意図して同じ表示タイトルを与えることはできる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/kanban-no-duplicate-section: error
kanban
  Todo[Backlog]
    docs[Write docs]
  Todo[Ready]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/kanban-no-duplicate-section: error
kanban
  Todo[Backlog]
    docs[Write docs]
  Ready[Ready]
```

```mmd
%% eslint @mmd-toolkit/kanban-no-duplicate-section: error
kanban
  Todo[Backlog]
  Todo[Ready]
```

```mmd
%% eslint @mmd-toolkit/kanban-no-duplicate-section: error
kanban
  Todo[Queue]
    docs
  Ready[Queue]
    review
```

## オプション

この規則にはオプションがない。

## 背景

[`getData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/kanbanDb.ts#L61-L94)
は、列ごとに列の id で項目を選ぶので、重複した id は同じ項目をもう一度選ぶ。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/kanban-no-duplicate-section.ts)
- [テストのソース](../../tests/rules/kanban-no-duplicate-section.test.ts)

<!-- end auto-generated rule resources -->
