# @mmd-toolkit/venn-no-ignored-text

英語版: [venn-no-ignored-text.md](./venn-no-ignored-text.md)

後のコメントが取り除く文字を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`%%` のコメントは、空白で隔てられていないとき、
すぐ前の文字を取り除くことがある。
`set A:%% size to fill in` ではコロンがコメントとともに消え、
mermaid.js は既定の大きさ 10 の `set A` をエラーなしに読む。

## 規則の詳細

この規則は、ベン図（`venn-beta`）に当てる。
直後のコメントが取り除く文字を、文の後、それだけの行、ヘッダーの後のいずれでも、
それぞれ報告する。
これは mermaid.js が新しい語か記号を読み始めるところだけで起き、
`set AB%% c` は `AB` を保つので報告しない。
`set A%% c` は `A` を失い、mermaid.js がエラーを出すので報告しない。

取り除かれた空白は何も変えないので報告しない。
ラベルや引用符付きの名前の中の `%%` はコメントではなく文字であり、
その前の文字は報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/venn-no-ignored-text: error
venn-beta
set A:%% size to fill in
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/venn-no-ignored-text: error
venn-beta
set A:20 %% size
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/venn-no-ignored-text.ts)
- [テストのソース](../../tests/rules/venn-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
