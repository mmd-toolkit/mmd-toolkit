# @mmd-toolkit/c4-no-useless-argument

英語版: [c4-no-useless-argument.md](./c4-no-useless-argument.md)

C4 の呼出しが読む引数の上限を超える、空でない引数を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は、呼出しが読む数より多くの引数を受理し、
最後のパラメーターより後の値をエラーなしに無視する。
余分な空の位置を挟むと、
リンクなどの意図した値が上限の外へ押し出されることがある。

## 規則の詳細

この規則は、C4 図（`C4Context`、`C4Container`、`C4Component`、`C4Dynamic`、
`C4Deployment`）に当てる。
呼出しの上限を超えた、空でない位置引数と名前付き引数を、それぞれ報告する。

| 呼出しの種類                                                   | 消費する最後の記述位置 |
| -------------------------------------------------------------- | ---------------------- |
| Person と System、およびその変種                               | 6                      |
| Container と Component、およびその変種                         | 7                      |
| `Boundary`                                                     | 5                      |
| `Enterprise_Boundary`、`System_Boundary`、`Container_Boundary` | 4                      |
| `Deployment_Node`、`Node`、`Node_L`、`Node_R`                  | 7                      |
| `RelIndex` 以外の関係                                          | 8                      |
| `RelIndex`                                                     | 9                      |
| `UpdateElementStyle`                                           | 10                     |
| `UpdateRelStyle`                                               | 6                      |
| `UpdateLayoutConfig`                                           | 2                      |

空の引数と名前付き属性も位置として数え、上限の外の名前付き引数は、
mermaid.js がキーによらず無視するので報告する。
現時点の対象がない更新も、上限は同じである。

空の項目、空の文字列、空白だけの余分な値は、失う空でない値がないので報告しない。
末尾のコンマは引数を増やさない。
必須引数、捨てられる `RelIndex` の index、
配置ノードの無視される第 5 引数の sprite は、上限内なので報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/c4-no-useless-argument: error
C4Context
  Person(customer, "Customer", "A bank customer", "", "external", "", "https://bank.example")
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/c4-no-useless-argument: error
C4Context
  Person(customer, "Customer", "A bank customer", "", "external", "https://bank.example")
```

```mmd
%% eslint @mmd-toolkit/c4-no-useless-argument: error
C4Context
  Person(a, "A", "D", "s", "t", "l", "")
```

```mmd
%% eslint @mmd-toolkit/c4-no-useless-argument: error
C4Deployment
  Node(n, "Node", "Linux", "Host", "server") {
    Person(a, "A")
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [c4-no-invalid-attribute-key](./c4-no-invalid-attribute-key.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/c4-no-useless-argument.ts)
- [テストのソース](../../tests/rules/c4-no-useless-argument.test.ts)

<!-- end auto-generated rule resources -->
