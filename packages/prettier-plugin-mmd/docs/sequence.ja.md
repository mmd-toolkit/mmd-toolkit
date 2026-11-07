# sequence 図の整形規則

英語版: [sequence.md](./sequence.md)

prettier-plugin-mmd が sequence 図をどう整形するかを説明します。
以下の各規則は、mermaid.js が図から読むものを保ちます。
整形によって図の解釈が変わる箇所は、入力をそのまま残します。
各項目でその条件を説明します。
flowchart と同じ規則はそう書き、
理由は [flowchart の整形規則](./flowchart.ja.md) にあります。

各規則では、整形前のテキストと、プラグインが出力するテキストを、例で示します。
例はテストが確かめる fixture で、各例の上のリンクはそのファイルへのものです。
fixture の置き方と確かめ方は、
[文書と fixture](./development.ja.md#文書と-fixture)にあります。

## 規則

### 字下げ

ヘッダーの後の文は、ヘッダーより 1 段深く置きます。
ブロックの文と、`box` の参加者は、それを開く行より 1 段深く置きます。
ブロックは、`loop`、`alt`、`opt`、`par`、`par_over`、`critical`、`break`、
`rect` です。
`else`、`and`、`option`、`end` は、その行と同じ段に置きます。
[fixture: indentation/blocks] [fixture: indentation/sections]
[fixture: indentation/other-blocks-kept]
1 段は Prettier の `useTabs` と `tabWidth` のオプションが決め、
既定は空白 2 つです。 [fixture: indentation/tab-width-4]
[fixture: indentation/use-tabs]
入力に書かれた字下げは保ちません。
文の行頭の空白は、Mermaid による図の解釈に影響しないためです。
字下げは構造だけで決められるので、1 つの規則で、
入力の字下げによらず同じテキストになります。 [fixture: indentation/sections]

入力
([indentation/blocks-input.mmd](../tests/fixtures/sequence/indentation/blocks-input.mmd)):

```mmd
sequenceDiagram
participant A
loop every minute
A->>B: ping
alt ok
B-->>A: pong
else failed
B-->>A: error
end
end
box aqua Team
participant C
end
rect rgb(0, 0, 255)
A->>C: x
end
```

出力
([indentation/blocks-output.mmd](../tests/fixtures/sequence/indentation/blocks-output.mmd)):

```mmd
sequenceDiagram
  participant A
  loop every minute
    A ->> B: ping
    alt ok
      B -->> A: pong
    else failed
      B -->> A: error
    end
  end
  box aqua Team
    participant C
  end
  rect rgb(0, 0, 255)
    A ->> C: x
  end
```

入力
([indentation/sections-input.mmd](../tests/fixtures/sequence/indentation/sections-input.mmd)):

```mmd
sequenceDiagram
      par a
  A->>B: x
    and b
A->>C: y
end
critical c
A->>B: x
option o
A->>C: y
      end
```

出力
([indentation/sections-output.mmd](../tests/fixtures/sequence/indentation/sections-output.mmd)):

```mmd
sequenceDiagram
  par a
    A ->> B: x
  and b
    A ->> C: y
  end
  critical c
    A ->> B: x
  option o
    A ->> C: y
  end
```

### 1 行に 1 文

各文は 1 行に 1 つ置きます。
文を区切る `;` は取り除きます。
mermaid.js は `;` を改行と同じに読むからです。
[fixture: statements-one-per-line/semicolons-dropped]
ヘッダーの行や、`end` の後に同じ行で書かれた文は、それぞれの行に移します。
[fixture: statements-one-per-line/split]
mermaid.js の行単位の規則が無視する `;` を含む行は、flowchart と同じく、
その行の文と、
`;` を残します（[1 行に 1 文](./flowchart.ja.md#1-行に-1-文)を参照）。
[corpus fixture: sequence/tokens-ignored-semicolon-in-participant-id]
[corpus fixture: sequence/tokens-ignored-semicolon-in-message-id]
[fixture: statements-one-per-line/line-with-ignored-semicolon-kept]

入力
([statements-one-per-line/split-input.mmd](../tests/fixtures/sequence/statements-one-per-line/split-input.mmd)):

```mmd
sequenceDiagram A->>B: x; B->>A: y
loop x
A->>B: y
end A->>B: z
```

出力
([statements-one-per-line/split-output.mmd](../tests/fixtures/sequence/statements-one-per-line/split-output.mmd)):

```mmd
sequenceDiagram
  A ->> B: x
  B ->> A: y
  loop x
    A ->> B: y
  end
  A ->> B: z
```

空の説明ブロック `accDescr {}` は、それだけで 1 つの文です。
`box` の中でも同じで、参加者の間に置けます。
その後に同じ行で書かれた文や box の `end` は、それぞれの行に移し、
mermaid.js は同じ box を読みます。
[fixture: statements-one-per-line/empty-description-block-in-box]
[fixture: statements-one-per-line/empty-description-block-moves-next-statement]
[fixture:
statements-one-per-line/empty-description-block-before-semicolon-and-directive]

入力
([statements-one-per-line/empty-description-block-in-box-input.mmd](../tests/fixtures/sequence/statements-one-per-line/empty-description-block-in-box-input.mmd)):

```mmd
sequenceDiagram
box G
accDescr {} participant B
participant C
accDescr {} end
```

出力
([statements-one-per-line/empty-description-block-in-box-output.mmd](../tests/fixtures/sequence/statements-one-per-line/empty-description-block-in-box-output.mmd)):

```mmd
sequenceDiagram
  box G
    accDescr {}
    participant B
    participant C
    accDescr {}
  end
```

`autonumber` の後、または、
データブロックで終わり `as` のない `participant` と `actor` の後の、
ディレクティブに続く `;` は残します。
[fixture: statements-one-per-line/autonumber-directive-kept]
[fixture: statements-one-per-line/data-block-directive-kept]
[fixture: statements-one-per-line/actor-data-block-directive-kept]
[fixture: statements-one-per-line/autonumber-two-directives-kept]
そのような `;` の後に同じ行で続く文と、ブロックの `end` は、別の行に置きます。
`autonumber %%{wrap}%%; A->>B: x; B->>A: y` は、`autonumber %%{wrap}%%;`、
`A ->> B: x`、`B ->> A: y` と印字します。
[fixture: statements-one-per-line/autonumber-directive-semicolon-then-statements-split]
`autonumber`、改行、`5` のように複数行に書かれた文は、ディレクティブと `;` を、
文と一緒に書かれたまま残します。
[fixture: statements-one-per-line/directive-semicolon-after-multi-line-statement-kept]
mermaid.js はディレクティブを取り除き、行末の空白が、
文に必要な改行を隠すからです。
その文の最後の単位は、後ろの空白を読みません。
`autonumber`、空白、`%%{wrap}%%`、`;` は受理され、`;` がないと拒否されます。
ほかの文の最後の単位、つまりテキスト、id、`as` の後の説明は、
後ろの空白を一緒に読みます（仕様の
[文の文脈](../../spec/docs/diagrams/sequence.ja.md#文の文脈) と、
[区切りの前の空の説明ブロック](../../spec/docs/diagrams/sequence.ja.md#区切りの前の空の説明ブロック)
を参照）。 [fixture: statements-one-per-line/closed-directive-semicolon-dropped]

入力
([statements-one-per-line/autonumber-directive-kept-input.mmd](../tests/fixtures/sequence/statements-one-per-line/autonumber-directive-kept-input.mmd)):

```mmd
sequenceDiagram
autonumber %%{wrap}%%;
A->>B: x
```

出力
([statements-one-per-line/autonumber-directive-kept-output.mmd](../tests/fixtures/sequence/statements-one-per-line/autonumber-directive-kept-output.mmd)):

```mmd
sequenceDiagram
  autonumber %%{wrap}%%;
  A ->> B: x
```

入力
([statements-one-per-line/data-block-directive-kept-input.mmd](../tests/fixtures/sequence/statements-one-per-line/data-block-directive-kept-input.mmd)):

```mmd
sequenceDiagram
participant A@{ "type": "actor" } %%{wrap}%%;
A->>B: x
```

出力
([statements-one-per-line/data-block-directive-kept-output.mmd](../tests/fixtures/sequence/statements-one-per-line/data-block-directive-kept-output.mmd)):

```mmd
sequenceDiagram
  participant A@{ "type": "actor" } %%{wrap}%%;
  A ->> B: x
```

### 空行

flowchart と同じです。
空行の連続は 1 つにし、ブロックの先頭と末尾の空行は取り除きます。
[fixture: blank-lines/collapsed]
[fixture: blank-lines/around-comments-and-directives]
[fixture: blank-lines/block-edges-dropped]

入力
([blank-lines/collapsed-input.mmd](../tests/fixtures/sequence/blank-lines/collapsed-input.mmd)):

```mmd
sequenceDiagram


A->>B: x



B->>A: y
loop x

A->>B: z

end
```

出力
([blank-lines/collapsed-output.mmd](../tests/fixtures/sequence/blank-lines/collapsed-output.mmd)):

```mmd
sequenceDiagram
  A ->> B: x

  B ->> A: y
  loop x
    A ->> B: z
  end
```

### トークンの間の空白

行の中で、2 つのトークンの間の空白とタブの連続は空白 1 つにし、
接しているトークンは接したまま残します。
flowchart と同じです。 [fixture: whitespace-between-tokens/collapsed]
[fixture: whitespace-between-tokens/tabs-collapsed]
`wrap:` などの折り返しの接頭辞とその本文の間は、
空白が書かれているかどうかを保ちます。
[fixture: whitespace-between-tokens/wrap-prefix-kept]
2 人の参加者にまたがるノートの id の間の `,` は、
`note over A,B` のように両側の id に接します。
`note over A , B` は `note over A,B` になります。
mermaid.js が受け付ける書き方は、どれも同じ Db になるので、
形を強いるものはありません。
mermaid.js の文書にある、2 人の参加者にまたがるノート 5 件は、
すべて `A,B` と書かれています。
そのうち 2 件は、
[ここ](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L49-L77)
にあります。
残る 3 件は、
[ここ](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L445-L464)
にあります。 [fixture: whitespace-between-tokens/collapsed]
[fixture: whitespace-between-tokens/comma-touching]
`,` の隣の隙間にあるものは、
[矢印の前後の空白](#矢印の前後の空白)と同じに扱います。
キーワードは、書かれた大文字小文字のまま残します。
例えば `PARTICIPANT A`、`Note LEFT OF A` です。
mermaid.js は大文字小文字にかかわらず読むからです。
[fixture: whitespace-between-tokens/keyword-case-kept]

入力
([whitespace-between-tokens/collapsed-input.mmd](../tests/fixtures/sequence/whitespace-between-tokens/collapsed-input.mmd)):

```mmd
sequenceDiagram
participant   A   as   Alice
autonumber  10   5
create   participant C
A->>C: x
note  over A ,C: n
A->>B: wrap:x
A->>B: wrap:   y
```

出力
([whitespace-between-tokens/collapsed-output.mmd](../tests/fixtures/sequence/whitespace-between-tokens/collapsed-output.mmd)):

```mmd
sequenceDiagram
  participant A as Alice
  autonumber 10 5
  create participant C
  A ->> C: x
  note over A,C: n
  A ->> B: wrap:x
  A ->> B: wrap: y
```

入力
([whitespace-between-tokens/keyword-case-kept-input.mmd](../tests/fixtures/sequence/whitespace-between-tokens/keyword-case-kept-input.mmd)):

```mmd
sequenceDiagram
PARTICIPANT A
Note LEFT OF A: x
participant B AS Bob
LOOP x
A->>B: y
END
```

出力
([whitespace-between-tokens/keyword-case-kept-output.mmd](../tests/fixtures/sequence/whitespace-between-tokens/keyword-case-kept-output.mmd)):

```mmd
sequenceDiagram
  PARTICIPANT A
  Note LEFT OF A: x
  participant B AS Bob
  LOOP x
    A ->> B: y
  END
```

値の中の空白は値の一部なので、残します。
メッセージ、ノート、ブロック、`box` のテキスト、`as` の後の説明、
`links` と `properties` の JSON がそうです。
[fixture: whitespace-between-tokens/values-kept]
[fixture: whitespace-between-tokens/values-of-other-statements-kept]
`box` のテキストは全体を残します。
最初の語が色でないとき、mermaid.js はテキスト全体を box の名前にするからです。
[fixture: whitespace-between-tokens/values-kept]
[fixture: whitespace-between-tokens/box-text-kept]
参加者のデータブロック `@{ ... }` は id に接します。
mermaid.js は、間に空白があっても、ないときと同じ図を読むので、
空白は取り除きます。
NBSP、全角空白、BOM も同じです。
[test: byte order mark between the id of a participant and its data block]
[test: no-break space between the id of a participant and its data block]
[test: ideographic space between the id of a participant and its data block]
データブロックが 1 行でも複数行でも、後ろに `as` が続いても同じです。
[fixture: whitespace-between-tokens/data-block-space-before-removed]
[fixture: whitespace-between-tokens/data-block-space-before-removed-alias]
[fixture: whitespace-between-tokens/data-block-multi-line-space-before-removed]
[fixture: whitespace-between-tokens/data-block-space-before-removed-between-statements]
id と `@{` の間に directive があるときは、
[ディレクティブ](#ディレクティブ)と同じく、
その前後の空白を書かれたまま残します。
U+2028 か U+2029 があるときも同じです。
[fixture: whitespace-between-tokens/data-block-space-before-kept-after-directive]
内容は、[複数行の値](#複数行の値)で対象となる余白と、
1 行のブロックの両端の半角空白とタブを除いて保ちます。
両端は[データブロック](./flowchart.ja.md#データブロック)と同じく、
空白 1 つずつにします。
`participant A@{"type":"queue"}` は `participant A@{ "type":"queue" }`
になります。 [fixture: whitespace-between-tokens/data-block-padded]
その規則が書かれたままにする場合は、このブロックも書かれたままにします。
[fixture: whitespace-between-tokens/data-block-space-only-kept]
[fixture: whitespace-between-tokens/data-block-directive-kept]
[fixture: whitespace-between-tokens/data-block-kept-line-kept]
[test: data blocks: sequence one line with U+2028 inside]
[test: data blocks: sequence one line with U+2029 inside]
[test: data blocks: sequence one line with no-break spaces at the ends]
[fixture: whitespace-between-tokens/data-block-padded-zero-width]
[fixture: whitespace-between-tokens/data-block-surrounding-trivia]
[fixture: whitespace-between-tokens/data-block-and-ignored-line-kept]
[fixture: whitespace-between-tokens/actor-data-block-kept]
行に単独の `)` のように、mermaid.js が何も読まない行は残し、
周りの文と同じ段に置きます。
[fixture: whitespace-between-tokens/data-block-and-ignored-line-kept]
[corpus fixture: sequence/lex-invalid-line-parenthesis]
[fixture: whitespace-between-tokens/ignored-line-in-block-kept]

入力
([whitespace-between-tokens/values-kept-input.mmd](../tests/fixtures/sequence/whitespace-between-tokens/values-kept-input.mmd)):

```mmd
sequenceDiagram
A->>B: x   y
box Group   1
participant C
end
links A: {"a":  "b"}
loop   every  minute
A->>B: z
end
```

出力
([whitespace-between-tokens/values-kept-output.mmd](../tests/fixtures/sequence/whitespace-between-tokens/values-kept-output.mmd)):

```mmd
sequenceDiagram
  A ->> B: x   y
  box Group   1
    participant C
  end
  links A: {"a":  "b"}
  loop every  minute
    A ->> B: z
  end
```

入力
([whitespace-between-tokens/data-block-and-ignored-line-kept-input.mmd](../tests/fixtures/sequence/whitespace-between-tokens/data-block-and-ignored-line-kept-input.mmd)):

```mmd
sequenceDiagram
participant A@{ "type":   "queue" }
A->>B: x
)
```

出力
([whitespace-between-tokens/data-block-and-ignored-line-kept-output.mmd](../tests/fixtures/sequence/whitespace-between-tokens/data-block-and-ignored-line-kept-output.mmd)):

```mmd
sequenceDiagram
  participant A@{ "type":   "queue" }
  A ->> B: x
  )
```

### 矢印の前後の空白

メッセージの矢印の前後には、flowchart の辺と同じく、空白を 1 つずつ置きます。
`Alice->>Bob: hi` は `Alice ->> Bob: hi` になります。
[fixture: arrow-spacing/spaced]
矢印の後の `+`、`-`、`()` は宛先に接し、矢印の前の `()` は送り元に接します。
`A ->> + B` は `A ->> +B` に、`A () ->> () B` は `A() ->> ()B` になります。
[fixture: arrow-spacing/plus-and-minus-touching]
[fixture: arrow-spacing/parentheses-touching]
空白があってもなくても、mermaid.js は同じメッセージとして読みます。
例外は、矢印として読まれる始まりの宛先の前の `-` だけです（下記）。
整形は `A->>+B` をすでに `A ->> +B` にしています。
mermaid.js の文書で `+` か `-` のあるメッセージ 12 件のうち、
10 件は記号が宛先に接しています（`->>+John`、`-->>-Alice`）。
そのうち 6 件は、
[有効化の例](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L413-L424)
にあります。
残る 4 件は、
[入れ子の例](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L664-L669)
にあります。
残る 2 件は記号が矢印に接していて（`->>+ John`）、
これも記号が宛先に接する形に整形します。
その 2 件は
[ここ](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L671-L672)
にあります。
`()` のあるメッセージ 3 件は、`()` が id に接しています。
その 3 件は
[中央接続の例](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L392-L394)
にあります。
空白を削るのは、隙間が空白だけでできているときに限ります。
隙間にディレクティブがあれば、その両側に空白があるかどうかは変えず、
空白の連なりは空白 1 つにします（[ディレクティブ](#ディレクティブ)を参照）。
`A%%{init: {}}%%->>B: v` は矢印の前に空白を置かず、
`A ->> +%%{init: {}}%% B: v` はディレクティブの後の空白を残します。
[fixture: arrow-spacing/directive-beside-arrow-kept]
[fixture: arrow-spacing/touching-beside-directive-kept]
隙間の中の改行は[複数行の文](#複数行の文)と同じく 1 行に結び、
空白も改行と一緒になくなります。
コメント行があるときは行を保ちます。
[fixture: arrow-spacing/touching-over-line-breaks-joined]
[fixture: arrow-spacing/touching-with-comment-line-kept]
1 行の隙間の中の U+2028 と U+2029 は、隣の空白とともにそのまま残します。
[test: U+2028 between a `+` and an id] [test: U+2029 between a `-` and an id]
[test: U+2028 between an id and `()`] [test: U+2029 between `()` and an id]
[test: U+2029 between an id of a note and the `,`]
[test: U+2028 between the `,` of a note and an id]
`;` や空行で区切られた文も、同じように整形します。
[fixture: arrow-spacing/touching-between-semicolons]
[fixture: arrow-spacing/touching-after-blank-lines]
mermaid.js の line rule が `;` を無視する行は、
[1 行に 1 文](#1-行に-1-文)に従います。
`A ->> + B: style:#x;` は `A ->> +B: style:#x;` になり、
`A () ->> () B: style:#x;;` は書かれたままです。
[fixture: arrow-spacing/touching-with-ignored-semicolon]
矢印は書かれたまま印字します。 [fixture: arrow-spacing/arrows-kept]

`-` は、その後ろの宛先と合わせると矢印として読まれる場合、空白を残します。
`-x`、`-X`（字句解析は大文字小文字を区別しません）、`-|\`、`-|/` は矢印なので、
`A ->> - x: b` は空白を残し、`A ->> -x: b` は拒否されます。
対象になるのは、`x`、`X`、`Xavier`、`|\y` のような宛先です。
`+` と `()` は矢印の始まりにならず、そのように始まらない宛先は `-` に接します。
[fixture: arrow-spacing/minus-before-arrow-like-target-spaced]
[corpus fixture: sequence/lex-minus-space-destination-x]

入力
([arrow-spacing/spaced-input.mmd](../tests/fixtures/sequence/arrow-spacing/spaced-input.mmd)):

```mmd
sequenceDiagram
Alice->>Bob: hi
Bob-->>+Alice: x
Alice-xBob: y
Alice()->>Bob: z
Alice->>()Bob: w
Alice Smith->>Bob: v
Bob  -)   Alice: u
```

出力
([arrow-spacing/spaced-output.mmd](../tests/fixtures/sequence/arrow-spacing/spaced-output.mmd)):

```mmd
sequenceDiagram
  Alice ->> Bob: hi
  Bob -->> +Alice: x
  Alice -x Bob: y
  Alice() ->> Bob: z
  Alice ->> ()Bob: w
  Alice Smith ->> Bob: v
  Bob -) Alice: u
```

送り元が、後に空白が続くと別の単位として読まれる id のメッセージは、
矢印の両側を空白なしで接したままにします。
ただし id の後に `()` が続くときは別で、
`1() ->> B` と `title() ->> B` には空白を置きます。
`()` が id を終わらせるためです。
[fixture: arrow-spacing/central-connection-after-number-or-title]
字句解析の規則のうち、
読むものの後に空白を要するものが 2 つあります（仕様の
[文の文脈](../../spec/docs/diagrams/sequence.ja.md#文の文脈)）。
1 つは数で、1 つ以上の数字の後に `.` と 1〜2 桁の数字が続いてもよいもの、
または `.` と 1〜2 桁の数字で、後に空白か `%%` が続く必要があります。
もう 1 つは、大文字小文字によらない `title` で、後に空白 1 文字が続きます。
そのため、`1 ->> 2: x` は拒否され、`title ->> B: x` はタイトルですが、
`1->>2: x` と `title->>B: x` はメッセージです。
`1a`、`1.234`、`titles` のような id には、ほかと同じく空白を置きます。
[fixture: arrow-spacing/touching-before-read-otherwise-kept]
[corpus fixture: sequence/lex-number-as-id]
[corpus fixture: sequence/lex-number-before-space]
[fixture: arrow-spacing/number-and-title-forms-kept]
[fixture: arrow-spacing/near-misses-spaced]

入力
([arrow-spacing/touching-before-read-otherwise-kept-input.mmd](../tests/fixtures/sequence/arrow-spacing/touching-before-read-otherwise-kept-input.mmd)):

```mmd
sequenceDiagram
1->>2: x
2.5-->>1: y
title->>B: z
TITLE->>+B: w
1a->>B: v
```

出力
([arrow-spacing/touching-before-read-otherwise-kept-output.mmd](../tests/fixtures/sequence/arrow-spacing/touching-before-read-otherwise-kept-output.mmd)):

```mmd
sequenceDiagram
  1->>2: x
  2.5-->>1: y
  title->>B: z
  TITLE->>+B: w
  1a ->> B: v
```

### コロン

メッセージ、ノート、`links`・`link`・`properties`・`details` の文の、
テキストの前の `:` と、`accTitle` と `accDescr` の後の `:` は、前のものに接し、
後に空白を 1 つ置きます。
mermaid.js の文書の sequence 図の書き方と同じです。
ディレクティブの隣では、
書かれた空白を残します（[ディレクティブ](#ディレクティブ)を参照）。
[fixture: colons/spaced] [fixture: colons/other-statements-spaced]
[fixture: colons/directive-around-colon-kept]
mermaid.js はテキストを両端の空白を除いて読みます。
テキストが空のときは、`:` の後に何も置きません。 [fixture: colons/spaced]
[fixture: colons/empty-text]
`accTitle` の `:` の後の改行は、mermaid.js にとって空白なので、
次の行がそのテキストになります。
テキストのない `accTitle:` は、ほかの文の前には書けません。
[fixture: colons/acc-title-colon-line-break]

入力
([colons/spaced-input.mmd](../tests/fixtures/sequence/colons/spaced-input.mmd)):

```mmd
sequenceDiagram
A->>B:x
A->>B : y
A->>B:
note over A:n
links A:{"a": "b"}
accTitle:t
A->>B::nowrap:z
```

出力
([colons/spaced-output.mmd](../tests/fixtures/sequence/colons/spaced-output.mmd)):

```mmd
sequenceDiagram
  A ->> B: x
  A ->> B: y
  A ->> B:
  note over A: n
  links A: {"a": "b"}
  accTitle: t
  A ->> B: :nowrap:z
```

### タイトル

`title` と `title:` の後には空白を 1 つ置き、行の残りは書かれたまま残します。
キーワードの後のディレクティブは、間に空白が書かれているかどうかを残します。
`title %%{init: {}}%% T` はディレクティブの前に空白を 1 つ置き、
`title%%{init: {}}%% U` と `title:%%{init: {}}%% V` は接したまま残します。
[fixture: title/directive-after-keyword-kept]
mermaid.js はキーワードの後の空白 1 文字を読み、それは改行でもよく、
その後のすべてを、先頭と末尾の空白も含めてタイトルに入れます。
そのため、`title`、改行、`A->>B: x` は `title A->>B: x` と印字し、
次の行がタイトルになることが見えます。
mermaid.js はそのように読みます。 [fixture: title/separator]
[corpus fixture: sequence/lex-title-line-break]
[corpus fixture: sequence/db-title-next-line-indented]
[fixture: title/tab-and-colon-line-break] [fixture: title/line-break-indented]
タイトルの末尾の空白は残します。 [fixture: title/trailing-whitespace-kept]
[fixture: title/semicolon-after-whitespace-dropped]
空白が行末にあるので、例は、`\n` を改行とする文字列で書きます。
`"sequenceDiagram\ntitle Kept   \nA->>B: x\n"` は
`"sequenceDiagram\n  title Kept   \n  A ->> B: x\n"` と印字し、
`Kept` の後の 3 つの空白は残ります（fixture `trailing-whitespace-kept` は
[フォルダー](../tests/fixtures/sequence/title) にあります）。

入力
([title/separator-input.mmd](../tests/fixtures/sequence/title/separator-input.mmd)):

```mmd
sequenceDiagram
title
A->>B: x
title  Two spaces
title:	Tab
```

出力
([title/separator-output.mmd](../tests/fixtures/sequence/title/separator-output.mmd)):

```mmd
sequenceDiagram
  title A->>B: x
  title  Two spaces
  title: Tab
```

キーワードと本文の間にコメント行があるタイトルは、本文の字下げを含め、
全体を原文のまま残します。
その空白も Db のタイトルの一部だからです（[複数行の文](#複数行の文)を参照）。
コメント行は mermaid.js がテキストを読む前に取り除かれるので、
その次の行がタイトルです。
空白 1 つの後に印字すると、コメントがキーワードの行に乗り、
次の行が文として読まれてしまいます。 [fixture: title/comment-line-kept]
[fixture: title/colon-comment-line-kept]

入力
([title/comment-line-kept-input.mmd](../tests/fixtures/sequence/title/comment-line-kept-input.mmd)):

```mmd
sequenceDiagram
title
%% a comment line
  The title
A->>B: x
```

出力
([title/comment-line-kept-output.mmd](../tests/fixtures/sequence/title/comment-line-kept-output.mmd)):

```mmd
sequenceDiagram
  title
%% a comment line
  The title
  A ->> B: x
```

### コメント

行に単独のコメント（`%%`、`#`、`%`）は、周りの文と同じ段に置き、
本文は書かれたまま残します。 [fixture: comments/kept]
[corpus fixture: sequence/lex-single-percent-comment-line]
[fixture: comments/percent-line-kept] [fixture: comments/block-edges-kept]
[fixture: comments/text-whitespace-kept]
文の後のコメントはその行に残し、印の前に空白が書かれているかどうかを保ちます。
mermaid.js は `autonumber 5%% c` を数 5 なしで読み、
`%%` の前に空白を入れると数を読むからです。 [fixture: comments/kept]
[corpus fixture: sequence/lex-percent-comment-takes-number]
[fixture: comments/mark-whitespace-kept]
[fixture: comments/after-last-statement-without-line-break]
[fixture: comments/block-end-comment-without-line-break]

入力
([comments/kept-input.mmd](../tests/fixtures/sequence/comments/kept-input.mmd)):

```mmd
sequenceDiagram
%% a comment line
# a hash comment
A->>B: x # after a text
autonumber 5%% touching
loop x
    %% inside
A->>B: y
end
```

出力
([comments/kept-output.mmd](../tests/fixtures/sequence/comments/kept-output.mmd)):

```mmd
sequenceDiagram
  %% a comment line
  # a hash comment
  A ->> B: x # after a text
  autonumber 5%% touching
  loop x
    %% inside
    A ->> B: y
  end
```

コメントの直後に同じ行で置かれた `;` は残します。
それは mermaid.js の行の規則が無視する行の最後の `;` で、
コメントはその手前で終わります。
[fixture: comments/semicolon-after-comment-kept]
[corpus fixture: sequence/tokens-comment-then-ignored-semicolon]
[corpus fixture: sequence/tokens-loop-comment-then-ignored-semicolon]
[fixture: comments/semicolon-after-percent-comment-kept]
その `;` の後に空白が書かれていると、`;` はコメントの中にあり、
コメントごと印字されます。 [fixture: comments/semicolon-inside-comment-kept]
片方で落とし、片方で残すと、2 回目の整形が 1 回目と違う結果になります。

入力
([comments/semicolon-after-comment-kept-input.mmd](../tests/fixtures/sequence/comments/semicolon-after-comment-kept-input.mmd)):

```mmd
sequenceDiagram
A->>B: x #style:#x;
loop style:#x;
A->>B: y
end
```

出力
([comments/semicolon-after-comment-kept-output.mmd](../tests/fixtures/sequence/comments/semicolon-after-comment-kept-output.mmd)):

```mmd
sequenceDiagram
  A ->> B: x #style:#x;
  loop style:#x;
    A ->> B: y
  end
```

### 行区切り

U+2028 と U+2029 は空白ですが、
mermaid.js の読み方のいくつかがそれに左右されるため、
関係する所では書かれたまま残します。
文字が見えないので、例は、`\u2028` を U+2028、
`\n` を改行とする文字列で書きます。
`"sequenceDiagram\nbox red\u2028\nparticipant A\nend\n"` は
`"sequenceDiagram\n  box red\u2028\n    participant A\n  end\n"` と印字し、
文字は `box` のテキストの終わりに残ります。
テストも、文字をエスケープで、
書いています（[tests/line-separators.test.ts](../tests/line-separators.test.ts)
を参照）。

- `box` のテキストの末尾で、その前に空白があっても、そこまで。
  テキストにこの文字がある box は、塗りが `transparent` で名前がなくなります。
  なければ `box aqua` の塗りは `aqua` です。
  最後の文字より後の空白は落とします。
  `box` 以外のブロックの見出しは、mermaid.js がテキストの両端を取り除くので、
  文字は、テキストの末尾の空白と一緒に落とします（`loop x`、U+2028、
  ` ;` など）。 [test: U+2028 at the end of the text of a box]
  [test: whitespace around U+2028 at the end of the text of a box]
  [test: U+2029 at the end of the text of a box]
  [test: whitespace around U+2029 at the end of the text of a box]
- コメントと、同じ行でその後ろに続くコメント行の間。
  文やブロックの見出しの終わりと、そのようなコメント行の間も同じです。
  図のコメントは、そのコメント行を越えて次の行まで続くため、
  文字の代わりに改行を置くと、その後の文が文として読まれます。
  [corpus fixture: sequence/lex-hash-comment-across-comment-line]
  mermaid.js はコメント行を取り除くので、その後の行は前の行の続きになります。
  `A->>B:   x`、U+2028、`%% c`、`C->>D: y` は 1 つの行で、
  メッセージのテキストは次の行まで続きます。
  文や見出しとコメント行とその後のテキストは、字下げなしで、
  間の空白も整形せずに、書かれたまま印字します。
  木はコメントを並べますが、printer は 1 つの行として読みます。
  [U+2028 か U+2029 の後のコメント行](./compatibility.ja.md#u2028-か-u2029-の後のコメント行)
  を参照してください。 [test: a `#` comment after U+2028, which joins no lines]
  [test: a `%%` comment line after U+2028, which joins the next line]
  [test: a `%%` comment line after U+2028 at the end of a block header]
  [test: a `%%` comment line after U+2028 at the end of a participant]
  [test: U+2029 after a comment that a comment line follows]
  [test: U+2028 after a `%%` comment that a comment line follows]
  [test: U+2029 after a `%` comment that a comment line follows]
  [test: a `#` comment and a comment line after U+2028 inside a message text]
- 閉じていないディレクティブの直後。
  そのようなディレクティブのテキストはこの文字の手前で止まり、
  文字はディレクティブにとって空白ではありません。
  文字を空白や改行で印字すると、
  ディレクティブが残りのテキストに届いてしまいます。
  これはすべての図種で同じです。
  [test: U+2028 after a directive that is not closed]
  [test: U+2029 after a directive that is not closed]
  [test: a `;` after U+2029 after a directive that is not closed]
  [test: a standalone open directive before U+2028 and a semicolon]
  [test: a standalone open directive before U+2029 and a semicolon]
- `title` の後の 1 つの空白文字としての U+2028 か U+2029。
  `title`、U+2028、` ;` は、`;` ごと書かれたまま残します。
  [test: U+2028 as the whitespace character after `title`, with a `;` after it]
  [test: U+2029 as the whitespace character after `title`]
- ブロックの `end` の後（残しません）。
  `end`、U+2028、改行は `end` と印字します。
  mermaid.js はそこでこの文字を空白として読むからです。
  [test: U+2028 after the `end` of a block of a sequence diagram]
  [test: U+2029 and whitespace around it after the last `end` of a sequence diagram]
- 文の 2 つの部分の間（すべての図種）。
  間の空白に U+2028 か U+2029 があるときは、書かれたまま残します。
  この文字は、
  mermaid.js のすべての規則で空白として読まれるわけではないからです（`class A`、
  U+2028、` direction LR` は 1 つの名前で、`class A`、改行、
  ` direction LR` は文と方向になります）。
  [test: U+2028 between an id and an arrow]
  [test: U+2029 between an arrow and an id]
  [test: U+2028 between an id and `as`]
- 行の規則が無視する `;` と、その後に U+2028 か U+2029 がある行。
  行の規則は、文字の手前までを行として読むので、その行を書かれたまま残します。
  ダイアグラムコメントの中の `;` はコメントの一部で、
  コメントを書かれたまま残し、行のほかの部分は整形します。
  文字の後の改行に続く次の行の `;` も、書かれたまま残します。
  `participant Z@{ "style": "x:#y" };`、U+2028、改行、`;`、
  続く文は mermaid.js が受理し、
  続く文があって 2 つ目の `;` がない同じテキストは拒否されます。
  [test: a `;` after an ignored `;` and U+2029, which the line rule reads as the end of its line]
  [test: a `;` on the next line after an ignored `;` and U+2028, which the line rule reads as the end of its line]
  [test: statements after an ignored `;`, with a U+2029 later on the line]
- printer が残す U+2028 か U+2029 の後の `;`。
  `box`、タイトル、subgraph の名前のテキストの終わりにあるものがその例です。
  mermaid.js は、U+2028 か U+2029 の直後に始まるコメント行を、
  その前の改行ごと取り除くので、間にある `;` が、
  改行とその後のコメント行が次の行をつなぐのを防ぎます。
  `box red`、U+2028、`;`、行 `%% c` では、箱のテキストは `;` で終わります。
  [corpus fixture: sequence/line-end-semicolons-2636cb4a]
  [corpus fixture: sequence/kept-semicolon-after-separator-05ce7bd7]
  [test: a `;` after U+2028 at the end of the text of a box]
  [test: a `;` after U+2028 at the end of a title]

`;` を落とすと、行の終わりか、行の規則が無視する `;` が変わる行は、
書かれたまま印字します。
閉じていないディレクティブの後の `;`、別の `;` に接する無視される `;`、
U+2028 か U+2029 の前の無視される `;` がある行です（詳しくは、
[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)を参照）。
[corpus fixture: sequence/ignored-semicolon-after-directive-06349fee]
[corpus fixture: sequence/ignored-semicolon-then-separator-line-15c6520f]
[fixture: statements-one-per-line/unclosed-directive-semicolon-kept]
[fixture: statements-one-per-line/ignored-semicolon-next-to-semicolon-kept]

### ディレクティブ

flowchart と同じです。
行に単独のディレクティブは周りの文と同じ段に置き、同じ印字行の中では、
両側に空白が書かれているかどうかを保ちます。
書かれていればそこに空白 1 つを置き、トークンに接していれば接したまま残します。
[fixture: directives/kept] [fixture: directives/section-edges-kept]
[fixture: directives/whitespace-on-each-side-kept]
[fixture: directives/touching-kept] [fixture: directives/block-lines-kept]

元は同じ行にあった単位を別の行へ分けるときは、
間の directive を次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。

[fixture: sequence/directives/split-directive-gap]

入力
([directives/kept-input.mmd](../tests/fixtures/sequence/directives/kept-input.mmd)):

```mmd
sequenceDiagram
%%{init: {}}%%
loop x
%%{init: {}}%%
A->>B: y %%{init: {}}%%
end
```

出力
([directives/kept-output.mmd](../tests/fixtures/sequence/directives/kept-output.mmd)):

```mmd
sequenceDiagram
  %%{init: {}}%%
  loop x
    %%{init: {}}%%
    A ->> B: y %%{init: {}}%%
  end
```

### フロントマターの YAML

flowchart と同じです。
`---` の行の間の YAML は、
安全なときに Prettier の YAML 整形にかけます（詳しくは、
[フロントマターの YAML](./flowchart.ja.md#フロントマターの-yaml)を参照）。
[fixture: frontmatter-yaml/formatted] [fixture: frontmatter-yaml/malformed-kept]
[fixture: frontmatter-yaml/indented-delimiters-kept]
[fixture: frontmatter-yaml/delimiter-line-kept]
[fixture: frontmatter-yaml/closing-delimiter-whitespace-kept]
[fixture: frontmatter-yaml/html-tag-kept]

入力
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/sequence/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
---
sequenceDiagram
A->>B: x
```

出力
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/sequence/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
---
sequenceDiagram
  A ->> B: x
```

### 複数行の文

複数行に書かれた文は、1 行にまとめて印字します。
改行だけでは文が終わるので、文の中の改行は空白の後に来ます。
字句解析は、
その空白と後に続く改行をまとめて空白として読みます（仕様の
[文の文脈](../../spec/docs/diagrams/sequence.ja.md#文の文脈) の規則 2）。
そのため、`Alice ->>`、空白、改行、`Bob: hi` は、
`Alice ->> Bob: hi` と印字します。 [fixture: multi-line-statements/joined]
[fixture: multi-line-statements/more-lines-joined]

コメントかディレクティブを含む文は改行を残し、
構造の続きの行と間の注釈を 1 段深く置きます。
各隙間の最初の改行の前の空白は保ちます。
その空白によって、mermaid.js が後の行も同じ文の一部として読むためです。
値の中の空白は変えません。 [fixture: multi-line-statements/comment-inside-kept]
[fixture: multi-line-statements/autonumber-comment-continuation]
[fixture: multi-line-statements/autonumber-directive-continuation]
キーワードと本文の間に注釈があるタイトルは、本文の字下げも値に含むので、
全体を原文のまま残します。
コメントで結合される領域とセミコロン行の保護対象も、文全体を原文のまま残します。
[fixture: multi-line-statements/semicolon-inside-kept]
[fixture: multi-line-statements/start-moves-to-own-line]
説明ブロックは[複数行の値](#複数行の値)に従い、本文の字下げをそろえます。

入力の行末に空白があるので、例は、`\n` を改行とする文字列で書きます。
`"sequenceDiagram\nAlice ->> \nBob: hi\nautonumber \n  10 5\n"` は、
`"sequenceDiagram\n  Alice ->> Bob: hi\n  autonumber 10 5\n"`
と印字します（fixture は、
[フォルダー](../tests/fixtures/sequence/multi-line-statements)にあります）。

### 複数行の値

内側が空白だけなら、タブ、改行、Unicode の空白を含めて `{}` と印字します。
囲む空白を要する本文がないためです。
すでに空の内側は空のままです。
キーワードと開始括弧の間には空白を 1 つ置きます。
`accDescr{  }` は `accDescr {}` にします。
[fixture: multi-line-values/empty-whitespace-interiors]
[test: sequence Unicode and tab interiors]
コメントや directive があるブロックの内容と改行は保ちます。
1 行のブロックの文字は、両側に空白を 1 つずつ置きます。
これは、
[flowchart のアクセシビリティの行](./flowchart.ja.md#アクセシビリティの行)
と同じ形です。
`accDescr {a b}`、`accDescr {  a b  }`、`accDescr {  a b}`、
`accDescr {a b  }` は、どれも `accDescr { a b }` になります。
mermaid.js は文字を trim するので、両端の空白に意味はありません。
文字の中にディレクティブがあるブロックは、書かれたままにします。
`;` を残す行にあるブロックは、空白を足しませんが、
端の空白の連なりは空白 1
つにします（[セミコロン](./flowchart.ja.md#セミコロン)を参照）。
[fixture: multi-line-values/block-text-on-one-line-padded]

`accDescr { ... }` の本文行は文より 1 段深くそろえ、
独立した `}` は文と同じ段に置きます。
[flowchart のトップレベルの説明](./flowchart.ja.md#複数行の値)と同じく、
Mermaid が説明からこの字下げを除くためです。
[fixture: multi-line-values/description-and-data-indented]
[fixture: multi-line-values/accdescr-block-closing-brace-after-text-kept]
[fixture: multi-line-values/accdescr-block-blank-and-comment-lines-kept]
[fixture: multi-line-values/data-block-in-block-indented]
テキストがなく、コメント行だけを持つブロックは、値を持ちません。
そのコメント行は、文の中のコメント行と同じく `accDescr` より 1 段深く置き、
`}` は `accDescr` と同じ段に置きます。
[fixture: multi-line-values/accdescr-block-comment-only]
[fixture: multi-line-values/accdescr-block-without-text-kept]
テキストの終わりで閉じる説明ブロック（`accDescr {` の後に `}` がないもの）は、
mermaid.js が受理します（詳しくは、
[文の文脈](../../spec/docs/diagrams/sequence.ja.md#文の文脈)を参照）。
その本文行は、閉じたブロックと同じく文より 1 段深く置き、`}` は足しません。
[fixture: multi-line-values/accdescr-block-unclosed-indented]

participant と actor のデータブロックには、
文字のある本文行がちょうど 1 行の場合だけ、
[データブロック](./flowchart.ja.md#データブロック)を適用します。
その行を文の 1 段内側に動かし、単独行の `}` は文の段に揃えます。
本文の後の閉じ括弧はその行と一緒に動かします。
トップレベルと `loop` 内で適用し、`useTabs` でも本文は半角空白とし、
単独行の閉じ括弧は文の字下げを使います。
[fixture: multi-line-values/data-zero-and-shallow]
[fixture: multi-line-values/data-deep-inline-closer]
[fixture: multi-line-values/data-block-in-block-indented]
[fixture: multi-line-values/data-tab-statement-space-body]
[fixture: multi-line-values/data-closing-deeper-kept]
[fixture: multi-line-values/data-closing-equal-depth]

Mermaid はデータブロック全体を trim し、最初の行の余白だけを除き、
後の行は 0 桁から数えます。
キー 2 つを 0 桁に置く形は受理されますが、
字下げすると YAML が拒否される場合があります。
そのため、文字のある本文行が複数あるブロックは桁を保ちます。
共有条件により、開きの行から本文が始まる形、内部の directive、行全体を保つ行、
`tabWidth: 0` もそのまま残します。
最初の行との相対的な余白や directive のテキストを変えず、
行全体の保持を守るためです。
[fixture: multi-line-values/data-multiple-lines-kept]
[fixture: multi-line-values/data-inline-and-directive-kept]
[fixture: multi-line-values/data-kept-body-line]
[fixture: multi-line-values/data-zero-width-kept]

前後のコメント、directive、空行、空の説明ブロックはそれぞれの規則に従います。
CRLF と CR は `endOfLine` に従い、値の Unicode separator は文字として保ちます。
[fixture: multi-line-values/data-surrounding-trivia]
[test: data blocks: sequence U+2028] [test: data blocks: sequence CR]

入力
([multi-line-values/description-and-data-indented-input.mmd](../tests/fixtures/sequence/multi-line-values/description-and-data-indented-input.mmd)):

```mmd
sequenceDiagram
loop x
accDescr {
  one
    two
      }
participant A@{
  "type": "queue"
}
end
```

出力
([multi-line-values/description-and-data-indented-output.mmd](../tests/fixtures/sequence/multi-line-values/description-and-data-indented-output.mmd)):

```mmd
sequenceDiagram
  loop x
    accDescr {
      one
      two
    }
    participant A@{
      "type": "queue"
    }
  end
```

入力
([multi-line-values/accdescr-block-comment-only-input.mmd](../tests/fixtures/sequence/multi-line-values/accdescr-block-comment-only-input.mmd)):

```mmd
sequenceDiagram
accDescr {
%% only a comment
      }
A->>B: x
```

出力
([multi-line-values/accdescr-block-comment-only-output.mmd](../tests/fixtures/sequence/multi-line-values/accdescr-block-comment-only-output.mmd)):

```mmd
sequenceDiagram
  accDescr {
    %% only a comment
  }
  A ->> B: x
```

## 書かれたまま残すもの

[複数行の値](#複数行の値)の説明本文と対象データブロックの字下げを除き、
次のテキストは書かれたまま残します。
変えると図が変わるか、入力が拒否されるからです。

- 値のテキストと、その中の空白。
  `box` のテキストは、それを終える最後の U+2028 か U+2029 までの全体。
- `title` または `title:` の直後にある区切り文字 1 文字を除き、
  タイトルに含まれる空白。
- 参加者のデータブロックの内容。
- 数の形か `title` の綴りの送り元に、矢印が接していること。
- キーワードと本文の間に注釈があるタイトル。
- セミコロン行かコメントで結合される領域の保護対象の文。
- 注釈を含む隙間の最初の改行の前の空白。
- 文の後のコメントの印の前に、空白が書かれているかどうかと、
  コメントとその後のコメント行の間の U+2028 か U+2029。
- 矢印。

次のテキストは、どちらの形でも Db が同じなので、選択として書かれたまま残します。
キーワードの大文字小文字で、作者のものだからです。
上に挙げたコメントの印の前の空白は、
`autonumber 5` のような文の後では mermaid.js の読みを決めます。
ほかの文の後では Db が同じですが、規則を 1 つにするために書かれたまま残します。
