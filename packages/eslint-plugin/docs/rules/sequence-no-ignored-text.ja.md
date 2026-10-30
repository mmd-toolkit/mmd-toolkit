# @mmd-toolkit/sequence-no-ignored-text

英語版: [sequence-no-ignored-text.md](./sequence-no-ignored-text.md)

mermaid.js が何も読まない行を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

`)` や `/` のような文字は、文が始まる場所にあっても文を始めないことがある。
mermaid.js はそれをエラーなしに受理して捨てるので、書いたものは効果を持たない。
メッセージの終わりを次の行に書いたときに、よく生じる。

## 規則の詳細

この規則は、シーケンス図（`sequenceDiagram`）に当てる。
mermaid.js がこのように捨てる文字を、1 文字ずつ報告する。
それだけの行でも、同じ行の文の前やブロックの `end` の後でも対象になる。
`) )` の行は、報告が 2 つになる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-ignored-text: error
sequenceDiagram
  A ->> B: call(x
  )
  B -->> A: done
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-ignored-text: error
sequenceDiagram
  A ->> B: call(x)
  B -->> A: done
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-ignored-text](./flowchart-no-ignored-text.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/sequence-no-ignored-text.ts)
- [テストのソース](../../tests/rules/sequence-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
