# @mmd-toolkit/xychart-no-duplicate-title

英語版: [xychart-no-duplicate-title.md](./xychart-no-duplicate-title.md)

タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`title` は図の上に描くタイトルを、
`accTitle` はアクセシビリティ用のタイトルを設定する。
どちらも、もう一度設定すると、mermaid.js はエラーなしに後の値を使い、
前の値は失われる。

## 規則の詳細

この規則は、XY チャート（`xychart`、`xychart-beta`）に当てる。
同じ種類の現在のタイトルを別の値に置き換える `title` か `accTitle`
の文を報告する。
2 つのタイトルは別々に調べ、現在の値を繰り返す文は報告しない。

行にテキストのない `accTitle:` は、空行、コメント行、ディレクティブを飛ばして、
テキストを持つ次の行を取る。
テキストの終わりまでにそうした行がなければ、
`accTitle:` は空のアクセシビリティ用のタイトルを設定し、
別の値を置き換えるときに報告する。
フロントマターのタイトルは別の値であり、数えない。

キーワードは大文字小文字を問わず読み、
同じ行の 2 つのタイトルの文は 2 つと数える。
`title` の引用符のない語は空白なしにつなぐので、
`title Two words` と `title Twowords` は同じタイトルを設定する。
引用符の中のタイトルとアクセシビリティ用のタイトルは両端の空白を除いて比べ、
`title Sales` と `title "Sales"` は同じタイトルを設定する。

`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は、
`b` を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-title: error
xychart
  title first
  title second
  line [1, 2]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-title: error
xychart
  accTitle: first
  accTitle: second
  line [1, 2]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-title: error
xychart
  title first
  accTitle: second
  line [1, 2]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-title: error
xychart
  title Sales
  title "Sales"
  line [1, 2]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [timeline-no-duplicate-title](./timeline-no-duplicate-title.ja.md)
- [xychart-no-duplicate-description](./xychart-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/xychart-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/xychart-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
