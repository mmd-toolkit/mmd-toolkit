---
name: tests-db-from-tree
description: >-
  Write the Db builder from a tree (src/db-from-tree/) of a diagram type in
  @mmd-toolkit/tests, with its documents, from the syntax and tree documents;
  the steps are written for Langium diagram types. Use once the specification
  defines the syntax and tree of a diagram type, and when a sentence of
  docs/db-from-tree/ is to be written, together with the tests skill.
---

# Langium の図: 木からの Db（tests-db-from-tree）

SKILL [tests](../tests/SKILL.ja.md) の 1〜4 の節（方針と基準、最初に読むもの、
これらの SKILL が書くもの、確かめ方）は、この手順にも当たる。
先に読む。

SKILL [tests-diagram-type](../tests-diagram-type/SKILL.ja.md) に従い、
その図種の挙動を抽出して固定 fixture を集める。
保持する形や不透明な埋め込みデータの指定読みを生成する前に、
SKILL [tests](../tests/SKILL.ja.md#51-保持する形式と埋め込みデータの指定読み) の
5.1 に従う。
構文と AST の定義後は、その契約から、次の手順で Db builder を実装する。
以下のパスは `packages/tests` からの相対パスである。

意味上の受理は parser のもので、記録の種類と `fixtureAccepts` の比較で確かめる。
仕様側の module と helper は規則で名付ける。
エンジン名は抽出手順で Mermaid の実装を指すもので、木が実装する規則ではない。

1. その図種の構文・AST の文書、parser の token・位置の契約、
   `docs/db-from-tree.md` を読む。
   意味上の受理条件は、Db 抽出の文書に委ねず、構文仕様の直接の文として求める。
   比べる値と状態の遷移も、escaping、entity の変換、実効の同一性、
   各文の後の更新を含め、そこに定義を求める。
2. 要約と仕様の値・状態の規則から `src/db-from-tree/<図種>.ts` を実装し、
   Mermaid の処理手順を写さず、converted-text、数、埋め込み値の helper と、
   定めた生成 id の順序を使う。
   文書の置換・順序の規則を保ち、node があっても公開されない値は除き、
   要約に影響する node を落とさずに空の要約を認める。
   builder には固定の手組みの木のテストを書く。
3. builder を `docs/db-from-tree/<図種>.md` に書き、日本語の対を持たせ、
   区別する場合ごとに fixture を引用する。
   木が記録される前は、記録から契約を推測せず、
   仕様と固定の手組みの木で実装する。
   AI エージェントは、
   変更の記録した木を [recorded-trees](../recorded-trees/SKILL.ja.md) で読む。
   共有の埋め込み値の helper を使い、比較可能な `dbFromTree` の結果すべてを、
   記録された読みと比べる。
   木と Db の実数、記録の不足、不一致ごとの入力を報告する。
   受理の読みで木がない場合やエラー記録を黙って飛ばさず、
   エラー記録を飛ばすのは、その印の読みが拒否するときだけとする。
   SKILL [tests](../tests/SKILL.ja.md#51-保持する形式と埋め込みデータの指定読み)
   の 5.1 と同じく、比較する Db のない場合を明示する。
   builder が記録した木で走るように、図種は、
   記録した木のない図種の一覧から外れ、`DIAGRAMS` に入る。
   その手順は、
   SKILL tests-diagram-type の
   [2 節の手順 7](../tests-diagram-type/SKILL.ja.md#2-正規化関数) にある。
