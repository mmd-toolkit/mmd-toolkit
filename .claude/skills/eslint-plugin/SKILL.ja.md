---
name: eslint-plugin
description:
  Write, change, or remove the rule documents of eslint-plugin-mmd under
  packages/eslint-plugin-mmd/docs/rules/, and update them when a diagram type is
  added. Use when a rule has been decided and needs its document, when a
  document must follow a change of the tree or the fixtures, or when a diagram
  type is supported. Which rules exist is decided with the rule-ideas skill.
---

# 規則の文書の書き方（eslint-plugin）

`eslint-plugin-mmd` は、
Mermaid の図のテキストのための ESLint の言語プラグインである。
その規則の文書を、すべての主張を mermaid.js、
`@mmd-toolkit/parser` の木、fixture で確かめて書く手順。
会話の履歴や記憶がなくても、この文書だけで同じ文書を書けるように書く。
規則の実装は、まだ扱わない。
文書はそれぞれ `src/rules/` の規則のファイルに属し、それは 6 節で扱う。

## 1. 最初に読むもの

1. AGENTS.md の `packages/eslint-plugin-mmd` の節。
   このパッケージが持つ規則と持たない規則、規則を共通にする条件、
   規則は木とトークンを読み、テキストを字句解析し直さないこと。
   基準は変わるので、毎回読む。
2. AGENTS.md の Principles。
   英語の文書と日本語の対、見えない文字を書かないこと、
   Prettier による文章の折り返し、
   Mermaid のテキストのコードブロックの info string は `mmd`、
   mermaid.js のソースへのリンクの書き方。
3. 木の定義: `packages/spec/docs/ast.md` と `packages/spec/docs/ast/<図種>.md`。
   規則の条件は、ここにあるノードの型、欄、トークンの種類で書く。
4. `packages/eslint-plugin-mmd/docs/rules/index.md` と、
   同じ種類の既存の文書 1 つ。
5. `packages/eslint-plugin-mmd/docs/development.md` の
   「Rules and their documents」の節。
   規則のファイル、文書のうちそれから生成する部分、
   コマンド `update` と `check:docs` が書いてある。

規則の採否、名前、範囲は、
先に rule-ideas の SKILL（`.claude/skills/rule-ideas/SKILL.md`）の手順と
AGENTS.md の基準で決める。
この手順は、そうして決めた規則の文書を書く。
確かめた結果、条件が成り立たない、木とトークンから見つけられない、
例が mermaid.js に拒否される、などが分かったら、
その規則は決めたとおりには書けない。
文書を書かずに、その根拠を持って規則の判断に戻る。

## 2. 文書の置き場所と規則の id

- 共通の規則: `docs/rules/<名前>.md` と `<名前>.ja.md`。
  id は `mmd/<名前>`。
- 図種の規則: `docs/rules/<図種>/<名前>.md` と `<名前>.ja.md`。
  id は `mmd/<図種>/<名前>`。
  `<図種>` は文書 `packages/spec/docs/ast/<図種>.md` の名前で、
  図種の id ではない。
  `flowchart/` には、`flowchart-v2`、`flowchart-elk`、`swimlane` の規則を置く。
- 2 つの図種に同じ種類の問題があっても、構文とノードが違えば、
  それぞれのディレクトリに、同じ名前の規則を 1 つずつ置く。

## 3. 文書の形

形は ESLint の規則の文書に合わせ（1 行の説明、
反するコードと従うコードの例を持つ Rule Details、Options、Related Rules）。
規則の文書は、規則を使う人のための文書で、
規則が何を報告し、mermaid.js が報告するテキストをどう読むかを書く。
規則を実装するのに要ること（木での条件と fixture）は、
規則を実装するまで、もう 1 つの文書である規則の覚え書きに書く。
英語の規則の文書:

    # mmd/<diagram>/<name>

    Japanese version: [<name>.ja.md](./<name>.ja.md)

    Disallow ….

    <!-- begin auto-generated rule notice -->
    …
    <!-- end auto-generated rule notice -->

    <動機。短い 1〜2 段落>

    ## Rule Details

    <規則が報告するもの、当たる図種、報告しないもの>

    ### In each diagram type            （共通の規則だけ）

    Examples of **incorrect** code for this rule:

    ```mmd
    …
    ```

    Examples of **correct** code for this rule:

    ```mmd
    …
    ```

    ## Options

    This rule has no options.

    ## Related Rules                    （関連する規則があるときだけ）

    - [<name>](./<name>.md)

