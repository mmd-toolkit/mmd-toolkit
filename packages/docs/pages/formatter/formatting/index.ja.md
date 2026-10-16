# 整形規則

フォーマッターは、図の構文に応じてインデント、空白、改行を整えます。
整形済みの図をもう一度整形しても、結果は変わりません。

mermaid.jsが図から読み取る内容を保ち、
整形すると読み取り方が変わる箇所は書かれたまま残します。
この保証の例外は、[互換性][compatibility]で説明しています。

## 空白と行の配置

図の意味が変わらない範囲で、次のように整えます。

- ブロックの内容に、入れ子の深さに応じたインデントを付けます。
- 文を別々の行に分けます。
  文を区切る`;`は、改行に置き換えられる場合に取り除きます。
- 矢印の前後など、構文の要素の間の空白を整えます。
- 連続する空行を1行にまとめ、ブロックの先頭と末尾の空行を取り除きます。

インデントの幅や種類と出力の改行コードは、
[整形オプション](../options.ja.md)に従います。
ラベル、メッセージ、クラスメンバーなどの値に含まれるテキストや空白は、
変更すると図の意味が変わる箇所では保ちます。

## 例

このシーケンス図では、文が別々の行に分かれ、
ループの内部にインデントが付き、矢印の前後に空白が付きます。

入力:

```mmd
sequenceDiagram A->>B: x; B->>A: y
loop x
A->>B: y
end A->>B: z
```

整形結果:

```mmd
sequenceDiagram
  A ->> B: x
  B ->> A: y
  loop x
    A ->> B: y
  end
  A ->> B: z
```

[Playgroundでこの入力を開き][example]、
**Formatted**タブを選ぶと、オンラインで試せます。

## コメントと埋め込みデータ

コメントの本文は保ちます。
独立した行のコメントは、周囲の文と同じ深さでインデントします。
文の後ろにあるコメントは、その行に残します。

ディレクティブ（`%%{ ... }%%`）とデータブロック（`@{ ... }`）の内容は、
書かれたまま残します。
`---`の行の間にあるYAMLフロントマターは、
PrettierのYAMLフォーマッターで整形します。
PrettierがYAMLとして読めない場合や、
[フロントマターの互換性][frontmatter]で説明する条件に当てはまる場合は、
YAMLを書かれたまま残します。
埋め込みデータの構造や値がMermaidで有効かどうかは、検証しません。

## 図ごとのガイド

空白、ブロックの配置、書かれたまま残す箇所は、図の構文によって異なります。

<!-- formatter-diagram-guides:start -->

- [Flowchart](../../../../prettier-plugin-mmd/docs/flowchart.ja.md)
- [Sequence](../../../../prettier-plugin-mmd/docs/sequence.ja.md)
- [Class](../../../../prettier-plugin-mmd/docs/class.ja.md)
- [State](../../../../prettier-plugin-mmd/docs/state.ja.md)

<!-- formatter-diagram-guides:end -->

[compatibility]: ../../../../prettier-plugin-mmd/docs/compatibility.ja.md
[frontmatter]: ../../../../prettier-plugin-mmd/docs/compatibility.ja.md#フロントマター
[example]: https://mmd-toolkit.github.io/mmd-toolkit/playground/#v1=H4sIAAAAAAAAEzXKOwqEQAwA0KuE1NpYZmFA8QjCNtNEjR_QzGoc8IN3t3Hr9y60ENdGkNBkiaKNlCP3K8-Qp84VBPsHitS5nODwOoXwg93ra4dX0fY_T6-Y4Mb1d2y3ASlLMJpUXBtSx5PJ_QC3OqLHbgAAAA
