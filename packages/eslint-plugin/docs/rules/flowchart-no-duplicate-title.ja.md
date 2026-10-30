# @mmd-toolkit/flowchart-no-duplicate-title

英語版: [flowchart-no-duplicate-title.md](./flowchart-no-duplicate-title.md)

タイトルをもう一度設定する `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

図のアクセシブルなタイトルは 1 つである。
別の `accTitle` 文がタイトルを設定すると、
mermaid.js はエラーなしに前のものを置き換え、前のタイトルは失われる。

## 規則の詳細

この規則は、フローチャート（`flowchart`、`graph`、`flowchart-elk`、
`swimlane-beta`）に当てる。
前の文が設定したタイトルを変える `accTitle` 文を報告する。
subgraph の中の文も、図全体のタイトルを設定するので数える。

`accTitle:` の後にテキストがないと、空行、コメント行、ディレクティブを越えて、
テキストのある次の行をタイトルにし、そのような行がなければタイトルを空にする。

現在のタイトルの繰り返しは報告しないが、前のタイトルに戻す文は報告する。
`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は報告する。
タイトルは両端の空白を除いて比べる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-title: error
flowchart LR
  accTitle: first
  accTitle: second
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-title: error
flowchart LR
  A
  accTitle: x
  accTitle:
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-title: error
flowchart LR
  subgraph S
    A
    accTitle: inner
  end
  accTitle: outer
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-title: error
flowchart LR
  A
  accTitle: first
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-title: error
flowchart LR
  A
  accTitle: first
  accTitle: first
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/flowchart-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/flowchart-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