英語の規則の覚え書き。
規則の文書と同じパスで、`docs/rule-notes/` の下に置く
（`docs/rule-notes/<diagram>/<name>.md`）。

    # mmd/<diagram>/<name>

    Japanese version: [<name>.ja.md](./<name>.ja.md)

    Notes for implementing the rule [mmd/<diagram>/<name>](../../rules/<diagram>/<name>.md).

    The rule is not implemented yet. These notes are for implementing it.

    ## How the tree shows it

    ## Fixtures

日本語の規則の文書は同じ部分を持つ。
`英語版: [<名前>.md](./<名前>.md)`、`…を禁止する。`、`## 規則の詳細`、
`### 図種ごとの現れ方`、`この規則に**反する**コードの例:`、
`この規則に**従う**コードの例:`、
`この規則にはオプションがない。` を持つ `## オプション`、
`## 関連する規則` である。
日本語の規則の覚え書きは、`英語版: [<名前>.md](./<名前>.md)`、
`規則 [mmd/<図種>/<名前>](…) を実装するための覚え書き。`、
`この規則はまだ実装していない。` と `ここには、実装するときに要ることを書く。`、
`## 木での現れ方`、`## fixture` を持つ。
日本語の文書からほかの文書へのリンクは、その日本語版（`.ja.md`）に向ける。

各部分の書き方:

- 題は完全な規則の id（共通の規則は `# mmd/<名前>`）。
  題が id を持つので、規則の id の行は置かない。
  題は生成する。
  新しい文書を書いたときも、1 行目は `update` が置き換える（6 節）。
- 言語のリンクの行の次の段落は、Disallow で始まる短い 1 文
  （日本語では `…を禁止する。`）で、ESLint の規則の説明と同じ形にする。
  英語の文は、規則の `meta.docs.description` と一字一句同じにする。
  2 つが違うと、`check:docs` が失敗する。
  日本語の文は、`index.ja.md` での規則の説明になる。
  題とこの文の間には、箇条書きなど、ほかのものを置かない。
- 告知: 最初の段落の後の、`<!-- begin auto-generated rule notice -->` から
  `<!-- end auto-generated rule notice -->` までの部分で、
  `recommended` の設定がこの規則を有効にするかどうかを書く。
  これは生成する部分で、手で書いたり変えたりしない。
  新しい文書には `update` が入れる。
- 動機: 書き手が何を書き、mermaid.js がそれをどう扱い、
  なぜそれが誤りかを書く。
  短くし、詳しいことは規則の詳細に書く。
- 規則の詳細: 規則が報告するものを正確に書く。
  当たる図種（共通の規則は「すべての図種に当たる。」、
  図種の規則はその図種の id）と、報告しないものとその理由も書く。
  mermaid.js の振る舞いは、入力と、mermaid.js が持つ値（Db）で書く。
  テキストの直し方は、mermaid.js で確かめたものだけを書く。
- 図種ごとの現れ方（共通の規則だけ。規則の詳細の小節）:
  「図種に対応したときに、その図種で規則が見つけるものをここに足す。」で始め、
  対応した図種ごとに 1 項目、そこで起きることと例を書く。
