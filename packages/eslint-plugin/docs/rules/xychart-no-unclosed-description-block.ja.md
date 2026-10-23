# @mmd-toolkit/xychart-no-unclosed-description-block

英語版:
[xychart-no-unclosed-description-block.md](./xychart-no-unclosed-description-block.md)

`}` で閉じていない説明のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は `}` のない説明のブロックを受理する。
ブロックはテキストの終わりまで続き、その後のすべての文をテキストとして取り、
説明は、ブロックが何を持っていても空になる。

## 規則の詳細

この規則は、`}` で閉じていない `accDescr {` のブロックを報告する。
対象の図種は `xychart` である。

`accDescr { Monthly sales` の後の `title Sales` と `line [1, 2]` の行は、
タイトルもプロットも与えず、説明は空になる。
ブロックの前に書いた説明は、空の説明に置き換わる。
`accDescr: d` の後の `accDescr {` と `e` の行は、空の説明を与える。
テキストの終わりの `accDescr {` のように、
何も持たずに閉じていないブロックも報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/xychart-no-unclosed-description-block: error
xychart
  accDescr { Monthly sales
  title Sales
  line [1, 2]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/xychart-no-unclosed-description-block: error
xychart
  accDescr { Monthly sales }
  title Sales
  line [1, 2]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [xychart-no-duplicate-description](./xychart-no-duplicate-description.ja.md)
- [xychart-no-empty-description-block](./xychart-no-empty-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/xychart-no-unclosed-description-block.ts)
- [テストのソース](../../tests/rules/xychart-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
