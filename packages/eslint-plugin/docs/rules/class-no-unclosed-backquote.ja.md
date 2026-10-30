# @mmd-toolkit/class-no-unclosed-backquote

英語版: [class-no-unclosed-backquote.md](./class-no-unclosed-backquote.md)

バッククォートで囲むクラス名のうち、閉じるバッククォートのないものを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

バッククォートで囲むクラス名は、``class `Animal Class!` `` のように、
空白やほかの文字を含められる。
閉じるバッククォートがなくても mermaid.js はエラーなしに受理し、
テキストの残りが 1 つのクラスの名前になる。

## 規則の詳細

この規則は、クラス図（`classDiagram`、`classDiagram-v2`）に当てる。
閉じるバッククォートのない、バッククォートで囲み始めたクラス名を報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-unclosed-backquote: error
classDiagram
  class `x
class B
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-unclosed-backquote: error
classDiagram
  class `Animal Class!`
  class `Car Class`
  `Animal Class!` --> `Car Class`
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-unclosed-directive](./no-unclosed-directive.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/class-no-unclosed-backquote.ts)
- [テストのソース](../../tests/rules/class-no-unclosed-backquote.test.ts)

<!-- end auto-generated rule resources -->