- 例: 「この規則に**反する**コードの例:」と
  「この規則に**従う**コードの例:」の後に、
  info string が `mmd` のコードブロックを、1 つのブロックに 1 つの例で書く。
  共通の規則では、その前に、
  どの図種の例かを書く（「例は flowchart である。」）。
  例は、その誤りの普通の書き方にする。
  振る舞いを見るためだけに足した前置き（空の説明の前の説明など）は、
  例に入れず、規則の詳細に書き、fixture に記録する。
  行末の空白が要る例は、コードブロックに残らないので、文で書く。
  従う例には、条件の境界を示すものを選ぶ。
  正しい書き方と、条件が当たらない最も近いテキストである。
  各コードブロックは、fixture の入力を整形したもの（4 節の手順 4）にし、
  本文で例を引くときは、コードブロックのとおりに書く。
  フォーマッターが空白を入れるところは、`A-->B` ではなく `A --> B` と書く。
  行を指すときは、数えずに、その行が持つもので指す。
- オプション: オプションのない規則は「この規則にはオプションがない。」。
  後で足すかもしれないオプションは、足す条件とともにだけ書く。
- 関連する規則: 関連する規則があるときだけ、リンクの箇条で書く。
- When Not To Use It: 書くべき中身があるときだけ書く。
  どの規則にも当てはまる文だけの節は作らない。
- 規則の文書は、書き手が何を書き、mermaid.js がそれをどう読むかを書く。
  木のノードの型、欄、トークンの種類は名指ししない。
  それらは規則の覚え書きに書く。
  mermaid.js の事実、issue や PR へのリンク、仕様の既知の差へのリンクは、
  規則を使う人にも要るので、規則の文書に残す。
- 規則の覚え書き: 「この規則はまだ実装していない。」と
  「ここには、実装するときに要ることを書く。」で始める。
  覚え書きは、規則を実装するまでのものである。
  実装したら、条件は規則のコードに、fixture は規則のテストに移るので、
  覚え書きを（英日とも）消し、規則の文書に、
  規則のソースとテストへのリンクを置く節を足す。
  ESLint の規則の文書の Resources の節に当たり、
  `## リソース` に、`[規則のソース](../../src/rules/<名前>.ts)` と
  `[テストのソース](../../tests/rules/<名前>.test.ts)` を置く
  （図種の規則では `../` を 1 つ足す）。
  例の fixture は、そのテストが使う fixture になる。
  index の冒頭の、実装した規則を述べる文を直す。
- 木での現れ方（規則の覚え書き）: 条件を、
  ノードの型、欄、トークンの種類と値、範囲で書く。
  共通の規則は、すべての図種が共有する木の部分（Root、そのトークン、コメント、
  ディレクティブ、共通の葉のノード）だけを使う。
  図種が補うものが要るときは、何が要るかをこの節に書き、
  その中身は「図種ごとの現れ方」に書く。
  木とトークンの外に出る部分は、そうと名指しし、それが生む設計上の論点を書く。
  ソースを読む（空白は木にない）、値を解釈する（ラベルの中の HTML）、
  埋め込みデータを読む（ディレクティブの引数）、
  Db の導き方を繰り返す（subgraph の id）、などである。
  木とトークンからまったく見つけられないときは、字句解析し直す方法を書かない。
  木がもっと示す必要があるなら、それは木の仕様の変更（spec の SKILL）であり、
  そうでなければ、その規則は持たない（rule-ideas の SKILL）。
- fixture（規則の覚え書き）: 「規則が依拠する mermaid.js の読み方は、
  `@mmd-toolkit/tests` の次の fixture に記録されている。」の後に、
  主張と例を裏付ける fixture を並べる。
  まだ fixture のないものがある間は、
  最後に「ほかの例の fixture は追加中である。」を置く。
  英語版では「Fixtures for the other examples are being added.」である。

## 4. 書く前と書いた後に確かめること

mermaid.js を動かし、テキストを parse し、整形するスクリプトは、
rule-ideas の SKILL（`.claude/skills/rule-ideas/SKILL.md`）の 4 節にある。
リポジトリの外に置き、`node <ファイル>` で動かす。
mermaid.js の呼び出しは直列で遅いので、入力が多いときは、
バックグラウンドで動かし、出力をファイルに書く。

