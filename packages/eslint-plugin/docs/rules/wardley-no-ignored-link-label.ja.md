# @mmd-toolkit/wardley-no-ignored-link-label

英語版:
[wardley-no-ignored-link-label.md](./wardley-no-ignored-link-label.md)

リンクの矢印の中のラベルが置き換える、`;` の後のラベルを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

リンクは、`+'calls'>` のような矢印の中のラベルか、`;` の後のラベルの、
1 つのラベルを持つ。
リンクが両方を持つと、mermaid.js はエラーなしに矢印の中のラベルを使い、
`;` の後のラベルは失われる。

## 規則の詳細

この規則は、矢印が別のラベルを持つリンクの `;` の後のラベルを報告する。
対象の図種は `wardley` である。

`API +'calls'> Database; storage` はラベル `calls` だけを描く。
矢印の中の空のラベルもそれを置き換え、
`API +''> Database; storage` はラベルを描かない。

矢印の中のラベルと同じ `;` の後のラベル、空白だけの `;` の後のラベル、
1 つのラベルを持つリンクは報告しない。
端がどのノードも名指さないか、
pipeline の子をその親につなぐので何も描かないリンクは報告しない。
ラベルの中のすべての改行（LF、CRLF、CR）は LF として読む。
ラベルはそのほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
ラベルを読む前にほかの文字に変えるので、それだけが違う 2 つのラベルは、
mermaid.js には 1 つで、この規則には 2 つのことがある。

リンクごとにラベルを 1 つ書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-ignored-link-label: error
wardley-beta
  component API [0.6, 0.7]
  component Database [0.3, 0.8]
  API +'calls'> Database; storage
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-ignored-link-label: error
wardley-beta
  component API [0.6, 0.7]
  component Database [0.3, 0.8]
  API +'calls'> Database
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [wardley-no-undef](./wardley-no-undef.ja.md)

## 背景

[パーサー](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyParser.ts#L178-L186) は、
矢印の中のラベルを取り、 `;` の後のラベルは矢印がラベルを持たないときだけ取る。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-ignored-link-label.ts)
- [テストのソース](../../tests/rules/wardley-no-ignored-link-label.test.ts)

<!-- end auto-generated rule resources -->
