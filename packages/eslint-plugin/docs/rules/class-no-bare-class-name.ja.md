# @mmd-toolkit/class-no-bare-class-name

英語版: [class-no-bare-class-name.md](./class-no-bare-class-name.md)

何も変えない、クラス名だけの行を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は、文として単独で書いたクラス名をエラーなしに受理するが、
クラスを宣言しない。
そこに書いたものは効果を持たない。

## 規則の詳細

この規則は、クラス図（`classDiagram`、`classDiagram-v2`）に当てる。
`class`、関係、メンバーなしに、文として単独で書いたクラス名を報告する。
名前は複数の語を含むこともでき、mermaid.js はその間の空白を取り除く。

`direction lr` も対象になり、名前 `directionlr` として読まれ、
方向は `TB` のままである。
`title Animals` も名前 `titleAnimals` として読まれる。
表示するタイトルはフロントマターで設定し、`title` の文はない。
クラスは `class Foo`、関係、`Foo : +int x` のようなメンバーの文で宣言する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-bare-class-name: error
classDiagram
  direction lr
```

```mmd
%% eslint @mmd-toolkit/class-no-bare-class-name: error
classDiagram
  title Animals
  class A
```

```mmd
%% eslint @mmd-toolkit/class-no-bare-class-name: error
classDiagram
  Foo
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-bare-class-name: error
classDiagram
  direction RL
  class A
```

```mmd
%% eslint @mmd-toolkit/class-no-bare-class-name: error
classDiagram
  class Foo
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [class-no-ignored-text](./class-no-ignored-text.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/class-no-bare-class-name.ts)
- [テストのソース](../../tests/rules/class-no-bare-class-name.test.ts)

<!-- end auto-generated rule resources -->
