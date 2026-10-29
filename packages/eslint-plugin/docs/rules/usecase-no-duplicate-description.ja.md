# @mmd-toolkit/usecase-no-duplicate-description

英語版:
[usecase-no-duplicate-description.md](./usecase-no-duplicate-description.md)

前に設定した説明を置き換える `accDescr` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

ユースケース図は、
行かブロックの `accDescr` が設定するアクセシブルな説明を 1 つ持つ。
mermaid.js は後の説明をエラーなしに受理し、前の説明を置き換える。

## 規則の詳細

この規則は、ユースケース図（`usecase-beta`）に当てる。
直前の `accDescr` が設定した空でない説明を変える `accDescr` を、
行とブロックの形式を一緒に比べて報告する。
同じ説明の繰り返しや、空の説明の後の設定は報告しない。

文字のない `accDescr:` は次の行を取らずに説明を空にし、
空でない説明の後では報告する。
コメント行だけを持つブロックも説明を空にし、空でない説明の後では報告する。
空のブロックは、
代わりに
[usecase-no-empty-description-block](./usecase-no-empty-description-block.ja.md)
が報告する。

比較では、両端と改行の後の空白を除き、ブロックの字下げや空の行も数えない。
LF、CRLF、CR は LF として比べる。
ほかは書いたとおりに比べるので、
文字参照や HTML 属性の引用符の違いを mermaid.js が同じに読んでも、
この規則は異なるとすることがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-description: error
usecase-beta
  accDescr: first
  accDescr: second
  A
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-description: error
usecase-beta
  accDescr: first
  A
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [usecase-no-duplicate-title](./usecase-no-duplicate-title.ja.md)
- [usecase-no-empty-description-block](./usecase-no-empty-description-block.ja.md)
- [usecase-no-unclosed-description-block](./usecase-no-unclosed-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/usecase-no-duplicate-description.ts)
- [テストのソース](../../tests/rules/usecase-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
