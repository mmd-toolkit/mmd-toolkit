# sequence 図の整形規則

英語版: [sequence.md](./sequence.md)

prettier-plugin-mmd が sequence 図をどう整形するかを説明します。
以下の各規則は、mermaid.js が図から読むものを保ちます。
変えると読み方が変わる箇所は書かれたまま残し、規則にその箇所を書きます。
flowchart と同じ規則はそう書き、理由は [flowchart.ja.md](./flowchart.ja.md) にあります。

各規則には、flowchart と同じく、
[`tests/fixtures/sequence/`](../tests/fixtures/sequence) の下に、
規則の見出しを名前にした例のフォルダーがあります。
各例は入力と整形した出力のファイルの組で、
テストは、プラグインがその出力を印字することと、
mermaid.js が入力と出力から同じ図を読むことの両方を確かめます。
この文書の例はそれらのファイルの写しで、テストが同じであることを確かめます。

## 規則

### 字下げ

ヘッダーの後の文は、ヘッダーより 1 段深く置きます。
ブロックの文と、`box` の参加者は、それを開く行より 1 段深く置きます。
ブロックは、`loop`、`alt`、`opt`、`par`、`par_over`、`critical`、
`break`、`rect` です。
`else`、`and`、`option`、`end` は、その行と同じ段に置きます。
1 段は Prettier の `useTabs` と `tabWidth` のオプションが決め、
既定は空白 2 つです。
入力に書かれた字下げは保ちません。
行頭の空白は、mermaid.js にとって何でもないからです。

入力 ([indentation/blocks-input.mmd](../tests/fixtures/sequence/indentation/blocks-input.mmd)):

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

出力 ([indentation/blocks-output.mmd](../tests/fixtures/sequence/indentation/blocks-output.mmd)):

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

入力 ([indentation/sections-input.mmd](../tests/fixtures/sequence/indentation/sections-input.mmd)):

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

