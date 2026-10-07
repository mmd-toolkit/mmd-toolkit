# @mmd-toolkit/class-no-ignored-text

英語版: [class-no-ignored-text.md](./class-no-ignored-text.md)

mermaid.js が読まないテキストを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

`direction` の文は、それだけで 1 行に書く。
行にほかのテキストもあると、mermaid.js は行全体を方向の文として読み、
残りをエラーなしに捨てる。

## 規則の詳細

この規則は、方向の行で、`direction` の前か、方向の値の後にあるテキストと、
メソッドの行のうち mermaid.js が読まない部分を報告する。
対象の図種は `classDiagram` である。

`class A direction LR` は方向を `LR` にし、クラスを宣言しない。
`direction TBX` は方向を `TB` にし、`X` は捨てられる。

方向の文のつもりでない行も、方向の文になる。
`A --> B : set direction LR now` や `note "x direction TB"` のように、
`direction` と方向の値が行にあると、その行は方向の文になり、
関係やノートはなくなる。
この規則はそれも報告する。

`direction LR %% vertical` のように、
方向の後の `%%` で始まるテキストは報告しない。
書き手はコメントのつもりで書き、mermaid.js も書き手の意図どおりにそれを捨てる。

行区切りの文字（U+2028 か U+2029）を含むメソッドの行は、1 つの部分だけが読まれ、
この規則はほかの部分を報告する。
そうした行は、下のコードブロックには載せない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-ignored-text: error
classDiagram
  class A direction LR
```

```mmd
%% eslint @mmd-toolkit/class-no-ignored-text: error
classDiagram
  direction TBX
```

```mmd
%% eslint @mmd-toolkit/class-no-ignored-text: error
classDiagram
  A --> B : set direction LR now
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/class-no-ignored-text: error
classDiagram
  direction RL
  class A
```

```mmd
%% eslint @mmd-toolkit/class-no-ignored-text: error
classDiagram
  direction LR %% vertical
  class A
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [class-no-bare-class-name](./class-no-bare-class-name.ja.md)
- [flowchart-no-ignored-text](./flowchart-no-ignored-text.ja.md)
- [sequence-no-ignored-text](./sequence-no-ignored-text.ja.md)
