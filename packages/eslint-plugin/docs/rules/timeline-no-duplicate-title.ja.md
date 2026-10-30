# @mmd-toolkit/timeline-no-duplicate-title

英語版: [timeline-no-duplicate-title.md](./timeline-no-duplicate-title.md)

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

この規則は、タイムライン（`timeline`）に当てる。
同じ種類の現在のタイトルを別の値に置き換える `title` か `accTitle`
の文を報告する。
2 つのタイトルは別々に調べ、現在の値を繰り返す文は報告しない。

行にテキストのない `accTitle:`
もアクセシビリティ用のタイトルを設定するので数える。
その文は、空行、コメント行、ディレクティブを飛ばして、
テキストを持つ次の行を取る。
フロントマターのタイトルは別の値であり、数えない。

mermaid.js は、`title` の後に空白文字 1 つと、
その行の文字が少なくとも 1 つ続くとき、
大文字小文字を問わずタイトルの文として読む。
その空白は改行でもよいので、`title` は次の行を、
字下げも含めてタイトルにすることがある。
コメント行は飛ばし、ディレクティブは除く。
空白だけの行は、ディレクティブがあってもなくても、その空白をタイトルにする。

`Title page : x` のように `title` で始まる、年のつもりの行もタイトルと数える。
前にタイトルがなければ報告しない。
`title` がテキストの終わりにあるとき、
後に空白かタブが 1 つだけあって行が終わるとき、
次の行がディレクティブを除くと空のときは、`title` は年になり、数えない。
`title` の後に空白文字が 2 つ以上あれば、
最初の 1 つより後の空白がタイトルになり、数える。

アクセシビリティ用のタイトルは、両端の空白を除いて比べる。
`title` のテキストは空白も含めて書いたとおりに比べるので、
`title T` の後の `title  T` は、描いたときに同じに見えても報告する。

`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は、
`b` を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/timeline-no-duplicate-title: error
timeline
  title first
  title second
  2020 : Launch
```

```mmd
%% eslint @mmd-toolkit/timeline-no-duplicate-title: error
timeline
  accTitle: first
  accTitle: second
  2020 : Launch
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/timeline-no-duplicate-title: error
timeline
  title first
  accTitle: second
  2020 : Launch
```

```mmd
%% eslint @mmd-toolkit/timeline-no-duplicate-title: error
timeline
  title first
  title first
  2020 : Launch
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [journey-no-duplicate-title](./journey-no-duplicate-title.ja.md)
- [timeline-no-duplicate-description](./timeline-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/timeline-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/timeline-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
