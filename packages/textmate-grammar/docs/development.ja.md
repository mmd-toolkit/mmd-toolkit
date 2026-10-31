# 開発

英語版: [development.md](./development.md)

文法の書き方、ビルド、テストです。
すべての規則は、
[README](../README.ja.md#図種)が名指しする版の
[仕様](../../spec/README.ja.md)だけから書きます。

## TextMate文法にした理由

パーサーのトークンではなくTextMate文法を選んだのは、
playgroundで編集中のテキストはパーサーにしばしば拒否され、
色が消えてしまうからです。
ShikiのMermaid文法は使いません。
32図種のうち15図種しか知らず、その一部は不完全です。
C4の規則は5つのヘッダーのうち4つしか知らず、
どれも5つのヘッダーが受け付ける呼び出しの一部しか持ちません。
`accTitle`と`accDescr`もありません。
そしてそれらを、仕様ではなく自分の読み方で色付けします。
全図種を仕様から書くことで、すべての色の出所が1つになります。

## ファイル

- `grammar/common.grammar.json`は、すべての図種が共有する規則を持ちます。
  frontmatter（本文はYAMLとして色付け）、ディレクティブ（`%%{ … }%%`）、
  `%%`のコメント行、中のHTMLタグとエンティティを含む文字列、共通の`title`、
  `accTitle`、`accDescr`の形です。
  そのトップレベルの`comment`は、すべての規則に当てはまる制限を書いています。
  READMEの[制限](../README.ja.md#制限)は、それを列挙しています。
- `grammar/diagrams/<図種>.grammar.json`は、1つの図種のブロックを持ちます。
  `packages/spec/docs/diagrams/`の文書1つにつき1つです。
  ブロックはその図種のヘッダーで始まり、その図種のすべての単位に、
  種類に応じたスコープを付けます（[スコープ](../README.ja.md#スコープ)を参照）。
- `src/grammar.ts`は、これらのファイルを1つのTextMate文法にまとめます。
  `src/shiki-language.ts`は、それをShikiの言語の登録にします。
- パッケージの入口`src/index.ts`は、読み込まれたときに作った登録をexportします。
  ビルドは、それを文法のファイルとともに`lib/index.mjs`にまとめ、
  同じ関数が返す文法を`lib/mermaid.tmLanguage.json`に書き出します。

ファイル名が`.grammar.json`で終わるのは、リポジトリのlintのJSONスキーマ検査が、
SchemaStoreからファイル名でスキーマを選ぶからです。
SchemaStoreには、
`block.json`と`info.json`という名前の別のファイルのスキーマがあります。

## ビルド

```sh
pnpm --filter @mmd-toolkit/textmate-grammar run build
```

テストとplaygroundはソースを読むので、ビルドは要りません。
ドキュメントサイトはビルドしたパッケージを読むので、
サイトやそのテストを動かす前にビルドしてください。

## 規則のコメント

各規則は`comment`に、その規則が何を読むかを文法自身の言葉で書き、
必要なら規則の位置を書きます。
その後に、従う仕様の節をanchorで名指します。
たとえば、
`Follows c4.md#the-top-level-context and detection.md#the-detectors.`です。
仕様の文は写しません。
文法はパーサーと同じく名指した節を実装するもので、
何を色付けするかはfixtureが確かめます。
規則の`comment`には、
`grammar/common.grammar.json`の制限を超えて省いたものだけを書きます。

## 変数

正規表現のうち複数の規則が要る部分は、変数`{{name}}`として1回だけ書きます。
Sublime Textのsublime-syntaxファイルの変数に倣っています。
`grammar/common.grammar.json`は、
仕様のcommon.mdかdetection.mdが定める形を宣言します。
空白の集合（`{{ws}}`、`{{lws}}`、`{{separators}}`）、
ディレクティブ（`{{directive}}`）、
ディレクティブが立ってよい空白（`{{gap}}`）などです。
共有の規則の部分のうち、図種の規則やその共有の規則の変種も要るものも宣言します。
そのトップレベルの`comment`は、それぞれの出典の文を名指しします。
図種の文書が定める形は、ほかの図種が同じ綴りで書いていても、その図種に置きます。
規則の中にじかに書くか、図種名とダッシュで始まる名前の、
そのファイルの変数にします。
変数は別の変数を使えます。
まとめる処理が変数を置き換えます。
未知の名前、循環、2回宣言された名前があるときと、
図種ファイルの変数の名前が図種名で始まらないときは、失敗します。
変数は使うところごとに値の全体で置き換わるので、まとめた正規表現と、
ビルドが書き出す文法ファイルは、文法のファイルに書いた式よりずっと長くなります。

## 大文字小文字を区別しないキーワード

キーワードを大文字小文字を区別せずに比べる箇所では、
仕様の[表記](../../spec/docs/common.ja.md#表記)により、
キーワードのASCIIの文字は、そのASCIIの大文字と小文字にだけ一致します。
long sは`s`と一致せず、KELVIN SIGNは`k`と一致しません。
Onigurumaの大文字小文字の無視はこれらにも一致させるので、
規則はキーワードを`(?i:…)`のグループに書き、
まとめる処理がすべてのパターンの先頭に`(?I)`を置きます。
`(?I)`は、大文字小文字の無視をASCIIに限るOnigurumaのオプションです。
`(?I)`はパターン全体のオプションです。
`a(?iI:s)b`のように長いパターンのグループの中に書くと、
Onigurumaは検索を始めた位置で空の一致を返します。

## テスト

`pnpm --filter @mmd-toolkit/textmate-grammar test`は、
固定入力をShikiでトークン化します。

- 図種ごとに、
  `tests/fixtures/`の入力が1つあります（railroadは4つの文法それぞれに1つ）。
  その図種の単位を定める仕様の文から書き、パーサーが受理します。
  その`.expected.json`は、ヘッダー、各種類の単位、
  `accTitle`と`accDescr`のスコープと、
  スコープが付いてはならない境界の場合を名指しします。
  テストはそれを確かめ、全トークンを`.tokens`記録と比べます。
  行区切りのように、リポジトリがfixtureファイルに置かない文字が要る入力は、
  `.expected.json`の`escapedInputs`にエスケープで書き、
  記録なしで同じように確かめます。
- すべてのヘッダーの綴りについて、
  [detection.md](../../spec/docs/detection.ja.md)の各項目の最小入力と、
  図種の文書が受理する残りの綴りのコーパスのfixtureを、
  `@mmd-toolkit/tests`の`loadFixture`で読んで使います。
  ヘッダーがキーワードとして色付けされることを確かめます。
- 先頭トリビア（ヘッダーより前のfrontmatter、ディレクティブ、コメント行）と、
  共有の規則の境界の場合にも、固定入力があります。
- まとめた文法がTextMate文法ファイルのフィールドを持ち、
  すべてのパターンが`(?I)`で始まり、`{{`を含まないことを確かめます。

文法を変えた後は、
`pnpm --filter @mmd-toolkit/textmate-grammar run test:update`で
`.tokens`記録を書き直します。
残す前に、書き直した記録を読んでください。

## 変え方

規則は、従う節とともに変えます。
規則とその`comment`を変え、節が名指しする場合をfixtureが持たなければ、
その図種のfixtureと`.expected.json`も変えます。
仕様に図種が加わったときは、`grammar/diagrams/<図種>.grammar.json`と、
そのfixture、`.expected.json`、`.tokens`記録を足します。
`src/grammar.ts`には、そのimportと一覧の位置（detection.mdの順）を足します。

仕様に新しい版ができたら、文法はそれに従います。
2つの版のgitのタグの間で`packages/spec/docs`の変更を読み、
変わった節をanchorで名指す規則を探します。
規則とfixtureを変え、READMEが名指しする版を変えます。
