# @mmd-toolkit/c4-no-useless-argument

英語版: [c4-no-useless-argument.md](./c4-no-useless-argument.md)

C4 の呼出しが読む引数の上限を超える、空でない引数を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は、呼出しが読む数より多くの引数を受理する。
最後のパラメーターより後の値は、エラーなしに Db から消える。
余分な空の位置を挟むと、リンクなどの値が上限の外へ押し出される。

## 規則の詳細

この規則は、呼出しの種類ごとの上限を超えた、空でない位置引数と名前付き引数を、
それぞれ報告する。
対象の図種は `c4` である。

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

空の項目や名前付き属性も、引数の位置として数える。
たとえば `Person` の第 7 引数では、リンクを設定できない。
リンクは第 6 引数である。
上限を超えた名前付き引数も、キーによらず無視される。
対象がまだない更新でも、引数の上限は変わらない。

null の項目、空の引用符付き文字列、空白だけの余分な値は、
失う空でない値を持たないので報告しない。
末尾のコンマは余分な引数を作らない。
必須引数、捨てられる `RelIndex` の index、
無視される配置ノードの第 5 引数の sprite は、上限の外ではないので報告しない。

誤って挟んだ空の項目を除くか、その呼出しが読む位置へ値を書く。

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
