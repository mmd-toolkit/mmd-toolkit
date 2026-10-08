# @mmd-toolkit/class-no-inline-comment

英語版: [class-no-inline-comment.md](./class-no-inline-comment.md)

同じ行のほかのテキストの後に置いたコメントを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

mermaid.js の文書は、コメントはそれだけで 1 行に書くとしている。
文の後に書いたコメントは、mmd-toolkit のパーサーではコメントだが、
mermaid.js はその後の改行をコメントの一部として読むので、
次の行が文の続きになるか、テキストが拒否される。

## 規則の詳細

この規則は、同じ行のほかのテキストの後にあり、
その後にもテキストが続くコメントを報告する。
対象の図種は `classDiagram` である。

`Animal <|-- Duck %% ducks` と、次の行 `Animal : +int age` の後、
mermaid.js には、`Animal` からクラス `DuckAnimal` への関係が 1 つあり、
そのラベルは `+int age` で、`Animal` のメンバーはない。
`class Fish` のように、次の行が文の続きになれないときは、
mermaid.js はテキストを拒否し、
`classDiagram %% c` のようにヘッダーの行に置いたコメントでも同じである。
mmd-toolkit のパーサーはそのテキストを受理し、フォーマッターは整形するが、
mermaid.js はそれを描けないので、
この規則はそれらのコメントも報告する。
これは、仕様の既知の差異
[`comment-takes-line-break`](../../../spec/docs/known-divergences/comment-takes-line-break.ja.md)
である。

テキストの最後の行のコメントは報告しない。
mermaid.js も、書き手の意図どおりに読む。

1 つの場合だけ、mermaid.js は次の行を別に読む。
コメントと次の行の間に空白だけの行があり、
mermaid.js がそれを取り除かないときである。
mermaid.js は、`%%` の後にテキストのあるコメント行を、
その直前の空白だけの行と一緒に取り除く
（
[`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)
）。
そのため、空白だけの行は、次の行を別に読ませる。
ただし、空白だけの行だけを挟んで、そうしたコメント行が後に来るときは除く。
`%%` だけの行は取り除かれないので、別に読ませることを妨げない。
この規則は、この場合のコメントも報告する。
次の行が別に読まれるかどうかが、見えない空白に懸かっているからである。
行末の空白はコードブロックの中に残らないので、下の例には載せない。

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