1. mermaid.js の読み方: 各例を `packages/tests/src/mermaid.ts` の
   `runMermaid(text)` に掛ける。
   どの例も受理されなければならない（拒否される入力は構文エラーで、
   規則は報告しない）。
   Db の値は、文書に書いたとおりでなければならない。
2. 木での条件: 「木での現れ方」の条件を、
   `packages/parser/src/index.ts` の `parse(text)` の結果（`traverseNodes`、
   `root.tokens`、`root.comments`、`root.directives`）に当てるコードにして、
   反する例すべてに当たり、従う例のどれにも当たらないことを確かめる。
   境界の入力も足す。
   空白の有無、`\n` と `\r\n`、同じ行と次の行、ディレクティブ、コメント行、
   文字列の中、subgraph の中、`;` で区切った 1 行の複数の文である。
3. 整形: 反する例をすべて、整形のスクリプトで整形し、
   出力に mermaid.js の読み方が現れないことを確かめる。
   フォーマッターがすでに見えるようにするものの規則は、
   持たないからである（AGENTS.md）。
   プラグインが import する `@mmd-toolkit/parser` は、
   ソースではなく、ビルドした `packages/parser/lib` に解決される。
   parser のソースが変わっていたら、先に
   `pnpm --filter @mmd-toolkit/parser run build` で lib を作り直す。
   作り直さないと、例が古い parser で整形される。
   反する例それぞれの整形の結果は、作業の結果（9 節）に含める。
4. 例と fixture: 例は、すべて `packages/tests/fixtures` の fixture から取り、
   その fixture の `input.mmd` を
   prettier-plugin-mmd（既定のオプション）で整形した出力から、
   末尾に行終端子があればそれを除いたものにする。
   閉じていないディレクティブの中でテキストが終わるときは、
   出力は行終端子で終わらない。
   AGENTS.md は、Mermaid の例をフォーマッターが印字する形で書くとしている。
   整形は Db を変えないので、その fixture は、
   例を mermaid.js がどう読むかを記録している。
   示したいテキストを入力に持つ fixture を選び、
   その入力を整形のスクリプトで整形し、出力をそのまま使う。
   フォーマッターが行を書いたまま残すところも、出力のとおりにする。
   確かめ方は、fixture の入力を整形し、出力と例を比べること。
   例外は、空白の有無そのものが要点で、わざと書いたまま残す例だけで、
   そのときは文書にそう書く。
   prettier-plugin-mmd にその図種の printer がまだないときは、
   例を、その図種について決めた整形の方針の形で手で書き、
   printer ができたら、その出力と例を比べる。
   方針がまだ決まっていなければ、
   flowchart の printer の形（ヘッダーの後の文を 1 段下げる）に合わせる。
   挙げる fixture の `expected.json` が文書の主張どおりであることを確かめる。
   例にする fixture は、従う例も含めて、
   `accepted` が true のものだけにする。
   fixture のない例と主張には、fixture を足す。
   それを示す最小の入力を、
   `@mmd-toolkit/tests` の生成器（`packages/tests` で `pnpm run fixtures:add`。
   `packages/tests/docs/maintaining-fixtures.md` のとおり）で足し、
   書かれた `expected.json` を読み、
   新しい fixture を規則の覚え書きの一覧に入れる。
   fixture ができるまでは、覚え書きの fixture の節の最後に、
   追加中であることを書く文を置く。

## 5. 書いた後の検査

1. 書いた文書に `npx prettier --write` を 2 回かけ、
   2 回目で何も変わらないことを確かめる。
2. `pnpm --filter eslint-plugin-mmd run update` を実行する（6 節）。
3. `pnpm run lint:docs`、`pnpm run format:check`、
   `pnpm run lint:chars` が通ること。
   `lint:docs` は、日本語の対と `check:docs` を確かめる。
   `check:docs` は、生成する部分、規則と文書の対応、
   英語の最初の段落と `meta.docs.description` の一致を確かめる。
