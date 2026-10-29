# @mmd-toolkit/c4-no-invalid-attribute-key

英語版: [c4-no-invalid-attribute-key.md](./c4-no-invalid-attribute-key.md)

C4 のスタイル更新で、色と offset のキーの大文字小文字の誤りを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は `$BgColor="red"` をエラーなしに受理するが、
`BgColor` を `bgColor` とは別の属性として扱う。
要素は意図した背景色を得ない。

## 規則の詳細

この規則は、C4 図（`C4Context`、`C4Container`、`C4Component`、`C4Dynamic`、
`C4Deployment`）に当てる。
`UpdateElementStyle` の `bgColor`、`fontColor`、`borderColor`、
または `UpdateRelStyle` の `textColor`、`lineColor`、`offsetX`、
`offsetY` と大文字小文字だけが違う名前付きキーを報告する。
両端の空白を除いた各キーを、呼出しが読む省略可能な引数の位置で、
更新対象があるときだけ調べる。
対象には要素、境界、初めからある境界 `global` が含まれる。

`alias`、`from`、`to` などの名前付き属性は後の文の照合を変えることがあるので、
ほかの見慣れないキーは報告しない。
必須位置と余分な引数は調べない。

`UpdateLayoutConfig` は、位置が設定項目を選ぶので調べない。
色の位置の、正しい大文字小文字の名前付き offset は、
mermaid.js がその値を offset として使えるので報告しない。
この規則は属性名を調べ、色の値が正しい CSS かどうかは調べない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/c4-no-invalid-attribute-key: error
C4Context
  Person(a, "A")
  UpdateElementStyle(a, $BgColor="red")
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/c4-no-invalid-attribute-key: error
C4Context
  Person(a, "A")
  UpdateElementStyle(a, $bgColor="red")
```

```mmd
%% eslint @mmd-toolkit/c4-no-invalid-attribute-key: error
C4Context
  UpdateLayoutConfig($C4ShapeInRow="3", $C4BoundaryInRow="1")
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [c4-no-undef](./c4-no-undef.ja.md)
- [c4-no-useless-argument](./c4-no-useless-argument.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/c4-no-invalid-attribute-key.ts)
- [テストのソース](../../tests/rules/c4-no-invalid-attribute-key.test.ts)

<!-- end auto-generated rule resources -->
