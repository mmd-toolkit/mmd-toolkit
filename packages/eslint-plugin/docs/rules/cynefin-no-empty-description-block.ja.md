# @mmd-toolkit/cynefin-no-empty-description-block

英語版:
[cynefin-no-empty-description-block.md](./cynefin-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

mermaid.js は、空の `accDescr {}` のブロックをエラーなしに受理する。
そのブロックは説明を空にし、最初に書くと何も変えず、
説明の後に書くとその説明を取り除く。

## 規則の詳細

この規則は、Cynefin 図（`cynefin-beta`）に当てる。
括弧の間に何も持たないか空白だけを持つ `accDescr` のブロックを報告する。
ディレクティブは説明の文字ではないので、
ディレクティブだけのブロックも報告するが、mermaid.js はその設定を当てる。

括弧の間にコメント行を持つブロックは報告しない。
空でない説明の後では、コメント行だけのブロックも説明を空にし、
[cynefin-no-duplicate-description](./cynefin-no-duplicate-description.ja.md)
が報告する。
`accDescr {} %% later` のような括弧の外のコメントは、報告を防がない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/cynefin-no-empty-description-block: error
cynefin-beta
  accDescr {}
  complex
    "Investigate"
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/cynefin-no-empty-description-block: error
cynefin-beta
  accDescr {
    Responses by domain
  }
  complex
    "Investigate"
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [cynefin-no-duplicate-description](./cynefin-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/cynefin-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/cynefin-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