4. 日本語の文書の改行は、書き手が書く。
   Prettier は書かれた改行を保つからである。
   `*.ja.md` は `proseWrap: "preserve"` である（AGENTS.md）。
   1 文を 1 行に書き、長い文は意味の切れ目の `、` の後で改行して、
   文章のどの行も 80 桁（全角は 2 桁と数える）を超えないようにする。
   表、コードブロック、切れ目のない長いリンクは数えない。
   規則の文書の最初の段落も、同じ決まりで書く。
   index は、行の切れ目に依らずにそれを読む。
5. 英語と日本語の文書で、コードブロックと fixture の一覧が同じであること。
   両方から、コードブロックの行と fixture を挙げた行を抜き出して比べる。
6. 挙げた fixture がすべて `packages/tests/fixtures` にあり、
   相対リンクの先がすべてあること。

## 6. 規則のファイルと、生成する部分

文書はそれぞれ `src/rules/` の規則のファイルに属する。
2 つは、`docs/development.md` の「Rules and their documents」の節のとおり、
一緒に足し、名前を変え、消す。
まだ実装していない規則は、何も報告しない骨組みである。

- 規則のファイルから来るもの: 規則があること、その名前、
  英語の説明（`meta.docs.description`）、
  `recommended` の設定がそれを有効にするかどうか。
  規則を足す、名前を変える、消す、英語の文書の最初の段落を変える、
  のどれも、規則のファイルを変える。
- `pnpm --filter eslint-plugin-mmd run update` が書くもの:
  すべての文書の題と告知。
  `index.md` と `index.ja.md` の、
  `<!-- begin auto-generated rules list -->` から
  `<!-- end auto-generated rules list -->` までのすべて。
  そこには共通の規則の表と図種ごとの表があり、
  行は英語の説明と、日本語の文書の最初の段落を持つ。
  これらは手で書かない。
  日本語の文書の最初の段落を変えたら、`update` を実行する。
- index のうち手で書くもの: 生成する一覧より前の部分
  （実装した規則を述べる文を持つ冒頭と、規則の id の節）。
- 文書を消したら、ほかの文書から参照が残っていないことを `grep` で確かめる。

## 7. 図種に対応したとき

1. `packages/spec/docs/ast/<図種>.md` の名前で `docs/rules/<図種>/` を作る。
   index の図種の表は、その規則ができると `update` が生成する（6 節）。
2. 共通の規則ごとに、新しい図種の普通の書き方の例を mermaid.js に掛ける。
   ほかの図種と同じに振る舞うなら、
   「図種ごとの現れ方」に 1 項目（起きること、例、その fixture）を足す。
   振る舞いが違う、または木の共通の部分の 1 つの定義で扱えなくなったなら、
   その規則は共通の規則の条件（AGENTS.md）を満たさない。
   図種の規則に移すのは規則についての判断なので、
   先に mermaid.js の結果を根拠に rule-ideas の SKILL で決め、
   それから文書を移す（8 節）。
3. その図種の規則の文書は、上の手順で書く。

## 8. 文書を消す、移す

- `rm` と普通の `mv` を使う。
  作業ツリーをほかの作業と共有しているときは、
  ほかの作業がステージしたものをそのままに保つため、
  これに git（`git mv`、`git rm`、ステージの変更）を使わない。
- 文書を移すときは、規則の名前が変わる（6 節）。
  当たる図種を書いた規則の詳細の文と相対リンクを直し、`update` を実行する。
  題と index の行は `update` が書く。
- 規則の覚え書きは、規則の文書と一緒に移し、一緒に消す。
  移したら、その中の規則の文書へのリンクを直す。
  `update` と `check:docs` は `docs/rules/` だけを読み、覚え書きには触らない。

## 9. 作業の結果

作業の結果として次を示す。
書いたファイル、例ごとの条件の結果（当たる、当たらない）、
報告する例それぞれの整形の結果、
足した fixture（追加中の間は、最小の入力と mermaid.js の結果）。
主張ごとに、実行して確かめたか、読んで確かめたか、確かめていないかを書く。
