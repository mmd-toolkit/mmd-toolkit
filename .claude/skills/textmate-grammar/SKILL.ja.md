---
name: textmate-grammar
description:
  Maintain @mmd-toolkit/textmate-grammar, the TextMate grammar for Mermaid text,
  published on npm and used by the playground and the documentation site,
  written from the specification alone. Use when a rule, a scope, a comment or a
  fixture of the grammar changes, when the specification changes (a sentence, a
  heading, a header in detection.md, a diagram type added or removed), when
  mermaid.js is updated, which reaches the grammar only through the
  specification, and when the build or the published files of the package
  change.
---

# TextMate 文法の保守（textmate-grammar）

`packages/textmate-grammar` の変え方と、仕様が変わったときの追い方です。
この文法は仕様だけを読むので、mermaid.js の変更は、
仕様の変更を通してだけ文法に届きます。

## 方針と基準

`packages/textmate-grammar`:

- すべての規則は、仕様（`packages/spec/docs`）だけから書きます。
  Shiki の Mermaid 文法（`shiki/langs/mermaid.mjs`、`@shikijs/langs`）と、
  その元の vscode-mermaid-syntax-highlight は、開かず、読まず、写しません。
  そこから取った規則は、仕様ではなく、それらの読み方で Mermaid を読むからです。
- 仕様の文書 1 つにつき、ファイルを 1 つにします。
  `packages/spec/docs/diagrams/<図種>.md` の図種の規則は
  `grammar/diagrams/<図種>.grammar.json` に、
  すべての図種が共有する規則は `grammar/common.grammar.json` に置きます。
  それらをまとめるのは、`src/grammar.ts` の 1 つの関数です。
  公開する入口は読み込まれたときにそれを呼び、
  ビルドはそれを呼んで `lib/mermaid.tmLanguage.json` を書き出します。
- 共有の変数や規則にするのは、`common.md` か `detection.md` が定める形と、
  共有の規則と図種の規則（または共有の規則の変種）の両方が要る部分だけです。
  1 つの図種の文書が定める形は、ほかの図種が同じ綴りで書いていても、
  その図種に置きます。
  ファイルの中でくり返すときは、そのファイルの変数 `<図種>-<名前>` にします。
  2 つの形は 2 つの文書に従い、別々に変わるからです。
- 仕様が受理される入力の中で定めるすべての単位に、その種類のスコープを付けます。
  スコープは、パッケージの `README.md` の Scopes の節にある 1 つの表から、
  どの図種でも同じに選びます。
  表は README にだけ置き、このスキルには写しません。
- 規則の `comment` には、文法自身の言葉で、
  規則が読むものと位置の手がかりを書きます。
  そのあとに、規則が従う仕様の節を、
  `Follows c4.md#the-top-level-context.` のように anchor で名指します。
  仕様の文は写しません。
  文法はパーサーと同じく名指した節を実装するもので、色は fixture が確かめます。
  仕様の変更がどの規則に届くかは、この anchor でたどります。
- キーワードは大文字小文字を区別せずに比べ、キーワードの ASCII の文字は、
  その ASCII の大文字と小文字にだけ一致します（`common.md#notation`）。
  規則は `(?i:…)` と書き、
  `src/grammar.ts` がすべてのパターンの先頭に Oniguruma のオプション `(?I)`
  を置きます。
  なので、この文法には Shiki の Oniguruma エンジンが要ります。
  Shiki の JavaScript エンジンは `(?I)` を拒否します。
  Shiki を更新したら、playground がまだ Oniguruma エンジンを作り、
  VitePress がまだ既定でそれを使うことを確かめます。
- テストは固定の入力だけを使います。
  図種ごとの `tests/fixtures/` の fixture（`<名前>.mmd` と、
  その `<名前>.expected.json` と `.tokens` の記録）、
  適合 corpus の fixture から取ったヘッダーの綴り、
  `tests/grammar.test.ts` の境界の場合です。
  不可視文字が要る入力は、
  `.expected.json` の `escapedInputs` にエスケープで書き、
  ファイルにその文字をそのまま書きません。
