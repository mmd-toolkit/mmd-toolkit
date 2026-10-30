# @mmd-toolkit/journey-no-duplicate-title

英語版: [journey-no-duplicate-title.md](./journey-no-duplicate-title.md)

タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`title` は図の上に描くタイトルを、
`accTitle` はアクセシビリティ用のタイトルを設定する。
どちらも、もう一度設定すると、mermaid.js はエラーなしに後の値を使い、
前の値は失われる。

## 規則の詳細

この規則は、ユーザージャーニー図（`journey`）に当てる。
同じ種類の現在のタイトルを別の値に置き換える `title` か `accTitle`
の文を報告する。
2 つのタイトルは別々に調べ、現在の値を繰り返す文は報告しない。

行にテキストのない `accTitle:`
もアクセシビリティ用のタイトルを設定するので数える。
その文は、空行、コメント行、ディレクティブを飛ばして、
テキストを持つ次の行を取る。
`title` の文がフロントマターのタイトルを置き換えても報告しない。

`accTitle` は両端の空白を除いて比べるが、`title` は空白を保つので、
`title T` の後の `title  T` は、図が同じに見えても報告する。

mermaid.js は、タスクのつもりの行の先頭でも、
大文字小文字を問わず `title` をタイトルの文として読む。
`title My day` の後の `Title page: 5: Me` は、
タスクでなくタイトル `page: 5: Me` を設定するので報告する。
前にタイトルがなければ報告しない。

`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は、
`b` を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/journey-no-duplicate-title: error
journey
  title first
  title second
  section Work
    Make tea: 5: Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-duplicate-title: error
journey
  accTitle: first
  accTitle: second
  section Work
    Make tea: 5: Me
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/journey-no-duplicate-title: error
journey
  title first
  accTitle: second
  section Work
    Make tea: 5: Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-duplicate-title: error
journey
  title first
  title first
  section Work
    Make tea: 5: Me
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.ja.md)
- [gantt-no-duplicate-title](./gantt-no-duplicate-title.ja.md)
- [journey-no-duplicate-description](./journey-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/journey-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/journey-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
