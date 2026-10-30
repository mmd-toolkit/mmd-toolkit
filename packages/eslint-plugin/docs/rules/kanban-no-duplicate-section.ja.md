# @mmd-toolkit/kanban-no-duplicate-section

英語版: [kanban-no-duplicate-section.md](./kanban-no-duplicate-section.md)

項目を重ねて列挙する、重複した列の id を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

列はそれぞれ自分の id を持つ必要がある。
mermaid.js は同じ id の 2 つの列をエラーなしに受理し、
その id に属する項目をすべて両方の列に列挙する。
一方の列の下だけに書いた項目も、2 度現れる。

## 規則の詳細

この規則は、カンバン（`kanban`）に当てる。
その id に属する項目が、後に書いたものも含めてボードのどこかにあれば、
同じ id の最初の列より後の各列を報告する。
その id に属する項目がない空の列の重複は報告しない。

最初の要素の字下げが列の深さを設定し、その深さの要素は列になる。
ほかの深さの要素は、直前の列の項目になる。
id は大文字小文字と形の前の空白を区別するので、
`Todo[First]` の後の `Todo [Second]` は報告しない。
id のない形はラベルを id にする。
`Todo@{label: First}` のようなデータブロックが設定するタイトルは、
id を変えない。

項目の id の重複や列と同じ id の項目は、項目の再掲を加えないので報告しない。
`Todo[Queue]` と `Ready[Queue]` のように、
id が違って同じタイトルの列は報告しない。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/kanban-no-duplicate-section.ts)
- [テストのソース](../../tests/rules/kanban-no-duplicate-section.test.ts)

<!-- end auto-generated rule resources -->