- 仕様とパーサーが先に進み、文法は後から、仕様のリリースされた版に追いつきます。
  仕様には Changesets で、版、変更履歴、
  git のタグ `@mmd-toolkit/spec@<版>` を付けます（npm には公開しません）。
  README に、文法が従う版を書きます。
  5 節はそこから始まります。
- すべての規則に当てはまる限界は、
  `grammar/common.grammar.json` のトップレベルの `comment` と README に 1
  回だけ書きます。
- このパッケージは npm に公開します。
  パッケージの利用者に見える変更（単位を何として色付けするか、スコープ、図種、
  従う仕様の版、export やファイル）には、
  同じ変更で changeset を足します（`changesets` スキル）。
  README は利用者向け（インストール、ホスト、スコープ、限界）で、
  `docs/development.md` は開発者向け（ファイル、comment、変数、ビルド、
  テスト）です。

## 1. 最初に読むもの

1. この文書の方針と基準の節、AGENTS.md の Principles、`conventions` スキル。
2. パッケージの `README.md`（Scopes の節の表と各種類が何を含むか、限界）と、
   その `docs/development.md`（ファイル、comment、変数、ビルド、テスト）。
3. `src/grammar.ts` と、
   `grammar/common.grammar.json` のトップレベルの `comment` （限界と、
   各共有変数が表す文）。
4. 図種について。
   `packages/spec/docs/diagrams/<図種>.md` の全体、
   `packages/spec/docs/detection.md` のその項目、文法のファイル、fixture です。

この作業が書くのは、`packages/textmate-grammar`、
その changeset（`.changeset/`）、このスキルだけです。
仕様の抜けは spec スキルで直し、推測で書いた規則で埋めません。
commit と push は、頼まれたときだけ行います（AGENTS.md）。
stage は変えません。
`git mv`、`git stash`、`git checkout`、`git restore` は使いません。

## 2. ファイルの組み立て

- `grammar/common.grammar.json` は、`variables`、共有の規則、限界を持ちます。
  正規表現の中の `{{name}}` は変数で、変数は別の変数を使えます。
  図種のファイルは、図種名とダッシュで始まる名前の `variables` を宣言できます。
- `src/grammar.ts` は変数を解決し、`match`、`begin`、`end`、`while` に置き換え、
  それぞれの先頭に `(?I)` を置きます。
  未知の名前、循環、2 回宣言された名前、図種名で始まらない図種の変数があると、
  例外を投げます。
  `src/grammar.ts` の図種のファイルの並びは、`detection.md` の順です。
- `src/shiki-language.ts` は、文法を Shiki の登録にします（名前 `mermaid`、
  別名 `mmd`、埋め込む `yaml`）。
  ビルド（`pnpm --filter @mmd-toolkit/textmate-grammar run build`）は、
  文法を `lib/mermaid.tmLanguage.json` に書き出し、
  入口の `src/index.ts` を文法のファイルとともに `lib/index.mjs` にまとめます。
  テストと playground はソースを読むので、ビルドは要りません。
  ドキュメントサイトは、ビルドしたパッケージを読みます。
- 図種のブロックは、ヘッダーで始まり、テキストの終わりまで続きます。
  図種はヘッダーから 1 回だけ決まります。
- ファイル名が `*.grammar.json` なのは、
  lint の JSON スキーマ検査が SchemaStore
  からファイル名でスキーマを選ぶからです。
  SchemaStore には、
  `block.json` と `info.json` という名前の別のファイルのスキーマがあります。
- agentflow は flowchart の規則を含みます（agentflow.md は flowchart
  の規則を使い回します）。
  2 つは一緒に変えます。
  agentflow と eventmodeling はコメント行を受け取るので、
  共通のコメントを読まない、共有の規則の変種を使います。

## 3. 確かめ方（どの作業でも）

