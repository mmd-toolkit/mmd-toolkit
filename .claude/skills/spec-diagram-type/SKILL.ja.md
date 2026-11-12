---
name: spec-diagram-type
description: >-
  Add a diagram type to the specification under packages/spec/docs/: the order
  of the steps, the detection rules of a Langium diagram type, the diagram
  document with its four sections, and the checks before the parser reads the
  specification. Use when a diagram type is added to the specification, after
  the tests skills have collected its fixtures, together with the spec skill.
---

# 仕様に図種を足すとき（spec-diagram-type）

SKILL [spec](../spec/SKILL.ja.md) の「方針と基準」と 1〜8 の節（最初に読むもの、
道具、mermaid.js を読む、木のノード、主張と fixture、規則の確かめ方、出力、
既知の差異の提案）は、この手順にも当たる。
先に読む。

## 1. 手順

入力: その図種の Db の正規化関数と、収集した fixture。
tests-diagram-type の SKILL の 2 節と 3 節で作る。
mermaid.js を読むこと（spec の SKILL の「mermaid.js を読む」）と木の案（spec の
SKILL の「木のノードを足す」の項目 3）は fixture が要らないので、
収集の間に始めてよい。
主張は、
そのために書いた入力で確かめ（spec の SKILL の「mermaid.js
で入力を確かめる」）、収集が済んでから fixture にする。
収集にすでにある入力に、主張のための 2 つ目の fixture を作らないためである。

図種を足すときは、次の節に、この順で従う。

