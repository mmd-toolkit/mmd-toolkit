# mmd/sequence/no-ignored-text

英語版: [no-ignored-text.md](./no-ignored-text.md)

mermaid.js が何も読まない行を禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

`)` や `/` のような文字だけの行は、文ではない。
mermaid.js はそれを受理し、エラーなしに捨てるので、
その行に書いたものは何の効果も持たない。

## 規則の詳細

この規則は、mermaid.js が無視する行を報告する。
対象の図種は `sequence` である。

こうした行は、メッセージの終わりを次の行に書いたときに生じる。
メッセージは次の行に続かない。
`A ->> B: call(x`、改行、`)` のメッセージは `call(x` で、`)` は捨てられる。

この規則に**反する**コードの例:

```mmd
%% eslint mmd/sequence/no-ignored-text: error
sequenceDiagram
  A ->> B: call(x
  )
  B -->> A: done
```

この規則に**従う**コードの例:

```mmd
%% eslint mmd/sequence/no-ignored-text: error
sequenceDiagram
  A ->> B: call(x)
  B -->> A: done
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart/no-ignored-text](../flowchart/no-ignored-text.ja.md)
