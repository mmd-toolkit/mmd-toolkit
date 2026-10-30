# @mmd-toolkit/xychart-no-unclosed-description-block

英語版:
[xychart-no-unclosed-description-block.md](./xychart-no-unclosed-description-block.md)

`}` で閉じていない説明のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`accDescr` のブロックの閉じる `}` がないとき、
mermaid.js はエラーなしに受理する。
ブロックは後の文をすべてテキストとして取り、何を持っていても説明は空になる。

## 規則の詳細

この規則は、XY チャート（`xychart`、`xychart-beta`）に当てる。
閉じる `}` のない `accDescr {` のブロックを、
テキストの終わりで後に何もない `accDescr {` も含めて報告する。

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
