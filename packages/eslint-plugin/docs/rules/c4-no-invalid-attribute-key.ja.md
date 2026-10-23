# @mmd-toolkit/c4-no-invalid-attribute-key

英語版: [c4-no-invalid-attribute-key.md](./c4-no-invalid-attribute-key.md)

C4 のスタイル更新で、色と offset のキーの大文字小文字の誤りを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`$BgColor="red"` は受理されるが、別の属性 `BgColor` を保存する。
`bgColor` は設定されず、要素はその背景色を得ない。
大文字小文字の違いは構文エラーにならない。

## 規則の詳細

この規則は、適用される `UpdateElementStyle` で `bgColor`、`fontColor`、
`borderColor` と大文字小文字だけが異なる名前付きキーを報告する。
適用される `UpdateRelStyle` では、`textColor`、`lineColor`、`offsetX`、
`offsetY` と大文字小文字だけが異なるキーを報告する。
対象の図種は `c4` である。

両端の空白を除いたキーを、消費される省略可能な引数だけで調べる。
誤記したキーごとに 1 件報告する。
要素のスタイル更新は、要素、境界、初めからある `global` 境界に適用できる。
対象は、書いたとおりの alias で探す。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
alias を読む前にほかの文字に変えるので、それだけが違う alias では、
mermaid.js とこの規則が別の対象を見つけることがある。

ほかの見慣れないキーは報告しない。
mermaid.js は名前付きの属性をどれも保存し、文書にない `alias`、`from`、`to`
などのキーは、後の文が照合するものを変える。
必須位置、余分な引数、現時点の対象がない更新は、この規則では調べない。
`UpdateLayoutConfig` も、名前や大文字小文字によらず、
位置でカウンターを選ぶので除く。

キーの大文字小文字を正確に書く。
色スロットの、正しく書いた名前付き offset は報告しない。
mermaid.js は文字列として保存し、描画はその文字列を offset として読む。

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

## 背景

要素の adapter は
[`bgColor`、`borderColor`、`fontColor`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4ShapeAdapter.ts#L140-L156)
を正確な名前で読む。
関係の描画も、正確な名前の
[色と offset のフィールド](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/svgDraw.ts#L26-L36) を読む。
対象は無視される属性名であり、色の値が正しい CSS かどうかではない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/c4-no-invalid-attribute-key.ts)
- [テストのソース](../../tests/rules/c4-no-invalid-attribute-key.test.ts)

<!-- end auto-generated rule resources -->