- `pnpm --filter @mmd-toolkit/textmate-grammar test` は、
  テストファイル全体を動かします。
  報告の前には全体を動かします。
  絞り込み（`-t`）では、ヘッダー、先頭トリビア、境界のテストが外れます。
- 記録: `pnpm --filter @mmd-toolkit/textmate-grammar run test:update` は、
  すべての `.tokens` 記録を書き直します。
  複数の作業が同時に動くときは、それぞれ自分の記録だけを書き直します。
  `pnpm --filter @mmd-toolkit/textmate-grammar exec vitest run -u -t "colors (<名前>|<名前>) as its"`
  です。
  書き直した記録は、すべて読みます。
- 記録の差分は、作業の前に取ったパッケージの写しと比べて読みます（`diff -u`）。
  git の index とは比べません。
  index が作業ツリーより古い状態を持つことがあり、
  その差分には前の作業が混ざるからです。
- fixture に足した入力は、
  すべて参照パーサーが受理することを確かめます（`packages/parser/lib/index.mjs`
  の `parse()` は、拒否される入力で例外を投げます）。
- `src/`、ビルド、`package.json` のフィールドを変えたときは、
  `pnpm --filter @mmd-toolkit/textmate-grammar run build` の後、
  パッケージで `npm pack --dry-run` を実行します。
  一覧に出るのは `lib/`、README のファイル、`package.json` だけです。
  ドキュメントサイトのテストとビルドは、ビルドしたパッケージを読みます。
- `pnpm run lint`（`lint:chars` を含む）と `pnpm run format:check`。

## 4. 規則やスコープを変えるとき

1. 規則が従う文と、その節がその位置で定める単位を読みます。
2. 各単位に、表からその種類のスコープを付けます。
   仕様が 1 つのテキストを要素の id と表示テキストの両方として読むときは、
   ラベルにします。
3. ファイルの中の複数の規則が要る部分は、1 回だけ書きます（補助の規則か、
   ファイルの変数）。
   形が common.md か detection.md のものなら、共有の変数を使います。
4. comment を決めた形で書きます。
5. 文が区別する場合ごとに、fixture の行（またはエスケープした入力）を足し、
   `.expected.json` にそのスコープの assert を足して、記録を書き直します。
6. パッケージの利用者に見える変更なら、
   changeset を足します（`changesets` スキル）。

## 5. 仕様が変わったとき

1. README が挙げる版から、追いつく先の版までの仕様の変更を読みます。
   `git diff @mmd-toolkit/spec@<挙げる版>..@mmd-toolkit/spec@<新しい版> -- packages/spec/docs`
   です。
2. その間の `packages/spec/CHANGELOG.md` の項目で、
   何が変わったかの要約を読みます。
3. 変わった節ごとに、それに従う規則を探します。
   文法のファイルを、その anchor（`<文書>.md#<節>`）で検索します。
   変更には、まだどの規則も従っていない文もあります（新しいキーワード、
   文の新しい形）。
   1 の差分で読み、文法に入れます。
4. 規則、その comment、fixture、`.expected.json` を一緒に直し、
   記録を書き直します。
   場合は次のとおりです。
   - 文が変わった、足された: 規則が読むものが変わったら規則を直し、
     その文が区別する場合ごとに、
     fixture の行（またはエスケープした入力）を足します。
     文が消えたときは、その文だけが支えていた規則を、
     その fixture の行と assert とともに消します。
   - 見出しが変わった: anchor が変わります。
     古い anchor を名指す comment をすべて直します。
     節が分かれたり合わさったりしたときは、
     いま規則の読むものを定める節を名指します。
   - `detection.md` のヘッダーが変わった（足された、名前が変わった、
     無くなった）: その図種のブロックの begin（Detection 節のヘッダーの綴り）、
     その comment、
     `tests/grammar.test.ts` のヘッダーの一覧（各ヘッダーの corpus の fixture
     の図種と名前）を直します。
   - 図種が増えた: その文書が定める単位の種類を、
     それぞれを定める節とともに一覧にします。
     `grammar/diagrams/<図種>.grammar.json` を書きます。
     Detection 節のヘッダーの綴りそれぞれで始まるブロックで、
     各単位にはその種類のスコープを付け、各 comment は決めた形で書きます。
     `src/grammar.ts` に import と一覧の位置（`detection.md` の順）を足し、
     ヘッダーの一覧にそのヘッダーの fixture を足します。
     `tests/fixtures/<図種>.mmd` を、単位を定める文から書き、
     各種類の単位を少なくとも 1 つ入れます。
     その `.expected.json` では、
     各種類のスコープを少なくとも 1 つ assert します（名前とラベルは必ず、
     図種にあれば形とブロックの区切りと style の値も）。
     記録を書き、README（英日）の図種の一覧に足します。
   - 図種が無くなった: 文法のファイル、import と一覧の項目、
     ヘッダーの一覧のヘッダーの fixture、fixture のファイル、
     README の名前を消します。
