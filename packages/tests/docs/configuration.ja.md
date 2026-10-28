# mermaid.js が設定を作る手順

英語版: [configuration.md](./configuration.md)

この文書は、固定した mermaid.js が、
フロントマターとディレクティブから設定を作る手順を述べます。
それに依る Db の値を確かめるためのものです。
フロントマターとディレクティブの構文は、
仕様の [`common.ja.md`](../../spec/docs/common.ja.md) が定めます。

## 設定（参考）

この節は参考です。
入力が受理されるかどうかや、その木がどうなるかの判定には関わりません。
この仕様の実装は、
フロントマターの本文とディレクティブの引数を書かれたとおりに保持し、
解析も検査もしません（[`embedded-data-opaque`](../../spec/docs/known-divergences/embedded-data-opaque.ja.md) を参照）。
この節は、
mermaid.js がフロントマターとディレクティブから設定をどう求めるかを述べます。
一部の図の Db がその設定を読むからです。
各図の Db を作る手順（[db-from-tree/](./db-from-tree/)）は設定を考慮し、
Db の値を検査する側は、 mermaid.js 自身の関数で設定を求めます。
設定を求める途中で mermaid.js が入力を拒否する場合は、以下でそう述べます。
この仕様は、そのような入力を受理します。

求め方は、
[`preprocessDiagram()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L58-L91)、
[`detectInit()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L98-L130) と、
[`detectDirective()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L159-L198)、
[`addDirective()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.ts#L277-L290)、
[`updateCurrentConfig()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.ts#L109-L143)、
[`sanitizeDirective()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils/sanitizeDirective.ts#L38-L98) に従います。

設定の値は JSON の値です。
null、真偽値、数、文字列、リスト、マッピングのどれかです。
フロントマターの値も同じ種類として読みます。
**入れ物**は、リストかマッピングです。
値が null、偽、ゼロ、非数、空文字列のどれかであるとき、その値は**空**です。

値の**文字列形**は次のとおりです。
文字列はそれ自身です。
真は `true` です。
数は、ECMA-262 の Number::toString が与える 10 進の形です（`1.0` は `1`、
`1e21` は `1e+21`、YAML の `.inf` は `Infinity` になります）。
リストは、要素の文字列形を `,` でつないだものです。
null の要素は空文字列になります。
マッピングは `[object Object]` です。

段階は小節の順に行います。
ある段階で mermaid.js が入力を拒否すると、その後の段階は行いません。

### フロントマターの本文の読み方

[`extractFrontMatter()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/frontmatter.ts#L24-L69) は、
本文から字下げを取り除き（[フロントマター](../../spec/docs/common.ja.md#フロントマター) を参照）、
その結果を YAML 1.2 として、 pin した mermaid.js に同梱された js-yaml
4.3.0 がその JSON スキーマ（`JSON_SCHEMA`）で読むのと同じように読みます。

- YAML の構文エラーがあると、mermaid.js は入力を `YAMLException` で拒否します。
  同じキーを 2 回持つマッピングと、YAML の文書を 2 つ以上含む本文は、
  構文エラーです。 [fixture: common/frontmatter-yaml-error] [fixture:
  common/frontmatter-duplicate-key] [fixture: common/frontmatter-two-documents]
- 本文がマッピングでない場合（例: 単なるスカラー）は、
  空のマッピングとして扱います。 [fixture: common/frontmatter-scalar]
- 引用符付きのスカラーは文字列です。
  引用符のないスカラーは、次の種類のうち、その形を持つ最初のものとして読み、
  どれでもなければ文字列として読みます。
  これらの形の英字は ASCII の英字で、
  示した大文字小文字の組み合わせだけが許されます。
  - null: 空のスカラー、`~`、`null`、`Null`、`NULL`。
  - 真偽値: `true`、`True`、`TRUE`、`false`、`False`、`FALSE`。
  - 整数: 省略可能な `+` か `-` の後に、`0b` と 1 個以上の 2 進数字、
    `0o` と 1 個以上の 8 進数字、`0x` と 1 個以上の 16 進数字、
    または 1 個以上の 10 進数字が続くもの（先頭のゼロは許され、
    8 進を意味しません）。
    値は最も近い倍精度の数です。
    `-0` はゼロで、負のゼロではありません。
    値が無限大になる形は整数ではありません。
  - 浮動小数点数: 省略可能な符号、1 個以上の 10 進数字、
    省略可能な `.` と 0 個以上の数字、省略可能な指数（`e` か `E`、
    省略可能な符号、1 個以上の数字）が続くもの。
    または、`.`、1 個以上の数字、省略可能な指数が続くもの。
    または、省略可能な符号と `.inf`、`.Inf`、`.INF` のどれか。
    または、符号のない `.nan`、`.NaN`、`.NAN` のどれか。
    最初の 2 つの種類の形で、値が無限大になるものは浮動小数点数ではありません。

その結果が**フロントマターのマッピング**です。
そのキーのうち使われるのは `title`、`config`、`displayMode` の 3 つだけです。

### フロントマターの設定

[`processFrontmatter()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L19-L31) は、
フロントマターのマッピングを次のように使います。
フロントマターがなければ、フロントマターのマッピングは空です。

- フロントマターのマッピングの `title` が空でなければ、
  その文字列形が図の**タイトル**です。
  タイトルは設定ではなく Db の値で、設定に依存する Db の値と同じく、
  木からは出ません。
  Db の値を検査する側が、mermaid.js 自身の関数で求めます。
  [`renderDiagram()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L577-L579) は、
  タイトルを図のタイトルとして Db に渡します。
  Db がそれをどう持つかは、各図の文書で述べます。
  `title: [1, 2]` はタイトル `1,2` に、`title: 1.0` は `1` に、
  `title: {a: 1}` は `[object Object]` になります。
  mermaid.js は、
  [`cleanupText()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L17) が HTML タグの中の `="..."` を書き換えた後の本文を読むので、
  `title: <b class="x">T</b>` はタイトル `<b class='x'>T</b>` になります。
  一方、`title: "<a b=\"c\">"` のタグには `="` がないので、
  タイトルは `<a b="c">` です。 [fixture: flowchart/frontmatter-title-html-attribute]
  [fixture:
  common/frontmatter-title-escaped-quotes-in-tag]
  引用符のないスカラーでは、 `0x1F` は `31`、`017` は `17`、
  `TRUE` は `true` になり、 `1e400` は文字列 `1e400` のままで、
  `~` は null なのでタイトルはありません。 [fixture: common/config-title-list]
  [fixture: common/config-title-number]
  [fixture: common/config-title-mapping] [fixture: common/config-title-hex]
  [fixture: common/config-title-leading-zero] [fixture:
  common/config-title-bool-uppercase] [fixture:
  common/config-title-float-overflow] [fixture: common/config-title-null-tilde]
- フロントマターのマッピングの `config` が空でなければ、
  それが**フロントマターの設定**です。
  そうでなければ、フロントマターの設定は空のマッピングです。
  書いたとおりに適用されます。
  たとえば、
  その中の `flowchart` のマッピングは flowchart を設定します。 [fixture: flowchart/config-inherit-dir-frontmatter]
- フロントマターのマッピングの `displayMode` が空でなければ、
  その文字列形をフロントマターの設定にコピーします。
  - フロントマターの設定が文字列、数、真のどれかなら、
    mermaid.js は入力を `TypeError` で拒否します。
    空でない `displayMode` がなければ、
    そのようなフロントマターの設定も mermaid.js は受理します。 [fixture: common/frontmatter-display-mode-primitive-config]
    [fixture:
    common/frontmatter-primitive-config]
  - フロントマターの設定がマッピングなら、まずその `gantt` の項目が、
    ないか空であれば、空のマッピングに置き換えられます。
    その後 `gantt` が文字列、数、真のどれかであれば、
    mermaid.js は入力を `TypeError` で拒否します。
    そうでなければ、
    `gantt` の `displayMode` に文字列形を入れます。 [fixture: common/config-display-mode-gantt-primitive]
  - フロントマターの設定がリストなら、何もコピーされず、
    そのリストは何ももたらしません（[テキストの設定](#テキストの設定) を参照）。
    `config: null` と `displayMode` の組は受理されます。
    null の `config` は空だからです。 [fixture: common/config-display-mode-list-config]
    [fixture:
    common/config-display-mode-null-config]

### 設定の走査

mermaid.js は、図を設定するディレクティブを、
`Directive` のトリビアを見つける走査ではなく、専用の走査で見つけます。
この走査は、フロントマターの後のソースから始めます。
行終端は `\n` に正規化し、HTML タグの中の `="..."` は、
[`cleanupText()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L17) と同じく、
フロントマターを含むソース全体で `='...'` に書き換えた状態です。
そこから、次の順に準備します。
このうち、見つかるディレクティブを変えうるのは 2 番目だけです。

1. 先頭と末尾の空白を取り除きます。
2. すべての**閉じ記号の行**を取り除きます。
   閉じ記号の行は、直後に `}%%` が続く `%%` から始まり、
   次の行終端までを含みます。
   ただし、その `%%` と行終端の間に U+2028 も U+2029 もない場合に限ります。
   閉じ記号の行は左から右へ見つけ、重なりません。
   後に行終端がない `%%}%%` や、
   次の行終端までの間に U+2028 か U+2029 がある `%%}%%` は、
   閉じ記号の行を始めません。
3. すべての `'` を `"` として読みます。
   そのため、単一引用符のキーや文字列を使った引数も、
   正しい JSON になります。 [fixture: common/directive-single-quotes]

その結果の中で、
[ディレクティブの位置](../../spec/docs/common.ja.md#ディレクティブの位置) と同じようにディレクティブを見つけます。
この走査はコメント行を見ないので、コメント行の上のディレクティブも、
他のディレクティブと同じように図を設定します。 [fixture: common/directive-in-comment]
[fixture:
common/config-directive-in-comment]
一方、閉じ記号の行の上のディレクティブは、行と一緒に取り除かれます。
`%%}%% %%{init: ...}%%` は、何も設定しないコメント行です。
ディレクティブと `%%}%%` の間に U+2028 があると、行は取り除かれず、
ディレクティブが適用されます。 [fixture: common/config-closing-marker-line]
[fixture:
common/config-closing-marker-line-u2028]

ディレクティブの**引数の値**は、引数が語であればその語の文字列で、
ディレクティブに引数がないか、自由テキストの引数が空であれば null です。
空でない自由テキストの引数は、
先頭と末尾の空白を取り除いてから JSON として解析します。
オブジェクトに同じキーが 2 回あれば、後の値が効きます。
解析は、以下の段階が見るディレクティブについてだけ行います。

### init ディレクティブ

**init ディレクティブ**は、
名前が `init` か `initialize` で終わるディレクティブです。
完全に一致するかで比べます。
`init`、`initialize`、`myinit`、`reinitialize` は init ディレクティブで、
`INIT`、`Init`、`init2` は違います。
`wrap` やその他の名前も違います。 [fixture: common/config-init-name-suffix]
[fixture:
common/config-init-name-reinitialize] [fixture:
common/config-init-name-uppercase] [fixture:
common/config-init-name-capitalized] [fixture:
common/config-init-name-digit-after] [fixture: common/directive-unknown-name]

init ディレクティブはソースの順に取ります。
そのどれかの引数が正しい JSON でなければ、走査はそのディレクティブで止まり、
init の設定はまったくありません。
それより前の init ディレクティブも適用されません。
mermaid.js は入力を受理します。 [fixture: common/directive-bad-json] [fixture:
common/config-bad-json-drops-other-inits]
閉じる `}` の前のカンマも正しい JSON ではありません。
`%%{init: {"flowchart": {"inheritDir": true},}}%%` は init の設定を与えません。 [fixture: common/config-init-trailing-comma]
正しい JSON を持つ閉じた init ディレクティブは、
`flowchart LR` と `A-->B` の前の `%%{init: {"theme": "dark"}}%%` のように、
図のテキストの読み方を何も変えません。 [fixture: common/directive-init-theme]
そうでなければ、**init の設定**は次のとおりです。

- init ディレクティブがなければ、ありません。
- init ディレクティブが 1 つなら、その引数の値です。
  ただし、それが空なら、ありません。
  値はマッピングでなくてもかまいません。
  語の引数は文字列なので、`%%{init: 5}%%` は文字列 `5` になります。
- 2 つ以上なら、マッピングです。
  各引数の値にまずキーの絞り込み（[テキストの設定](#テキストの設定) を参照）を適用し、
  その後、値をソースの順に、
  深さを限った合成（[有効な設定](#有効な設定) を参照）で空のマッピングに合成します。
  入れ物でない値は何ももたらさず、
  リストはその要素を 1 つずつもたらします。 [fixture: common/config-two-inits-merged]
  [fixture:
  common/directive-two-primitive-inits-wrap]

init の設定があるときは、mermaid.js は検出器をもう一度、
専用のテキストで試します。
フロントマターの後のソースに、
[図種の検出](../../spec/docs/common.ja.md#図種の検出) の 3 つの除去（先頭のフロントマターのブロック、
ディレクティブ、`%%` の並び）を適用したテキストです。
ただし、その前にコメント領域と先頭の空白を取り除くことはしません。
どの検出器もこのテキストに一致しなければ、
[図種の検出](../../spec/docs/common.ja.md#図種の検出) の検出が成功する場合でも、
mermaid.js は入力を `UnknownDiagramError` で拒否します。
`error`、改行、テキストの最後の `%% x` は `error` 疑似図種ですが、
その前に init ディレクティブがあると、mermaid.js は拒否します。
ここでは `%%` の後に改行がないので、`%%` の除去はそれを残すからです。
この仕様は、
この 2 回目の検出を行いません。 [fixture: common/error-trailing-comment-line]
[fixture:
common/config-init-detection-rejects]

検出器が一致し、init の設定が `config` の項目を持つマッピングであれば、
その項目は、検出された id の名前のキーに移り、そこにあった項目を置き換えます。
キーは id そのものですが、`flowchart-v2` は `flowchart` になります。
init ディレクティブが 2 つ以上のときは、
キーの絞り込みがすでに `config` を取り除いているので、
何も移りません。 [fixture: common/config-key-moves-to-diagram] [fixture:
common/config-key-dropped-with-two-inits]

### wrap ディレクティブ

**wrap ディレクティブ**は、名前が `wrap` を含むディレクティブです。
完全に一致するかで比べます。
wrap ディレクティブは準備したテキストの先頭から取ります。
ただし、init の走査が JSON のエラーで止まったときは、
止まったディレクティブの後からだけ取ります。
そのどれかの引数が正しい JSON でなければ、wrap フラグはありません。
そうでなければ、次のとおりです。

- wrap ディレクティブがちょうど 1 つなら、
  その名前が `wrap` のとき **wrap フラグ**は真で、
  他の名前ならフラグはありません。
- 2 つ以上なら、名前のどれかが `wrap` のときフラグは真で、そうでなければ偽です。

**ディレクティブの設定**は init の設定です。
init の設定がなければ、空のマッピングです。
wrap フラグがあるとき、ディレクティブの設定がマッピングなら、
フラグをその `wrap` の項目にします。
ディレクティブの設定が文字列、数、真のどれかなら、
mermaid.js は入力を `TypeError` で拒否します。
リストなら、何も変わりません。
そのため、mermaid.js は、`%%{init: 5}%%` と `%%{wrap}%%` の組を拒否し、
`%%{init: 5}%%` と `%%{nowrap}%%` だけなら受理し、
`%%{init: 5}%%` と `%%{nowrap}%%` と `%%{wrapper}%%` の組を拒否します。 [fixture: common/directive-primitive-init-wrap]
[fixture:
common/directive-primitive-init-nowrap] [fixture:
common/directive-primitive-init-two-wrap-substrings]

### テキストの設定

**テキストの設定**は、空のマッピングに、
[`cleanAndMerge()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L861-L863) がフロントマターの設定を、
次にディレクティブの設定を、
**深い合成**（es-toolkit の `merge`）で合成したものです。
入れ物でない合成元は、何ももたらしません。
合成元の入れ物を合成先の入れ物に合成するには、
合成元の各項目（リストでは各位置）を、合成先の同じキーの項目と組にして、
次のようにします。

- 合成元の項目がリストなら、合成先の項目は、
  合成先の項目がリストであればその複製に、そうでなければ新しい空のリストに、
  合成元の項目を合成したものになります。
- そうでなく、両方の項目が入れ物なら、合成元の項目を合成先の項目に合成します。
  マッピングをリストに合成しても、リストの要素は変わりません。
- そうでなく、合成先の項目がないか null で、合成元の項目がマッピングなら、
  合成先の項目は、新しい空のマッピングに合成元の項目を合成したものになります。
- それ以外では、前が何であっても、合成先の項目は合成元の項目になります。

そのため、ディレクティブがフロントマターに勝ち、
ディレクティブの設定の文字列や数は、
フロントマターの設定のマッピングを置き換えます。
テキストの設定そのものにリストを合成すると、キー `0`、`1` などができ、
キーの絞り込みがそれらを取り除きます。
そのため、フロントマターの設定やディレクティブの設定がリストだと、
何ももたらしません。 [fixture: common/config-directive-after-frontmatter]
[fixture:
common/config-primitive-replaces-frontmatter-mapping]

その後、テキストの設定を 3 つの段階で処理します。

**1. キーの絞り込み** （[`sanitizeDirective()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils/sanitizeDirective.ts#L38-L98)）。
テキストの設定に適用し、リストには各要素に適用することで適用します。
マッピングでは、各項目を順に見ます。

- キーが `__` で始まるか、`proto` を含むか、`constr` を含むか、
  設定のキーでないとき、または値が null のとき、項目を取り除きます。
  ある名前が、pin した mermaid.js の既定の設定のどこかの深さで、
  リストでない値のキーとして現れるとき、
  その名前は**設定のキー**です（[`configKeys`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/defaultConfig.ts#L346-L356)、
  [既定の設定](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/defaultConfig.ts#L18-L343) から求め、
  その値は、
  [`config.schema.yaml`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/schemas/config.schema.yaml) と既定のテーマの変数から取ります）。
- 値が入れ物なら、それにも絞り込みを適用します。
  キー `nodeColors`、`filenameIcons`、
  `extensionIcons` は別の方法で絞り込みます。
  その各項目は、キーが `__` で始まるか、`proto` を含むか、`constr` を含むとき、
  または値が許される形の文字列でないとき、取り除かれます。
  `nodeColors` で許される形は、ASCII の英字の大文字小文字を区別せずに比べて、
  次のどれかです。
  `#` の後に 16 進数字が 3〜8 個続くもの。
  `rgb(` か `hsl(` の後に、ASCII の数字、空白、`%`、`,`、
  `.` のどれかである文字が 1 個以上続き、`)` で終わるもの。
  ASCII の英字が 1 個以上並んだもの。
  `filenameIcons` と `extensionIcons` で許される形は、
  語の文字か `-` である文字が 1 個以上並び、その後に省略可能な `:` と、
  同じ種類の文字の 1 個以上の並びが続くものです。
- 値が入れ物でなく、キーが `themeCSS`、`fontFamily`、
  `altFontFamily` のどれかを含む（完全に一致するかで比べます）とき、
  値は文字列でなければなりません。
  数や真偽値なら、mermaid.js は入力を `TypeError` で拒否します。
  波括弧がつり合っていない文字列は、
  テキスト `{ /* ERROR: Unbalanced CSS */ }` に置き換えられます。
  文字列の `{` と `}` の数が違うとき、
  または文字列のある先頭部分で `}` が `{` より多いとき、
  波括弧は**つり合っていません**。 [fixture: common/config-css-key-not-string]

項目の後で、マッピングが空でない `themeVariables` を持つなら、
`themeVariables` の中の文字列のうち、空であるか、ASCII の英字、ASCII の数字、
空白（U+0020）、`"`、`#`、`%`、`(`、`)`、`,`、`.`、`;` 以外の文字を含むものを、
空文字列に置き換えます。
対象は、マッピングの項目の値と、リストの要素です。
`themeVariables` そのものが文字列で、そのような文字を含むときは、
mermaid.js は入力を `TypeError` で拒否します。 [fixture: common/config-theme-variables-string-rejected]

**2. フォントファミリー** （[`addDirective()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.ts#L277-L290)）。
テキストの設定の `fontFamily` が空でなく、
テキストの設定の `themeVariables` が空でない `fontFamily` を持たないとき、
`themeVariables` は新しいマッピングになります。
そのマッピングは、元の項目を持ち、
`fontFamily` にテキストの設定の `fontFamily` の値を持ちます。
元の項目は、元の値がマッピングならその項目、文字列ならその文字を位置ごとに、
リストならその要素を位置ごとに並べたもので、その他の値なら何もありません。

**3. 安全のための絞り込み** （[`sanitize()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.ts#L235-L270)）。
テキストの設定の中のすべての入れ物に、上から順に適用します。
それぞれで、まずキー `secure` と、
サイト設定の `secure` の項目に挙げられたキーを取り除き、
次に `__` で始まるキーを取り除き、次に `<`、`>`、
`url(data:` のどれかを含む文字列の値をすべて取り除きます。
リストから取り除いた文字列は、その位置を空けたままにし、
後の合成はその位置を飛ばします。
[既定の `secure` の一覧](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/schemas/config.schema.yaml#L334-L347) は、
`secure`、`securityLevel`、`startOnLoad`、`maxTextSize`、
`suppressErrorRendering`、`maxEdges` です。
`secure` 自身が含まれるので、
テキストはこの一覧を変えられません。 [fixture: common/config-secure-key-ignored]

その結果がテキストの設定です。
[`mermaid.parse()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L96-L117) が `config` として返すものと同じです。

### 有効な設定

**サイト設定**は、pin した mermaid.js の既定の設定に、
[`mermaid.initialize()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L702-L740) に渡した設定を加えたものです。
サイト設定が必要な fixture は、
それを `expected.json` の `config` 欄に記録します。

**有効な設定**は、サイト設定の複製に、
テキストの設定を**深さを限った合成** （[`assignWithDepth()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/assignWithDepth.ts#L30-L91)）で合成したものです。
まずテキストの設定を空のマッピングに合成し、その結果を複製に合成します。
合成元の値を合成先の値に、深さ（2 から始まります）を付けて合成するには、
次のようにします。

- 合成元がリストで合成先がリストでなければ、合成元の各要素を順に、
  同じ深さで合成先に合成します。
- どちらもリストなら、合成元の要素のうち、
  まだ合成先の要素でないものを合成先の末尾に加えます。
  入れ物は、すでに要素であることはありません。
- そうでなく、合成先がないか null であるか、深さが 0 なら、次のようにします。
  どちらも入れ物であれば、合成元の各項目を合成先にコピーし、そこにあった項目を、
  合成せずに置き換えます。
  そうでなければ、合成元が合成先を置き換えます。
- そうでなく、どちらも入れ物なら、合成元の各項目を、
  同じキーの合成先の項目に合成します。
  null の合成元の項目は飛ばします。
  合成元の項目が入れ物なら、
  合成先にない項目はまず同じ種類の新しい空の入れ物になり、
  入れ物か null である合成先の項目は、
  深さを 1 減らして合成元の項目をそれに合成したものになります。
  文字列、数、真偽値の合成先の項目はそのままです。
  合成元の項目が入れ物でなければ、合成先の項目が入れ物か null でない限り、
  合成元の項目がそれを置き換えます。
- それ以外では、合成先はそのままです。

そのため、テキストの値が既定値を変えるのは、両方が入れ物で合成されるときと、
どちらも入れ物でなく置き換えるときだけです。
`%%{init: {"flowchart": {"inheritDir": {"a": 1}}}}%%` は、
`flowchart.inheritDir` を既定値のままにします。 [fixture: common/config-mapping-does-not-replace-default]

有効な設定からは、テーマやその他の見た目の設定も導かれます。
これらは描画に影響するものですが、
導く処理で mermaid.js が入力を拒否することがあります。
mermaid.js は `themeVariables` から色の値を読み、
解析できない値があると入力を拒否します。
`%%{init: {"themeVariables": {"primaryColor": "notacolor"}}}%%` がその例です。 [fixture: common/config-theme-colour-rejected]

[`renderDiagram()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L477-L680) は、
解析の前にテキストの設定とタイトルを適用します。
`mermaid.parse()` は同じ設定を適用しますが、タイトルは適用しません。
fixture は `renderDiagram()` に従います。