出力 ([indentation/sections-output.mmd](../tests/fixtures/sequence/indentation/sections-output.mmd)):

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
ヘッダーの行や、`end` の後に同じ行で書かれた文は、それぞれの行に移します。
mermaid.js の行単位の規則が無視する `;` を含む行は、
flowchart と同じく、その行の文と `;` を残します
（[1 行に 1 文](./flowchart.ja.md#1-行に-1-文)を参照）。

入力 ([statements-one-per-line/split-input.mmd](../tests/fixtures/sequence/statements-one-per-line/split-input.mmd)):

```mmd
sequenceDiagram A->>B: x; B->>A: y
loop x
A->>B: y
end A->>B: z
```

出力 ([statements-one-per-line/split-output.mmd](../tests/fixtures/sequence/statements-one-per-line/split-output.mmd)):

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

入力 ([statements-one-per-line/empty-description-block-in-box-input.mmd](../tests/fixtures/sequence/statements-one-per-line/empty-description-block-in-box-input.mmd)):

```mmd
sequenceDiagram
box G
accDescr {} participant B
participant C
accDescr {} end
```

出力 ([statements-one-per-line/empty-description-block-in-box-output.mmd](../tests/fixtures/sequence/statements-one-per-line/empty-description-block-in-box-output.mmd)):

```mmd
sequenceDiagram
  box G
    accDescr {}
    participant B
    participant C
    accDescr {}
  end
```

### 空行

flowchart と同じです。
空行の連続は 1 つにし、ブロックの先頭と末尾の空行は取り除きます。

入力 ([blank-lines/collapsed-input.mmd](../tests/fixtures/sequence/blank-lines/collapsed-input.mmd)):

```mmd
sequenceDiagram


A->>B: x



B->>A: y
loop x

A->>B: z

end
```

出力 ([blank-lines/collapsed-output.mmd](../tests/fixtures/sequence/blank-lines/collapsed-output.mmd)):

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
flowchart と同じです。
そのため、矢印や id の隣の `+`、`-`、`()`、`note over A,B` の `,`、
`wrap:` などの折り返しの接頭辞とその本文の間は、
空白が書かれているかどうかを保ちます。
キーワードは、書かれた大文字小文字のまま残します。
例えば `PARTICIPANT A`、`Note LEFT OF A` です。
mermaid.js は大文字小文字にかかわらず読むからです。

入力 ([whitespace-between-tokens/collapsed-input.mmd](../tests/fixtures/sequence/whitespace-between-tokens/collapsed-input.mmd)):

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

出力 ([whitespace-between-tokens/collapsed-output.mmd](../tests/fixtures/sequence/whitespace-between-tokens/collapsed-output.mmd)):

```mmd
sequenceDiagram
  participant A as Alice
  autonumber 10 5
  create participant C
  A ->> C: x
  note over A ,C: n
  A ->> B: wrap:x
  A ->> B: wrap: y
```

入力 ([whitespace-between-tokens/keyword-case-kept-input.mmd](../tests/fixtures/sequence/whitespace-between-tokens/keyword-case-kept-input.mmd)):

```mmd
sequenceDiagram
PARTICIPANT A
Note LEFT OF A: x
participant B AS Bob
LOOP x
A->>B: y
END
```

出力 ([whitespace-between-tokens/keyword-case-kept-output.mmd](../tests/fixtures/sequence/whitespace-between-tokens/keyword-case-kept-output.mmd)):

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
`box` のテキストは全体を残します。
最初の語が色でないとき、mermaid.js はテキスト全体を box の名前にするからです。
参加者のデータブロック `@{ ... }` は書かれたまま残し、id に接したままにします。
`@{` の前に空白があると、入力が拒否されるからです。
行に単独の `)` のように、mermaid.js が何も読まない行は残し、
周りの文と同じ段に置きます。

入力 ([whitespace-between-tokens/values-kept-input.mmd](../tests/fixtures/sequence/whitespace-between-tokens/values-kept-input.mmd)):

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

出力 ([whitespace-between-tokens/values-kept-output.mmd](../tests/fixtures/sequence/whitespace-between-tokens/values-kept-output.mmd)):

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

入力 ([whitespace-between-tokens/data-block-and-ignored-line-kept-input.mmd](../tests/fixtures/sequence/whitespace-between-tokens/data-block-and-ignored-line-kept-input.mmd)):

```mmd
sequenceDiagram
participant A@{ "type":   "queue" }
A->>B: x
)
```

出力 ([whitespace-between-tokens/data-block-and-ignored-line-kept-output.mmd](../tests/fixtures/sequence/whitespace-between-tokens/data-block-and-ignored-line-kept-output.mmd)):

```mmd
sequenceDiagram
  participant A@{ "type":   "queue" }
  A ->> B: x
  )
```

### 矢印の前後の空白

メッセージの矢印の前後には、flowchart の辺と同じく、空白を 1 つずつ置きます。
`Alice->>Bob: hi` は `Alice ->> Bob: hi` になります。
矢印の後の `+`、`-`、`()` と、矢印の前の `()` は、
書かれたとおり id の隣に残します。
矢印は書かれたまま印字します。

入力 ([arrow-spacing/spaced-input.mmd](../tests/fixtures/sequence/arrow-spacing/spaced-input.mmd)):

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

出力 ([arrow-spacing/spaced-output.mmd](../tests/fixtures/sequence/arrow-spacing/spaced-output.mmd)):

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
字句解析の規則のうち、読むものの後に空白を要するものが 2 つあります
（仕様の[文の文脈](../../spec/docs/diagrams/sequence.ja.md#文の文脈)）。
1 つは数で、1 つ以上の数字の後に `.` と 1〜2 桁の数字が続いてもよいもの、
または `.` と 1〜2 桁の数字で、後に空白か `%%` が続く必要があります。
もう 1 つは、大文字小文字によらない `title` で、後に空白 1 文字が続きます。
そのため、`1 ->> 2: x` は拒否され、`title ->> B: x` はタイトルですが、
`1->>2: x` と `title->>B: x` はメッセージです。
`1a`、`1.234`、`titles` のような id には、ほかと同じく空白を置きます。

入力 ([arrow-spacing/touching-before-read-otherwise-kept-input.mmd](../tests/fixtures/sequence/arrow-spacing/touching-before-read-otherwise-kept-input.mmd)):

```mmd
sequenceDiagram
1->>2: x
2.5-->>1: y
title->>B: z
TITLE->>+B: w
1a->>B: v
```

出力 ([arrow-spacing/touching-before-read-otherwise-kept-output.mmd](../tests/fixtures/sequence/arrow-spacing/touching-before-read-otherwise-kept-output.mmd)):

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
テキストの前の `:` と、`accTitle` と `accDescr` の後の `:` は、
前のものに接し、後に空白を 1 つ置きます。
mermaid.js はテキストを両端の空白を除いて読みます。
テキストが空のときは、`:` の後に何も置きません。

入力 ([colons/spaced-input.mmd](../tests/fixtures/sequence/colons/spaced-input.mmd)):

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

出力 ([colons/spaced-output.mmd](../tests/fixtures/sequence/colons/spaced-output.mmd)):

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
mermaid.js はキーワードの後の空白 1 文字を読み、それは改行でもよく、
その後のすべてを、先頭と末尾の空白も含めてタイトルに入れます。
そのため、`title`、改行、`A->>B: x` は `title A->>B: x` と印字し、
次の行がタイトルになることが見えます。
mermaid.js はそのように読みます。
タイトルの末尾の空白は残します。
その例は、空白が行末にあるので、ここには載せません
（[フォルダー](../tests/fixtures/sequence/title)の `title/trailing-whitespace-kept` を参照）。

入力 ([title/separator-input.mmd](../tests/fixtures/sequence/title/separator-input.mmd)):

```mmd
sequenceDiagram
title
A->>B: x
title  Two spaces
title:	Tab
```

出力 ([title/separator-output.mmd](../tests/fixtures/sequence/title/separator-output.mmd)):

```mmd
sequenceDiagram
  title A->>B: x
  title  Two spaces
  title: Tab
```

キーワードと本文の間にコメント行があるタイトルは、
コメントを含む複数行の文と同じく、書かれたまま残します
（[複数行の文](#複数行の文)を参照）。
コメント行は mermaid.js がテキストを読む前に取り除かれるので、
その次の行がタイトルです。
空白 1 つの後に印字すると、コメントがキーワードの行に乗り、
次の行が文として読まれてしまいます。

入力 ([title/comment-line-kept-input.mmd](../tests/fixtures/sequence/title/comment-line-kept-input.mmd)):

```mmd
sequenceDiagram
title
%% a comment line
  The title
A->>B: x
```

出力 ([title/comment-line-kept-output.mmd](../tests/fixtures/sequence/title/comment-line-kept-output.mmd)):

```mmd
sequenceDiagram
  title
%% a comment line
  The title
  A ->> B: x
```

### コメント

行に単独のコメント（`%%`、`#`、`%`）は、周りの文と同じ段に置き、
本文は書かれたまま残します。
文の後のコメントはその行に残し、印の前に空白が書かれているかどうかを保ちます。
mermaid.js は `autonumber 5%% c` を数 5 なしで読み、
`%%` の前に空白を入れると数を読むからです。

入力 ([comments/kept-input.mmd](../tests/fixtures/sequence/comments/kept-input.mmd)):

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

出力 ([comments/kept-output.mmd](../tests/fixtures/sequence/comments/kept-output.mmd)):

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

### ディレクティブ

flowchart と同じです。
行に単独のディレクティブは周りの文と同じ段に置き、
文の行にあるディレクティブは、両側に書かれた空白を保ちます。

入力 ([directives/kept-input.mmd](../tests/fixtures/sequence/directives/kept-input.mmd)):

```mmd
sequenceDiagram
%%{init: {}}%%
loop x
%%{init: {}}%%
A->>B: y %%{init: {}}%%
end
```

出力 ([directives/kept-output.mmd](../tests/fixtures/sequence/directives/kept-output.mmd)):

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
`---` の行の間の YAML は、安全なときに Prettier の YAML 整形にかけます
（[フロントマターの YAML](./flowchart.ja.md#フロントマターの-yaml)を参照）。

入力 ([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/sequence/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
---
sequenceDiagram
A->>B: x
```

出力 ([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/sequence/frontmatter-yaml/formatted-output.mmd)):

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
字句解析は、その空白と後に続く改行をまとめて空白として読みます
（仕様の[文の文脈](../../spec/docs/diagrams/sequence.ja.md#文の文脈)の規則 2）。
そのため、`Alice ->>`、空白、改行、`Bob: hi` は、
`Alice ->> Bob: hi` と印字します。

コメントかディレクティブを含む複数行の文は、
始まりから終わりまで書かれたまま残します。
そうした文は 1 行にまとめられません。
また、mermaid.js がその行を 1 つの文として読むのは、
整形が書かない行末の空白があるからにすぎません。
キーワードと本文の間にコメント行があるタイトルも、そうした文です。
`accDescr { ... }` のブロックの行は、そのテキストの行です
（[複数行の値](#複数行の値)を参照）。

例は、入力の行末に空白があるので、ここには載せません
（[フォルダー](../tests/fixtures/sequence/multi-line-statements)を参照）。

### 複数行の値

flowchart と同じです。
`accDescr { ... }` のブロックの行と、
複数行に書かれたデータブロックの行は書かれたまま残し、
`accDescr` のブロックの `}` は、その文と同じ段に置きます。
テキストがなく、コメント行だけを持つブロックは、値を持ちません。
そのコメント行は、文の中のコメント行と同じく `accDescr` より 1 段深く置き、
`}` は `accDescr` と同じ段に置きます。

入力 ([multi-line-values/kept-input.mmd](../tests/fixtures/sequence/multi-line-values/kept-input.mmd)):

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

出力 ([multi-line-values/kept-output.mmd](../tests/fixtures/sequence/multi-line-values/kept-output.mmd)):

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

入力 ([multi-line-values/accdescr-block-comment-only-input.mmd](../tests/fixtures/sequence/multi-line-values/accdescr-block-comment-only-input.mmd)):

```mmd
sequenceDiagram
accDescr {
%% only a comment
      }
A->>B: x
```

出力 ([multi-line-values/accdescr-block-comment-only-output.mmd](../tests/fixtures/sequence/multi-line-values/accdescr-block-comment-only-output.mmd)):

```mmd
sequenceDiagram
  accDescr {
    %% only a comment
  }
  A ->> B: x
```

## 書かれたまま残すもの

次のテキストは常に書かれたまま残します。
変えると図が変わるか、入力が拒否されるからです。

- 値のテキストと、その中の空白。`box` のテキストは全体。
- `title` や `title:` の後の 1 文字の後の空白。
- 参加者のデータブロックと、それが id に接していること。
- 数の形か `title` の綴りの送り元に、矢印が接していること。
- コメントかディレクティブを含む複数行の文。
  キーワードと本文の間にコメント行があるタイトルもその 1 つ。
- 文の後のコメントの印の前に、空白が書かれているかどうか。
- 矢印と、キーワードの大文字小文字。
