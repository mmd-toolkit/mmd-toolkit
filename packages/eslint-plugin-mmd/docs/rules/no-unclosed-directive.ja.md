# mmd/no-unclosed-directive

英語版: [no-unclosed-directive.md](./no-unclosed-directive.md)

閉じる `}%%` のないディレクティブを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

引数が 1 語でないディレクティブは、`}%%` まで続く。
`}%%` がなければ、テキストの終わりまで続き、
その後のすべてがディレクティブの一部になる。
ディレクティブより前に残ったものが正しい図であれば mermaid.js は受理するので、
その後の文はエラーなしに消える。

## 規則の詳細

この規則は、`}%%` で閉じていないディレクティブを報告する。
すべての図種に当たる。

引数が 1 語のディレクティブは、その語と後の空白で終わるが、
引数の前の空白は改行をまたぐ。
行の終わりの `%%{wrap` は、次の行の最初の語を引数として取り、その語は消える。
規則は、このようなディレクティブも報告する。

### 図種ごとの現れ方

図種に対応したときに、その図種で規則が見つけるものをここに足す。

- flowchart: `flowchart LR`、最後の `%%` のない `%%{init: {"theme": "dark"}}`、
  `A-->B` は、頂点もリンクもない flowchart になる。
  `A-->B`、`}%%` のない `%%{wrap`、`C-->D` は頂点 `C` を失い、
  `-->D` が前のリンクに続く。
  リンクは `A` から `B` と、`B` から `D` になる。

例は flowchart である。

この規則に**反する**コードの例:

```mmd
flowchart LR
  A --> B
  %%{init: {"x": 1}
C-->D
```

```mmd
flowchart LR
  %%{init: {"theme": "dark"}}
A-->B
```

この規則に**従う**コードの例:

```mmd
%%{init: {"theme": "dark"}}%%
flowchart LR
  A --> B
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-ignored-init-directive](./no-ignored-init-directive.ja.md)

## リソース

- [規則のソース](../../src/rules/no-unclosed-directive.ts)
- [テストのソース](../../tests/rules/no-unclosed-directive.test.ts)
