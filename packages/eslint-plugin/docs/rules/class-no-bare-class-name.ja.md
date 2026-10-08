# @mmd-toolkit/class-no-bare-class-name

英語版: [class-no-bare-class-name.md](./class-no-bare-class-name.md)

何も変えない、クラス名だけの行を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は、文として 1 つだけ書いたクラス名を受理し、何もしない。
クラスも宣言しない。
そこに書き手が書いたものは、何の効果も持たない。

## 規則の詳細

この規則は、`class`、関係、メンバーなしに、
文として 1 つだけ書いたクラス名を報告する。
対象の図種は `classDiagram` である。

クラス名は 1 つ以上の語で、mermaid.js は語の間の空白を除く。
そうした文は、次のようにして生じる。

- 方向の値を小文字で書いた `direction lr` は、クラス名 `directionlr` で、
  方向は `TB` のままである。
- `title Animals` は、クラス名 `titleAnimals` である。
  クラス図には `title` の文がない。
  図とともに表示するタイトルはフロントマターでだけ指定するので、
  タイトルは空のままである。
- `Foo` だけの行は、クラス `Foo` を宣言しない。
  クラスは、`class Foo`、関係、
  または `Foo : +int x` のようなメンバーの文で宣言する。

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
