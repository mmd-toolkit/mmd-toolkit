---
name: tests-tree-checks
description: >-
  Write the Db builder from a tree (src/db-from-tree/) and the tree checker
  (src/check-tree/) of a diagram type in @mmd-toolkit/tests, with their
  documents, from its syntax and tree documents; the steps are written for
  Langium diagram types. Use once the specification defines the syntax and the
  tree of a diagram type, for the checkTree step that the spec skill names, and
  when a sentence of docs/db-from-tree/ is to be written, together with the
  tests skill.
---

# Langium の図: 木からの Db と木の検査（tests-tree-checks）

SKILL [tests](../tests/SKILL.ja.md) の 1〜4 の節（方針と基準、最初に読むもの、
作業ツリーの扱い、確かめ方）は、この手順にも当たる。
先に読む。

SKILL [tests-diagram-type](../tests-diagram-type/SKILL.ja.md) に従い、
その図種の挙動を抽出して固定 fixture を集める。
保持する形や不透明な埋め込みデータの指定読みを生成する前に、
SKILL [tests](../tests/SKILL.ja.md) の 5.1 に従う。
構文と AST の定義後は、その契約から、
次の手順で Db builder と checker を実装する。
以下のパスは `packages/tests` からの相対パスである。

`checkTree` が見るのは、木の欄、範囲、token、字句の不変条件だけである。
意味上の受理は parser のもので、記録の種類と `fixtureAccepts` の比較で確かめる。
仕様側の module と helper は規則で名付ける。
エンジン名は抽出手順で Mermaid の実装を指すもので、木が実装する規則ではない。

1. その図種の構文・AST の文書、parser の token・位置の契約、
   `docs/db-from-tree.md`、`docs/check-tree.md` を読む。
   意味上の受理条件は、Db 抽出の文書に委ねず、構文仕様の直接の文として求める。
   比べる値と状態の遷移も、escaping、entity の変換、実効の同一性、
   各文の後の更新を含め、そこに定義を求める。
   定義された全ノードと欄を、共有の振り分けと欄・値の表に登録し、
   AST 文書の表の形が異なる場合は、共有の表 reader を拡張する。
2. 要約と仕様の値・状態の規則から `src/db-from-tree/<図種>.ts` を実装し、
   Mermaid の処理手順を写さず、converted-text、数、埋め込み値の helper と、
   定めた生成 id の順序を使う。
   文書の置換・順序の規則を保ち、node があっても公開されない値は除き、
   木の coverage を落とさずに空の要約を認める。
   builder には固定の手組みの木のテストを、
   checker には受理木と不正木のテストを書く。
3. `src/check-tree/<図種>.ts` に、coverage、欄、範囲、token、
   書かれた値の共有検査を使う。
   各葉が、その位置の完全な字句単位であることを検査する。
   その位置の最初の一致の優先順と、keyword・構成要素の境界に従う。
   複合形式は、書かれた keyword、記号、値の構成要素と照合する。
   AST の空・null・空白の規則も含める。
   ここで検査する書かれた綴りと、converter による Db の読みを区別する。
4. 保持する hidden の一致が、指定された隙間か本体の位置に、
   ソース順でちょうど一度あることを検査する。
   文字を明示的に走査し、仕様が先に選ぶ選択肢の中で最初の閉じを探し、
   本文のある一致が隣接する空の fallback より先なら、その順に試す。
   kind・value フィールドだけでなく、書かれた形式全体を検査する。
   文の末尾の隙間と本体の境界は AST の定義に従う。
   形式の前に可視 EOL があるかも検査する。
5. hidden terminal が直後の LF を消費するとき、
   その LF は保持する形式の範囲の外に置く。
   区切りを検査する前に、その消費を反映する。
   次の文には、文法規則が要求する可視 EOL が残っていなければならない。
   余分の LF、先読みだけの閉じ境界、付加 LF、EOF を別々に確かめる。
   書かれた EOL がなくても、EOF が文法規則を満たす場合がある。
6. ヘッダー後の native Comment ごとに、その単位位置で、
   先行する terminal が一致しないことを検査する。
   先に開始した文字列・複合値が、開始点を包んでいないことも検査する。
   terminal の一致は、文字の明示的な走査で確かめる。
   source のコメント領域と native Comment を区別する。
   ヘッダー前では、検出が通した裸行は Comment であり、
   一緒に通した空白・改行は trivia である。
   これらを図の単位として読み直さない。
   保持する接頭部には、それ自身の terminal の規則を適用する。
   本文の通常の隙間と hidden の閉じ境界は、図種の仕様どおり厳密に保つ。
   検出の例外は、検出が通した区間だけに適用する。
7. `tests/check-tree-<図種>.test.ts` に、明示的な受理木と不正木を書く。
   hidden の形式を落とす・複製する・移すことで、所有先を壊す。
   選んだ選択肢の中で後の閉じを選ぶ、
   本文に適合する一致があるのに隣接する空の閉じを選ぶ、
   消費した LF を範囲に含める、残る EOL を消す、書かれた構成要素を変える、
   先行 terminal を Comment に偽装する場合も含める。
   包む値の内側の hidden に見えるテキスト、余分の LF、EOF の受理対照も書く。
   保持する各接頭部の後に、
   検出が通した裸行と Unicode trivia がある固定例を書く。
   保持した形式同士の間に、通過した trivia がある場合も書く。
   通過した行がない対照も含める。
   本文の通常の隙間が厳密なままであることも確かめる。
   コーパスの成功だけでなく、各文と規則の接点から場合を導く。
8. builder を `docs/db-from-tree/<図種>.md`、
   検査を `docs/check-tree.md` に書く。
   どちらも日本語の対を持たせ、区別する場合ごとに fixture を引用する。
   木が記録される前は、記録から契約を推測せず、
   仕様と固定の手組みの木で実装する。
   木が記録されたら、すべての記録木に checker を実行する。
   共有の埋め込み値の helper を使い、比較可能な `dbFromTree` の結果すべてを、
   記録された読みと比べる。
   木と Db の実数、記録の不足、不一致ごとの入力を報告する。
   受理の読みで木がない場合やエラー記録を黙って飛ばさず、
   エラー記録を飛ばすのは、その印の読みが拒否するときだけとする。
   SKILL [tests](../tests/SKILL.ja.md) の 5.1 と同じく、
   比較する Db のない場合を明示する。
   builder が記録した木で走るように、図種は、
   記録した木のない図種とノードの型の一覧から外れ、`DIAGRAMS` に入る。
   その手順は、
   SKILL tests-diagram-type の
   [2 節の手順 7](../tests-diagram-type/SKILL.ja.md#2-正規化関数) にある。
