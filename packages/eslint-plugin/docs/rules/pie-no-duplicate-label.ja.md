# @mmd-toolkit/pie-no-duplicate-label

英語版: [pie-no-duplicate-label.md](./pie-no-duplicate-label.md)

前の区分が持つラベルに、別の値を与える区分を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

円グラフはラベルごとに 1 つの扇形を持つ。
後の区分がラベルに別の値を与えると、
mermaid.js はエラーなしにそのラベルの最初の区分の値を保ち、後の値は失われる。

## 規則の詳細

この規則は、そのラベルを持つ最初の区分と違う値を与える区分を報告する。
対象の図種は `pie` である。

`"A" : 1`、`"A" : 2`、`"A" : 2` の後では、扇形 `A` は値 `1` を持ち、
後の 2 つの区分を報告する。
`"A" : 1`、`"A" : 2`、`"A" : 1` の後では、2 つ目だけを報告する。
3 つ目は、扇形が持つ値を与えるからである。

そのラベルの最初の区分の値を与える区分は、何も失わず、報告しない。
値は数として比べ、`1.2` と `001.20` は 1 つの値であり、
`0` と `-0` もそうである。
ラベルは空白と大文字小文字を区別して比べ、その周りの引用符は数えないので、
`'A'` と `"A"` は 1 つのラベルである。
ラベルの中のすべての改行（LF、CRLF、CR）は LF として読む。
ラベルはそのほかは書いたとおりに比べる。
mermaid.js は、`\n` のようなエスケープを解き、HTML の属性の引用符を、
ラベルを読む前にほかの文字に変えるので、それだけが違う 2 つのラベルは、
mermaid.js には 1 つで、この規則には 2 つのことがある。
ラベルの文字参照は書いたまま残るので、
`"#35;"` と `"#"` は mermaid.js にも 2 つのラベルである。

ラベルごとに区分を 1 つ書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/pie-no-duplicate-label: error
pie
  "Revenue" : 8
  "Revenue" : 3
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/pie-no-duplicate-label: error
pie
  "Revenue" : 8
  "Costs" : 3
```

## オプション

この規則にはオプションがない。

## 背景

[`addSection`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/pie/pieDb.ts#L36-L46) は、
そのラベルの区分がないときだけ区分を足す。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/pie-no-duplicate-label.ts)
- [テストのソース](../../tests/rules/pie-no-duplicate-label.test.ts)

<!-- end auto-generated rule resources -->
