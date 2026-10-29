# @mmd-toolkit/wardley-no-ignored-link-label

英語版: [wardley-no-ignored-link-label.md](./wardley-no-ignored-link-label.md)

リンクの矢印の中のラベルが置き換える、`;` の後のラベルを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

リンクは、`+'calls'>` のような矢印の中のラベルか、`;` の後のラベルの、
1 つのラベルを持つ。
リンクが両方を持つと、mermaid.js はエラーなしに矢印の中のラベルを使い、
`;` の後のラベルは失われる。

## 規則の詳細

この規則は、Wardley マップ（`wardley-beta`）に当てる。
矢印の中のラベルが違うとき、それが `+''>` のような空のラベルでも、
リンクの `;` の後のラベルを報告する。
`;` の後の、矢印の中と同じラベルや空白だけのラベルと、
ラベルが 1 つだけのリンクは報告しない。
端がどのノードも名指さないか、
pipeline の子からその親へ向かうために何も描かないリンクは報告しない。

ラベルは書いたとおりに比べる。
mermaid.js は、
ラベルを読む前に `#35;` のような文字参照と HTML の属性の引用符を変換するので、
それらだけが違うラベルは、mermaid.js には同じでも、この規則には違うことがある。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-ignored-link-label.ts)
- [テストのソース](../../tests/rules/wardley-no-ignored-link-label.test.ts)

<!-- end auto-generated rule resources -->
