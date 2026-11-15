# 記録された木のチェックリスト

英語版: [checklist.md](./checklist.md)

入力から決めた図種について、次の文書を使う。
`packages/spec/docs/diagrams/<diagram>.ja.md` （検出、字句構造、文法、
既知の差異）、`packages/spec/docs/ast/<diagram>.ja.md`（各ノード型の見出し）、
`packages/parser/docs/tokens/<diagram>.ja.md` （トークンと、
コメントや trivia の節）、
`packages/parser/docs/positions/<diagram>.ja.md`（範囲）を読む。
それぞれのリンク先の節も読む。
以下のリンクは共通の根拠を示す。
図種の節とともに適用する。

- 各ノードの型を、入力のその位置の構文と照らして確認する。
  根拠:
  [共通の葉のノード](../../../../packages/spec/docs/ast.ja.md#共通の葉のノード)、
  [図ごとのノード](../../../../packages/spec/docs/ast.ja.md#図ごとのノード)。
- ノードの過不足、子を置く親の欄、子の欄とリストの順序を確認する。
  ソース順の例外の定義も適用する。
  根拠: [ノード](../../../../packages/spec/docs/ast.ja.md#ノード)。
- null と空のリストも含め、全欄の有無、型、値を、その欄の表と定義文で確認する。
  根拠: [欄の書き方](../../../../packages/spec/docs/ast.ja.md#欄の書き方)、
  [Root](../../../../packages/spec/docs/ast.ja.md#root)、
  [図ごとのノード](../../../../packages/spec/docs/ast.ja.md#図ごとのノード)。
- 値の中で残す、または除くテキストも含め、
  書かれた値とリテラルの `raw` を入力と照らして確認する。
  根拠: [ノード](../../../../packages/spec/docs/ast.ja.md#ノード)、
  [StringLiteral](../../../../packages/spec/docs/ast.ja.md#stringliteral)、
  [NumericLiteral](../../../../packages/spec/docs/ast.ja.md#numericliteral)。
- 全ノード、トークン、コメント、ディレクティブ、
  フロントマターの `range` と `loc` を確認する。
  元の入力の UTF-16 オフセットと行の境界を使う。
  根拠: [位置](../../../../packages/parser/docs/positions.ja.md#位置)。
- ノードの境界、根が覆う範囲、子の包含、非重複、ソース順を、
  図種の範囲の例外とともに確認する。
  根拠:
  [ノードの範囲](../../../../packages/parser/docs/positions.ja.md#ノードの範囲)、
  [不変条件](../../../../packages/parser/docs/positions.ja.md#不変条件)。
- 断片や値の中の空白も含め、全トークンの種別と境界、過不足を確認する。
  根拠: [トークン](../../../../packages/parser/docs/tokens.ja.md#トークン)、
  [文字列のトークン](../../../../packages/parser/docs/tokens.ja.md#文字列のトークン)、
  [数のトークン](../../../../packages/parser/docs/tokens.ja.md#数のトークン)、
  [Identifier のトークン](../../../../packages/parser/docs/tokens.ja.md#identifier-のトークン)、
  [ディレクティブが切るトークン](../../../../packages/parser/docs/tokens.ja.md#ディレクティブが切るトークン)。
- コメントの欄、トークンの外の配置、コメント領域の前後の断片を確認する。
  根のコメントとトークンの一覧も確認する。
  根拠: [Comment](../../../../packages/parser/docs/tokens.ja.md#comment)、
  [トークンの中のコメント領域](../../../../packages/parser/docs/tokens.ja.md#トークンの中のコメント領域)、
  [根の一覧](../../../../packages/parser/docs/tokens.ja.md#根の一覧)。
- ディレクティブのレコード、根の中の配置、`Directive` トークンとの対応を、
  コメント内の場合も含めて確認する。
  根拠: [Directive](../../../../packages/spec/docs/ast.ja.md#directive)、
  [ディレクティブの位置](../../../../packages/spec/docs/common.ja.md#ディレクティブの位置)、
  [ディレクティブのトークン](../../../../packages/parser/docs/tokens.ja.md#ディレクティブのトークン)。
- フロントマターの根の中の配置、欄、本文、区切りのトークンを、
  `valueRange` も含めて確認する。
  根拠: [Frontmatter](../../../../packages/spec/docs/ast.ja.md#frontmatter)、
  [フロントマターの規則](../../../../packages/spec/docs/common.ja.md#フロントマター)、
  [フロントマターのトークン](../../../../packages/parser/docs/tokens.ja.md#フロントマターのトークン)。
- 無視する `;` の配置とトークン種別を、
  値の断片やノードの境界への影響も含めて確認する。
  根拠:
  [`style` 行と `classDef` 行](../../../../packages/spec/docs/common.ja.md#style-行と-classdef-行)、
  [トークン](../../../../packages/parser/docs/tokens.ja.md#トークン)、
  [ノードの範囲](../../../../packages/parser/docs/positions.ja.md#ノードの範囲)。
- トークンとコメントの外の隙間が、
  許された空白または行終端だけであることを確認する。
  各トークンとレコードのテキストを、その範囲のソースと照合する。
  空の範囲や重複を含む残りすべての位置の不変条件も確認する。
  根拠: [不変条件](../../../../packages/parser/docs/positions.ja.md#不変条件)、
  [行終端](../../../../packages/spec/docs/common.ja.md#行終端)、
  [空白](../../../../packages/spec/docs/common.ja.md#空白)、
  [表記](../../../../packages/spec/docs/common.ja.md#表記)。
