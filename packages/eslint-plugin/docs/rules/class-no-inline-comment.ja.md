# @mmd-toolkit/class-no-inline-comment

英語版: [class-no-inline-comment.md](./class-no-inline-comment.md)

同じ行のほかのテキストの後に置いたコメントを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

文の後のコメントは、次の行をその文の続きにすることがある。
mermaid.js は後の改行をコメントの一部として読むので、
エラーなしに図が変わることも、テキストが不正になることもある。

## 規則の詳細

この規則は、クラス図（`classDiagram`、`classDiagram-v2`）に当てる。
同じ行のほかのテキストの後にあるコメントを、
その後にもテキストが続くときに報告する。
テキストの最後の行のコメントは、mermaid.js が意図どおりに読むので報告しない。

次の行が文の続きになれないときのコメントや、ヘッダーの後のコメントも報告する。
mmd-toolkit はそのテキストを受理して整形するが、mermaid.js はエラーを出す。
これは既知の差異
[`comment-takes-line-break`](../../../spec/docs/known-divergences/comment-takes-line-break.ja.md)
である。

空白だけの行が後にあるコメントも、その行が文を分ける場合でも報告する。
その区切りは見えない空白に依存するからである。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-inline-comment: error
classDiagram
  Animal <|-- Duck %% ducks
  Animal : +int age
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-inline-comment: error
classDiagram
  %% Animals
  class Animal
  Animal <|-- Duck
```

```mmd
%% eslint @mmd-toolkit/class-no-inline-comment: error
classDiagram
  class Animal
  Animal <|-- Duck %% ducks
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/class-no-inline-comment.ts)
- [テストのソース](../../tests/rules/class-no-inline-comment.test.ts)

<!-- end auto-generated rule resources -->
