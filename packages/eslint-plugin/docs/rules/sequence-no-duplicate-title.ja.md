# @mmd-toolkit/sequence-no-duplicate-title

英語版: [sequence-no-duplicate-title.md](./sequence-no-duplicate-title.md)

タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`sequenceDiagram` の図には、`title` が設定する表示用のタイトルと、
`accTitle` が設定するアクセシブルなタイトルがある。
mermaid.js は、どちらの後の文もエラーなしに受理し、前の値を置き換えるので、
前のタイトルは失われる。

## 規則の詳細

この規則は、シーケンス図（`sequenceDiagram`）に当てる。
同じタイトルの前の値を変える `title` や `accTitle` の文を報告する。
`title` と `title:` はまとめて比べるが、
`title` と `accTitle` は別の値を設定する。
`loop` などのブロックの中の文も数える。

テキストのない `accTitle:` もアクセシブルなタイトルを設定するので数える。
その文は、空行、コメント行、ディレクティブを越えて、
テキストのある次の行をアクセシブルなタイトルにし、
そのような行がなければ空にする。
フロントマターのタイトルを置き換える `title` の文は報告しない。

現在の値の繰り返しは報告しない。
`accTitle` は両端の空白を除いて比べるが、`title` は空白を保つので、
`title T` の後の `title  T` は、図が同じに見えても報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-title: error
sequenceDiagram
  title first
  title second
  A ->> B: x
```

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-title: error
sequenceDiagram
  A ->> B: x
  accTitle: first
  accTitle: second
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-title: error
sequenceDiagram
  title first
  accTitle: second
  A ->> B: x
```

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-title: error
sequenceDiagram
  title first
  title first
  A ->> B: x
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.ja.md)
- [sequence-no-duplicate-description](./sequence-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/sequence-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/sequence-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
