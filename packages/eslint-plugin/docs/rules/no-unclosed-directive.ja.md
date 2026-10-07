# @mmd-toolkit/no-unclosed-directive

英語版: [no-unclosed-directive.md](./no-unclosed-directive.md)

閉じる `}%%` のないディレクティブを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

`%%{init: {"theme": "dark"}}%%` の `{` のように、
引数が語の文字でない文字で始まるディレクティブは、`}%%` まで続く。
`}%%` がなければ、テキストの終わりまで、
その前に U+2028 か U+2029 があればそこまで続き、
そこまでの文がディレクティブの一部になる。
残ったものが正しい図であれば mermaid.js は受理するので、
それらの文はエラーなしに消える。

## 規則の詳細

この規則は、`}%%` で閉じていないディレクティブを報告する。
すべての図種が対象である。

引数が語の文字で始まるディレクティブは、その 1 語だけを引数とし、
その語と後の空白で終わるが、
引数の前の空白は改行をまたぐ。
行の終わりの `%%{wrap` は、次の行の最初の語を引数として取り、その語は消える。
ほかのテキストの後の `}%%` も、こうしたディレクティブを閉じない。
`%%{init: dark foo}%%` では、ディレクティブは `dark` の後で終わり、
`foo}%%` はテキストとして読まれる。
規則は、これらのディレクティブも報告する。

### 図種ごとの現れ方

何が消えるかは、図種によって違う。

- flowchart: `flowchart LR`、最後の `%%` のない `%%{init: {"theme": "dark"}}`、
  `A-->B` は、頂点もリンクもない flowchart になる。
  `A-->B`、`}%%` のない `%%{wrap`、`C-->D` は頂点 `C` を失い、
  `-->D` が前のリンクに続く。
  リンクは `A` から `B` と、`B` から `D` になる。
- sequence: `sequenceDiagram`、`A->>B: one`、
  最後の `%%` のない `%%{init: {"theme": "dark"}}`、`B->>A: two` には、
  メッセージ `one` しかない。
- class: `classDiagram`、`class A`、
  最後の `%%` のない `%%{init: {"theme": "dark"}}`、`class B` には、
  クラス `A` しかない。
- state: `stateDiagram-v2`、`A --> B`、
  最後の `%%` のない `%%{init: {"theme": "dark"}}`、`B --> C` には、
  状態 `A` と `B`、`A` から `B` への遷移しかない。

例は flowchart である。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/no-unclosed-directive: error
flowchart LR
  A --> B
  %%{init: {"x": 1}
C-->D
```

```mmd
%% eslint @mmd-toolkit/no-unclosed-directive: error
flowchart LR
  %%{init: {"theme": "dark"}}
A-->B
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/no-unclosed-directive: error
%%{init: {"theme": "dark"}}%%
flowchart LR
  A --> B
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-ignored-init-directive](./no-ignored-init-directive.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/no-unclosed-directive.ts)
- [テストのソース](../../tests/rules/no-unclosed-directive.test.ts)

<!-- end auto-generated rule resources -->