1. spec の SKILL の
   [mermaid.js を読む](../spec/SKILL.ja.md#3-mermaidjs-を読む)。
   Langium の図種では、続けて下の 2 節。
2. 下の 3 節、図種の文書を書く。
3. spec の SKILL の [木のノードを足す](../spec/SKILL.ja.md#4-木のノードを足す)。
4. spec の SKILL の
   [主張と fixture を対応させる](../spec/SKILL.ja.md#5-主張と-fixture-を対応させる)
   と [規則を確かめる](../spec/SKILL.ja.md#6-規則を確かめる)。
5. spec の SKILL の [出力](../spec/SKILL.ja.md#7-出力)。
6. 下の 4 節、parser が仕様を読む前の点検。
7. spec の SKILL の
   [既知の差異を提案するとき](../spec/SKILL.ja.md#8-既知の差異を提案するとき)。

## 2. Langium の図種の検出と、読んだ後の手順

次の項目は、
spec の SKILL の「mermaid.js を読む」の「Langium の図」の項目 1〜5 に続く。

6. [common.md](../../../packages/spec/docs/common.ja.md)
   の共通の前処理と検出の規則を読む。
   「ソースの読み方」「フロントマター」「先頭の空白」と、
   「図種の検出」が対象である。
   [detection.md](../../../packages/spec/docs/detection.ja.md)
   の図種の検出器も読む。
   3 節の Detection を書く前に、次を直接の文と固定した場合で記録する。
   - 本物の先頭のフロントマターと、
     検出点で保持する 1 つのフロントマター形のブロックを区別する。
     ブロックを飛ばすのは 1 つだけで、
     裸の `%%` の行とディレクティブの再走査より前であることを記録する。
   - 飛ばしが止まる場合を記録する。
     本文の行がない隣り合う区切り、閉じの欠落、字下げの不一致、4 個のダッシュ、
     閉じる区切りの後の文字、後に改行のない閉じ、前にある裸の `%%` の行である。
     2 つ目のブロック、ブロックと再走査のディレクティブの両方の順、
     保持するブロックの前の本物のフロントマター、
     どの区切りが一致するかを変える先頭の字下げも調べる。
   - 検出点と、たどり着いたヘッダーの位置を区別する。
     図の字句解析器が検出点からなお読む保持した形を、
     図固有の terminal の境界と受理の門に従って記録する。
     検出が通過させ、字句解析器が読み直さない裸の `%%` の行と、
     それに伴う空白と改行を記録する。
     裸の行は共通の Comment、伴う空白と改行はトリビアである。
     検出点より前の先頭トリビアと、その後で図がなお読む空白を区別する。
   - 固定した例として、保持した形が通過させた裸の行の前や間にある場合と、
     通過させた行とトリビアが保持した形の間にある場合を挙げる。
     通過させた行の後の Unicode 空白を、その行がない同じ空白、ASCII 空白とタブ、
     LF の対照例と比べる。
     ヘッダー直前の空白と、空白だけの行を含める。
     場合ごとに、検出が通過させるものと保持するもの、
     一致すべき terminal の境界、受理と木での所有を、
     spec の SKILL の「主張と fixture
     を対応させる」と「規則を確かめる」に従って記録する。
   - ほかの図種がある形を拒否するという共通の主張は、
     その図種の現在の規則と固定した fixture で確かめ直す。
     その証拠が支える範囲だけを述べ、過去の図種の一覧を引き継がない。
7. 求めた検出規則、順序つきの単位、書かれた構成要素、隠れた形、変換、
   受理の門に、この SKILL の 3 節と、
   spec の SKILL の「木のノードを足す」「主張と fixture
   を対応させる」「規則を確かめる」を適用する。
   差異を考える前に、直接の文と木を書く。
   文ごとに、名指す境界と規則の交点の明示した場合を、
   tests パッケージの Mermaid runner で調べる。
   隠れた形の所有、区切り、取られる LF、EOF、差異の逆方向を含める。
   文が区別する場合だけを fixture CLI で加え、入力を生成しない。
   見出し・flag・文の隙間と EOL の条件は、先行する図の配置を使わず、
   この図の入口と fragment の規則から求める。

## 3. 図種の文書を書く

`docs/diagrams/<図種>.md` と `.ja.md` を、
index.md の「How to read a diagram document」の 4 節で書く。

1. Detection: detection.md の該当の検出器を指す。
2. Lexical structure: 単位と文脈を、各文脈の規則の一覧（適用する順）で書く。
   flowchart.md の「Units and contexts」が形の例。
3. Grammar: common.md の Notation で書く。
   各規則がどのノードを作るかを表にする。
   文法が受理した後で mermaid.js が拒否する入力を、
   それを決めるものすべてとともに書く（Rejections outside the grammar）。
   意味上の受理条件を、それに要る比較値と状態の変化とともに、
   書かれた文に対する直接の規則で述べる。
   テキストの外のサイト設定に依る条件は、既定値と、
   変更された設定を持つ側がそれを適用し、残りは木だけで決めることを述べる。
4. Known divergences: known-divergences.md の識別子のうち、
   この図種に当たるものと、それがこの図種でどう現れるか。
   新しい差異は、spec の SKILL の「既知の差異を提案するとき」のとおり定める。

図種の Db の要約と、それを木から作る手順は、
`@mmd-toolkit/tests` の文書（`docs/db-summaries.md` と
`docs/db-from-tree/<図種>.md`）である。
そこに要るものは、
tests-diagram-type のスキル（要約）と tests-tree-checks
のスキル（木から作る手順）の手順で書く。

## 4. parser が仕様を読む前の点検

parser は仕様だけから書く。
その前に、図種について次の点検をし、
各点検の結果を出力に書く（spec の SKILL の「出力」）。

1. **単位の名前。**
   字句構造と文法の単位の名前を、文法の規則の名前も含めて一覧にする。
   1 つの名前は 1 つの単位を指す。
   キーワードの単位とテキストの単位が名前を共有しない（state では、
   キーワードが `style`、スタイルのテキストが `style-text`）。
2. **どの文字もどれかの単位に入る。**
   どの文脈でも、空白でない文字は、単位、コメント、述べた拒否のどれかに入る。
   1 行のノートや別名の `:` のような区切り、行の規則が無視する `;`、
   mermaid.js の規則が読んでトークンを返さないテキスト（`processId` が落とす
   id、空の説明ブロック）も同じ。
   parser は `packages/parser/docs/tokens/<diagram>.md` で、
   各単位にトークンの種類を、無視される `;` に文脈ごとの種類を与える。
   仕様は、それができるように各単位に名前を付ける。
3. **文法がすべての単位を取る。**
   字句構造に挙げた単位は、記号も含めて、どれも文法のどれかの規則に現れ、
   規則の単位は、どれも字句構造のどれかの規則から来る。
4. **コメント。**
   各図のコメントについて、その印（`#`、`%%`）と値を、例とともに書く。
   id の中のコメント、文の後のコメント、
   印の文字の間や値の中のディレクティブの例。
5. **閉じていない形。**
   閉じる部分なしに受理される形のノード（テキストの終わりの説明ブロック）は、
   `closed` の欄を持つ。
6. **木の文書はそれだけで読める。**
   各ノードは、`ast/<diagram>.md` に自分の節と欄の表を持つ。
   「`<OtherDiagram>Node` と同じ」と書いた節を作らない。
   欄が null になる条件と空の形は、表かその下に書く。
7. **要約を欄ごとに。**
   要約の各記録の各欄について、図種のすべての fixture で、キーがない、値が空、
   値がある、の 3 つの場合を数える。
   現れた場合は、どれも tests の `docs/db-from-tree/<図種>.md` の文で説明され、
   fixture を持つ。
   説明する文のない場合の文は、tests-tree-checks のスキルの手順で書く。
   最初の訪れでだけ決まるもの、積み重なるもの、
   更新がそのまま残すもの（`Object.assign`
   は新しいオブジェクトにないキーを残す）を、Db のクラスで探す。
8. **値の外で Db が読むもの。**
   木は Db を変えるものを持つ。
   値として（mermaid.js が読む空白。空白だけの値も）、
   列の null の要素として（`,` の間の空の項目）、
   トークンとして（`:` があるかどうか）持つ。
   どのノードもトークンも持てないものは、
   spec の SKILL の「木のノードを足す」の項目 4 のとおりに書く。
9. **範囲。**
   「任意の文字」は、どれも、改行、U+2028、U+2029 を含むかどうか、
   できるだけ多く読むか少なく読むか、
   規則がどこでもう一度試されるかを述べる（規則は、
   その文脈のどの位置でも試され、文脈を出ない単位の後でも試される）。
10. **空の単位。**
    文字列とテキストの各単位について、空でもよいかどうかと、
    文法が空のものをどこで取るか（`string` と `string-or-empty`）を述べる。
11. **列の空の終わり。**
    各列（本体の文、`,` の間の項目、行、本体の区切り）について、
    最後の区切りの後に何もないときにどうなるかを述べる。
    区切りで終わる本体、`,` で終わる id やスタイルの列、
    キーワードのすぐ後で終わるテキストなど。
    どれも mermaid.js と Db のクラスで確かめる。
    最後の部分が空のとき、mermaid.js は違う形を作ることが多い（state は、
    最後の文が区切りである本体を分けない）。
12. **キーワードの後に続くもの。**
    各キーワードについて、語の文字、数字、`-`、`:`、`#`、`%`、`{`、`"`、改行、
    テキストの終わりが続くときにどうなるかを mermaid.js で確かめ、
    キーワードの後に語の文字が続いてよいかを規則に書く。
    jison では、`"left of"` のように語の文字で終わる型の規則は、
    終わりに `\b` を持ち、`\s+` や `\s*` で終わる規則は持たない。
13. **既知の差異。**
    図種の既知の差異の入力は、新しい識別子でも既存の識別子でも、
    どれも spec の SKILL の「既知の差異を提案するとき」の 4
    つの答えが書かれている。

7 の集計。
要約の、オブジェクトのリストである記録について:

```ts
// node <this file> <diagram> — 要約の各記録の各欄について、
// キーがない fixture、値が空の fixture、値がある fixture を 1 つずつ示す。
import { loadFixtures } from "<repo>/packages/tests/src/index.ts"
import type { DiagramType } from "<repo>/packages/tests/src/index.ts"

function kind(value: unknown): "missing" | "empty" | "set" {
  if (value === undefined) return "missing"
  if (value === "" || (Array.isArray(value) && value.length === 0))
    return "empty"
  return "set"
}

const fixtures = (await loadFixtures(process.argv[2] as DiagramType)).filter(
  (fixture) => fixture.expected.accepted,
)
// すべての fixture にわたる、各記録の欄。
const fields = new Map<string, Set<string>>()
for (const fixture of fixtures) {
  for (const [record, items] of Object.entries(fixture.expected.db)) {
    if (!Array.isArray(items)) continue
    const names = fields.get(record) ?? new Set<string>()
    for (const item of items)
      for (const name of Object.keys(item)) names.add(name)
    fields.set(record, names)
  }
}
const tally = new Map<string, Map<string, string>>()
for (const fixture of fixtures) {
  for (const [record, names] of fields) {
    for (const item of fixture.expected.db[record] as Record<
      string,
      unknown
    >[]) {
      for (const name of names) {
        const cases =
          tally.get(`${record}.${name}`) ?? new Map<string, string>()
        if (!cases.has(kind(item[name])))
          cases.set(kind(item[name]), fixture.name)
        tally.set(`${record}.${name}`, cases)
      }
    }
  }
}
for (const [key, cases] of tally) console.log(key, Object.fromEntries(cases))
```

fixture でキーがないことが一度もない欄も、ある入力ではないことがある。
値が `undefined` になりうる各欄は、Db のクラスで読む。
