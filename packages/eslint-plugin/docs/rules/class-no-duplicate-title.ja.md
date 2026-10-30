# @mmd-toolkit/class-no-duplicate-title

英語版: [class-no-duplicate-title.md](./class-no-duplicate-title.md)

タイトルをもう一度設定する `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

図のアクセシブルなタイトルは 1 つである。
別の `accTitle` 文がタイトルを設定すると、
mermaid.js はエラーなしに前のものを置き換え、前のタイトルは失われる。

## 規則の詳細

この規則は、クラス図（`classDiagram`、`classDiagram-v2`）に当てる。
前の文が設定したタイトルを変える `accTitle` 文を報告する。
現在のタイトルの繰り返しは報告せず、両端の空白を除いて比べる。
前のタイトルに戻す文は報告する。
`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は報告する。

`accTitle:` の後にテキストがないと、空行、コメント行、ディレクティブを越えて、
テキストのある次の行をタイトルにする。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-title: error
classDiagram
  accTitle: first
  accTitle: second
  class A
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-title: error
classDiagram
  accTitle: x
  accDescr: y
```

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-title: error
classDiagram
  accTitle: first
  accTitle: first
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [class-no-duplicate-description](./class-no-duplicate-description.ja.md)
- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.ja.md)
- [sequence-no-duplicate-title](./sequence-no-duplicate-title.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/class-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/class-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