5. README（英日）が挙げる版を新しい版に更新し、
   その版を名指す changeset を足します（`changesets` スキル）。

## 6. mermaid.js の更新のとき

この文法は、mermaid.js から何も取りません。
tests スキルと spec スキルの手順で仕様が更新されるのを待ち、
5 節の手順を当てます。
文法の中に、mermaid.js の版に結び付いたものはありません。
playground の例（playground の依存の
`@mermaid-js/examples`）はそのリリースに合わせて変わるので、
7 節のとおりに色付けし直します。

## 7. 成果物の確かめ方

- 作業の前に取った写しとの差分を読みます。
  範囲（作業が変えてよいファイルだけか）、
  表への合い方（各単位にその種類のスコープが付いているか）、
  仕様への合い方（comment が名指す節が、規則の読むものを定めているか）を見ます。
- playground の例を色付けして、その単位のスコープを読みます。
- 作者が動かしたコマンドを動かし直しても、新しいことは何も確かめられません。

## 8. 避ける誤り

- 色を付ける単位を字句の種類（キーワード、文字列、数値、矢印）で選ぶと、
  名前とラベルにスコープが付きません。
  仕様が定めるすべての単位に、その種類のスコープを付けます。
- 別の構文についての節を名指す comment は、後の仕様の変更を違う規則へ導き、
  本当に届く規則を直さないまま残します。
  規則の読むものを定める節を名指します。
- 共有のファイルを変えられないまま複数の図種を同時に作業すると、
  要る共有の形がそれぞれの図種に写され、写しは互いにずれていきます。
  いくつかの図種で同じ綴りなだけのテキストは、共有の形ではありません。
  共有の形を先に足してから図種に進み、共有か図種のものかを上の基準で決めます。
- テストの絞り込み（`-t`）は、ヘッダー、先頭トリビア、境界のテストを外します。
  これらは、共有の規則をすべての図種について確かめるテストです。
  報告の前には、ファイル全体を動かします。
- 並列の作業中に `-t` の絞り込みなしで `vitest -u` を動かすと、
  ほかの作業の記録を書き直します。
- ディレクティブを各値の正規表現に手で書き込むと、規則が長くなり、
  写しがずれていきます。
  `{{directive}}` などの共有変数を使います。
- 変種のある規則を 1 つの場合ずつ直すと、隣の場合が壊れます。
  変種が同じ部分をくり返しているからです。
  節が区別する場合を挙げ、規則の形（その部分を変数として）を 1 回決めてから、
  すべての変種をそこから組み立てます。
- Oniguruma の absent operator `(?~|…|…)` のようなまれな構文は、
  見てすぐには読めません。
  式を明示的に書きます。
- fixture のファイルに行区切りや段落区切りをそのまま書くと、
  `pnpm run lint:chars` が落ちます。
  そのような入力は `escapedInputs` にエスケープで書きます。
- パターンの中の `(?iI:…)` は、Oniguruma で空の一致になります。
  `I` はパターン全体のオプションで、`src/grammar.ts` が先頭に置きます。
