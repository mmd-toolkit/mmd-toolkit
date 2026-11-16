# Claude が決めるのを放棄した印字の形（直す予定）

整形ツールの決まりは、整形ツールを書いた AI エージェントの Claude が決めた。
下の形は、Claude が決めるのを放棄し、理由が記録されておらず、
利用者も決めていない形で印字している。
その多くは、書かれたまま印字している。
[印字する形の決め方](./docs/printed-form.ja.md) のどの決まりも、
その形を与えておらず、残す理由も記録されていない。
対象にする mermaid.js の版で、別の形が Db や図を変えることも、拒否されることも、
走らせて示されていない。
利用者も決めていない。
これらは決まりではなく、これから決める印字の形である。

「決まりで直す形」の節には、
[印字する形の決め方](./docs/printed-form.ja.md)
の決まりがすでに形を与えているのに、
整形ツールがまだその形で印字しないものを載せる。

形をここに足すのは、規則の文書と、その形を決めたときの会話の記録から理由を探し、
見つからなかったときだけである。
まだ理由を探していない形は足さず、先に探す。

それぞれの形は、次のように決める。
別の形を、対象にする版で走らせる。
どの種類の例外も認めない形で Db が変わるか、図が変わるか、拒否されるときは、
その理由を図種の規則に書く。
対象にする版が要るときは、
[対象にする版の mermaid.js のために残す形][kept] にも行を足す。
そうでないときは、AGENTS.md の 4 のとおり、いちばん読みやすい形を決め、
誰もが納得できる理由とともに決まりに書き足す。
決まった形はこの一覧から外し、一覧が空になったらこのファイルを消す。

この一覧は、まだ全部ではない。
理由なく書かれたまま残している形を、すべての図種の規則から探している途中である。
規則の文書に理由が書いていない形をすべてここに載せたら、この段落と、
この一覧に形を足す prettier-plugin のスキルの手順（3 節の手順 5）と、
その手順についての review のスキルの例外を消す。

## まだ決めていない形

### キーワードと方向をどの綴りと大小文字で書くか

19 形が block、compatibility、er、eventmodeling、gantt、kanban、quadrant、
requirement、sequence、state、timeline、usecase にある。

| 図種          | 規則の文書                                                                           | 書かれた形                                                                                                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| block         | [block.md:78](./docs/block.ja.md#composite)                                          | `"block-beta\nblock-beta\na\nend\n"`                                                                                                                                                                                                  |
| compatibility | [compatibility.md:2376](./docs/compatibility.ja.md#大文字小文字をそろえるキーワード) | `"gantt\nTODAYMARKER off\ndateFormat YYYY-MM-DD\nA : 2024-01-01, 1d\n"`                                                                                                                                                               |
| compatibility | [compatibility.md:2403](./docs/compatibility.ja.md#大文字小文字をそろえるキーワード) | `"quadrantChart\nCLASSDEF a color:#ABC\n"`                                                                                                                                                                                            |
| compatibility | [compatibility.md:3750](./docs/compatibility.ja.md#ヘッダーの名前)                   | `"sankey-BETA\na,b,1\n"`                                                                                                                                                                                                              |
| er            | [er.md:1237](./docs/er.ja.md#関係の空白)                                             | `"erDiagram\nA u--o{ B : x\n"`                                                                                                                                                                                                        |
| eventmodeling | [eventmodeling.md:332](./docs/eventmodeling.ja.md#authored-spellings)                | `"eventmodeling timeframe 01 evt Alpha"`                                                                                                                                                                                              |
| gantt         | [gantt.md:842](./docs/gantt.ja.md#リスト)                                            | `"gantt\nexcludes Weekends, MONDAY\nincludes Saturday\n"`                                                                                                                                                                             |
| gantt         | [gantt.md:921](./docs/gantt.ja.md#weekday-と-weekend)                                | `"gantt\nweekday MONDAY\nweekend Friday\nWEEKDAY Tuesday\n"`                                                                                                                                                                          |
| gantt         | [gantt.md:985](./docs/gantt.ja.md#キーワードの大文字小文字)                          | `"gantt\nDATEFORMAT YYYY\nAxisFormat %m\nTICKINTERVAL 1week\nTodayMarker off\nTITLE T\nSection S\nEXCLUDES weekends\nIncludes monday\nINCLUSIVEENDDATES\nWEEKDAY Monday\nWEEKEND FRIDAY\nACCTITLE: T\nAccDescr: d\nACCDESCR { d }\n"` |
| kanban        | [kanban.md:434](./docs/kanban.ja.md#アイコンとクラス)                                | `"kanban\n S\n   A\n ::ICON(x)\n ::Icon(y)\n"`                                                                                                                                                                                        |
| kanban        | [kanban.md:1149](./docs/kanban.ja.md#キーワードの大文字小文字)                       | `"kanban\n S\n   A\n ::ICON(x)\n ::Icon(y)\n"`                                                                                                                                                                                        |
| kanban        | [kanban.md:1153](./docs/kanban.ja.md#キーワードの大文字小文字)                       | `"kanban\n S\n   A\n ::ICON(x)\n ::Icon(y)\n"`                                                                                                                                                                                        |
| quadrant      | [quadrant.md:932](./docs/quadrant.ja.md#キーワードの大文字小文字)                    | `"quadrantChart\nACCTITLE: T\nAccDescr: d\nACCDESCR {x}\n"`                                                                                                                                                                           |
| requirement   | [requirement.md:762](./docs/requirement.ja.md#方向)                                  | `"requirementDiagram\nDIRECTION lr\nDirection Tb\n"`                                                                                                                                                                                  |
| sequence      | [sequence.md:356](./docs/sequence.ja.md#トークンの間の空白)                          | `"sequenceDiagram\nPARTICIPANT A\nNote LEFT OF A: x\nparticipant B AS Bob\nLOOP x\nA->>B: y\nEND\n"`                                                                                                                                  |
| sequence      | [sequence.md:1863](./docs/sequence.ja.md#複数行の値)                                 | `"sequenceDiagram\nPARTICIPANT A\nNote LEFT OF A: x\nparticipant B AS Bob\nLOOP x\nA->>B: y\nEND\n"`                                                                                                                                  |
| state         | [state.md:622](./docs/state.ja.md#トークンの間の空白)                                | `"stateDiagram-v2\nSTATE A {\nB\n}\nNote Left Of A : x\nHIDE EMPTY DESCRIPTION\n"`                                                                                                                                                    |
| timeline      | [timeline.md:756](./docs/timeline.ja.md#キーワードの大文字小文字)                    | `"timeline\nTITLE T\nSection S\nACCTITLE: T\nAccDescr: d\nACCDESCR { d }\n"`                                                                                                                                                          |
| usecase       | [usecase.md:1018](./docs/usecase.ja.md#direction-and-accessibility)                  | `"usecase-beta\ndirection  TD\nA\ndirection\tBT\ndirection RL"`                                                                                                                                                                       |

### 同じ意味の矢印の記号をどの形で書くか

3 形が architecture、compatibility、wardley にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                                    |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| architecture  | [architecture.md:481](./docs/architecture.ja.md#arrow-lines)                   | `"architecture-beta\nservice a\nservice b\na:B > -- < T:b\n"` |
| compatibility | [compatibility.md:6560](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"architecture-beta\nservice a\nservice b\na:B > -- < T:b\n"` |
| wardley       | [wardley.md:383](./docs/wardley.ja.md#link)                                    | `"wardley-beta\nAlpha\t-->Beta"`                              |

### 図形の閉じ記号を開始記号に合わせるか

4 形が kanban、mindmap にある。

| 図種    | 規則の文書                                | 書かれた形                                              |
| ------- | ----------------------------------------- | ------------------------------------------------------- |
| kanban  | [kanban.md:271](./docs/kanban.ja.md#形)   | `"kanban\n S[x)\n   A(y]\n   B))z((\n   C{{q}}\n"`      |
| kanban  | [kanban.md:271](./docs/kanban.ja.md#形)   | `"kanban\n S[x)\n   A(y]\n   B))z((\n   C{{q}}\n"`      |
| mindmap | [mindmap.md:360](./docs/mindmap.ja.md#形) | `"mindmap\n  root((x)\n    a[y)\n    b(z]\n    c)w(\n"` |
| mindmap | [mindmap.md:360](./docs/mindmap.ja.md#形) | `"mindmap\n  root((x)\n    a[y)\n    b(z]\n    c)w(\n"` |

### 文字列を引用符で囲むか、どの引用符を使うか

22 形が agentflow、architecture、compatibility、gitgraph、kanban、packet、pie、
quadrant、sankey、state、usecase、venn、xychart にある。

| 図種          | 規則の文書                                                           | 書かれた形                                                                                                                                                                                                                                                                                                                                                                 |
| ------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| agentflow     | [agentflow.md:1522](./docs/agentflow.ja.md#quotes)                   | `"agentflow-beta TB\nconnector C[a/b]"`                                                                                                                                                                                                                                                                                                                                    |
| architecture  | [architecture.md:208](./docs/architecture.ja.md#text-icons)          | `"architecture-beta\nservice single'It\\'s'\n"`                                                                                                                                                                                                                                                                                                                            |
| compatibility | [compatibility.md:3264](./docs/compatibility.ja.md#テキストの引用符) | `"sankey-beta\na,b,\"1&x\"\n"`                                                                                                                                                                                                                                                                                                                                             |
| compatibility | [compatibility.md:3400](./docs/compatibility.ja.md#テキストの引用符) | `"xychart-beta\nbar \"T\" [1]\n"`                                                                                                                                                                                                                                                                                                                                          |
| compatibility | [compatibility.md:3473](./docs/compatibility.ja.md#テキストの引用符) | ``"mindmap\n  a[\"`text`\"]\n"``                                                                                                                                                                                                                                                                                                                                           |
| compatibility | [compatibility.md:3516](./docs/compatibility.ja.md#テキストの引用符) | `"flowchart TD\nsubgraph \"-S\"\nA\nend\n"`                                                                                                                                                                                                                                                                                                                                |
| compatibility | [compatibility.md:3563](./docs/compatibility.ja.md#テキストの引用符) | `"flowchart TD\nA[\"_start\"]\n"`                                                                                                                                                                                                                                                                                                                                          |
| compatibility | [compatibility.md:3651](./docs/compatibility.ja.md#テキストの引用符) | `"quadrantChart\nquadrant-1 \"A\" %% c\n"`                                                                                                                                                                                                                                                                                                                                 |
| gitgraph      | [gitgraph.md:285](./docs/gitgraph.ja.md#quotes)                      | `"gitGraph\ncommit msg:'Plain' tag:'a\"b'"`                                                                                                                                                                                                                                                                                                                                |
| kanban        | [kanban.md:383](./docs/kanban.ja.md#quotes)                          | ``"kanban\n S\n   A[x y]\n   B[\"x y\"]\n   C[\"`x y`\"]\n   D[ \"x\" ]\n"``                                                                                                                                                                                                                                                                                               |
| kanban        | [kanban.md:938](./docs/kanban.ja.md#行の規則と保つ行)                | `"kanban\n S\n   A[\"aStyle:#x;yb\"]\n"`                                                                                                                                                                                                                                                                                                                                   |
| packet        | [packet.md:221](./docs/packet.ja.md#quotes)                          | `"packet\n0:'Plain'\n1:'a\"b'"`                                                                                                                                                                                                                                                                                                                                            |
| pie           | [pie.md:124](./docs/pie.ja.md#labels)                                | `"pie\n'a\\n':1"`                                                                                                                                                                                                                                                                                                                                                          |
| quadrant      | [quadrant.md:593](./docs/quadrant.ja.md#引用符)                      | ``"quadrantChart\nquadrant-1 \"`a`\" b\n\"`A`\": [0.3, 0.6]\n"``                                                                                                                                                                                                                                                                                                           |
| sankey        | [sankey.md:280](./docs/sankey.ja.md#値)                              | `"sankey\na,b,\"1.0\"\nc,d,\"abc\"\ne,f,\"1e3\"\ng,h,\"+1\"\n"`                                                                                                                                                                                                                                                                                                            |
| state         | [state.md:536](./docs/state.ja.md#トークンの間の空白)                | `"stateDiagram-v2\nnote   \"x\"   as   N\nnote \"\"y\"   as   M\n"`                                                                                                                                                                                                                                                                                                        |
| usecase       | [usecase.md:343](./docs/usecase.ja.md#quotes)                        | `"usecase-beta\nPanel[\"Display\"]\nTwo[\"Two words\"]\nDash[\"a-b\"]\nNum[\"Costs 19.95\"]\nSym[\"a_b 1\"]\nBare[Already bare]\n"`                                                                                                                                                                                                                                        |
| usecase       | [usecase.md:370](./docs/usecase.ja.md#quotes)                        | `"usecase-beta\n\"Other\" -- a;b --> \"Third\"\nTask(a;b) --> \"Four\"\n\"Plain\"\n"`                                                                                                                                                                                                                                                                                      |
| venn          | [venn.md:513](./docs/venn.ja.md#quotes)                              | `"venn-beta\nset \"a b\"\nset \"a.b\"\nset \"1a\"\nset \"日本語\"\nset \"set\"\nset \"Set-a\"\nset \"-a\"\nset \"style-x\"\nset \"Union\"\nset \"Venn-Beta\"\nset \"title\"\nset \"\"\nset \"ok\"\nunion \"ok\",\"a b\"\nstyle \"a b\",\"title\" fill:red\nstyle \"Text\" fill:red\nset \"ok2\"\n  text \"union\"\n  text \"title\"\n  text \"text-a\"\n  text \"007\"\n"` |
| venn          | [venn.md:533](./docs/venn.ja.md#quotes)                              | `"venn-beta\nset A\nset B\ntext A,B \"item\"[ Note ]\ntext \"A\" \"t\"[N]\n"`                                                                                                                                                                                                                                                                                              |
| venn          | [venn.md:540](./docs/venn.ja.md#quotes)                              | `"venn-beta\nset \"D\"[a;b]\nset \"E\"[x]\n"`                                                                                                                                                                                                                                                                                                                              |
| xychart       | [xychart.md:547](./docs/xychart.ja.md#引用符)                        | `"xychart\nbar Costs [1]\nbar \"Sales\" [2]\n"`                                                                                                                                                                                                                                                                                                                            |

### 同じ値の数値の書き方をそろえるか

13 形が c4、compatibility、journey、pie、radar、railroad、sankey、treemap、
wardley にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| c4            | [c4.md:1360](./docs/c4.ja.md#数値に見える文字)                                 | `"C4Dynamic\nPerson(a,\"A\")\nPerson(b,\"B\")\nRelIndex(007,a,b,\"Uses\")\nUpdateRelStyle(a,b,\"red\",\"blue\",\"01x\",\"-0\")\nUpdateLayoutConfig(\"03rows\",\"02\")\n"` |
| compatibility | [compatibility.md:2503](./docs/compatibility.ja.md#最短の形の数)               | `"wardley-beta\ncomponent A [0.50, 0.50]\n"`                                                                                                                              |
| compatibility | [compatibility.md:6612](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"radar-beta\ncurve trial{0004.5000,9007199254740993,0.12345678901234567890,0}\n"`                                                                                        |
| compatibility | [compatibility.md:7287](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"wardley-beta\ncomponent Alpha [0.10,0.20]\n"`                                                                                                                           |
| journey       | [journey.md:333](./docs/journey.ja.md#タスクのデータ)                          | `"journey\nA: 05\nB: 3.50\nC: -2\nD: 0x10\nE: 1e2\nF: abc\n"`                                                                                                             |
| pie           | [pie.md:161](./docs/pie.ja.md#numbers)                                         | `"pie showData\n\"negative zero\":-0\n\"fraction\":0007.2300\n\"precision\":0.12345678901234567890123456789"`                                                             |
| radar         | [radar.md:348](./docs/radar.ja.md#numbers)                                     | `"radar-beta\ncurve trial{007.0, 1.50}"`                                                                                                                                  |
| railroad      | [railroad.md:525](./docs/railroad.ja.md#repeat-の表記)                         | `"railroad-abnf-beta\nr=002*004 (\"range\") 03 \"exact\" * \"any\" 2* ref *1 \"upper\";"`                                                                                 |
| sankey        | [sankey.md:277](./docs/sankey.ja.md#値)                                        | `"sankey\na,b,1e0\n"`                                                                                                                                                     |
| treemap       | [treemap.md:267](./docs/treemap.ja.md#numbers)                                 | `"treemap-beta\n\"leading\": 007\n\"short\": 1.50"`                                                                                                                       |
| wardley       | [wardley.md:253](./docs/wardley.ja.md#座標)                                    | `"wardley-beta\nannotations [ 3 , 4 ]\nannotation 2,[ 0 , 1 ]\"Integer\""`                                                                                                |
| wardley       | [wardley.md:349](./docs/wardley.ja.md#label-offset)                            | `"wardley-beta\ncomponent ZeroSign[0.3,0.6]label[- 0,0]"`                                                                                                                 |
| wardley       | [wardley.md:498](./docs/wardley.ja.md#evolve)                                  | `"wardley-beta\ncomponent Motion[0.3,0.6]\nevolveMotion\t0.80"`                                                                                                           |

### 色と色に似た文字列を小文字にするか

10 形が block、class、compatibility、er、flowchart、requirement、state、
treemap、usecase、venn にある。

| 図種          | 規則の文書                                                     | 書かれた形                                                                                                                                                                                               |
| ------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| block         | [block.md:1142](./docs/block.ja.md#色)                         | `"block-beta\nA B\nstyle A fill:#ABCDE,stroke:#ABCDEF1\nclassDef c fill:url(#ABC),stroke:#ABC-x\n"`                                                                                                      |
| class         | [class.md:1184](./docs/class.ja.md#色)                         | `"classDiagram\nclass A\nstyle A fill:#ABCDE,stroke:#ABCDEF1\nclassDef c fill:url(#ABC),stroke:#ABC-x\nclassDef d fill:\"#ABC\",stroke:/* #ABC */ red\n"`                                                |
| compatibility | [compatibility.md:1860](./docs/compatibility.ja.md#サイト設定) | `"sequenceDiagram\nrect #FFF\nA->>B: x\nend\n"`                                                                                                                                                          |
| er            | [er.md:2203](./docs/er.ja.md#色)                               | `"erDiagram\nCUSTOMER\nstyle CUSTOMER fill:#ABCDE,stroke:#ABCDEF1\nclassDef c fill:#ABC-x,stroke:x#ABC\n"`                                                                                               |
| flowchart     | [flowchart.md:3233](./docs/flowchart.ja.md#色)                 | `"flowchart LR\nA --> B\nstyle A fill:#ABCDE,stroke:#ABCDEF1\nstyle B fill:#AB,stroke:#GGG\nclassDef c fill:x#ABC,stroke:#ABC-x\nclassDef d fill:#ABC.5,stroke:#ABC#DEF\nclassDef e stroke:#ABC/#DEF\n"` |
| requirement   | [requirement.md:1741](./docs/requirement.ja.md#色)             | `"requirementDiagram\nrequirement r {\nid: 1\n}\nstyle r fill:#ABCDE,stroke:#ABCDEF1\nclassDef c fill:#ABC-x,stroke:x#ABC\n"`                                                                            |
| state         | [state.md:1463](./docs/state.ja.md#色)                         | `"stateDiagram-v2\nA --> B\nstyle A fill:#ABCDE,stroke:#ABCDEF1\nclassDef c fill:url(#ABC),stroke:#ABC-x\n"`                                                                                             |
| treemap       | [treemap.md:493](./docs/treemap.ja.md#colors)                  | `"treemap-beta\n\"A\"\n  \"B\": 1:::zz\nclassDef zz fill:#ABCDEF,stroke:#DEF,color:#C0FFEE\nclassDef yy color:#333,fill:url(#ABC)\n"`                                                                    |
| usecase       | [usecase.md:257](./docs/usecase.ja.md#色)                      | `"usecase-beta\nactor A\nstyle A stroke:#ABCDE,fill:#ABCDEF1\nclassDef c fill:url(#ABC),stroke:#ABC-x\n"`                                                                                                |
| venn          | [venn.md:433](./docs/venn.ja.md#色)                            | `"venn-beta\nset A\nstyle A fill:#ABCDE,color:#ABCDEF1\n"`                                                                                                                                               |

### 空の値や文を残すか

2 形が agentflow、flowchart にある。

| 図種      | 規則の文書                                                       | 書かれた形                                                                                                                  |
| --------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| agentflow | [agentflow.md:177](./docs/agentflow.ja.md#names-and-headings)    | `"agentflow-beta TB\nflow F click [T]\nA\nend\nflow F \"\" G [T]\nB\nend\nconnector H click [T]\nconnector I \"\" J [T]\n"` |
| flowchart | [flowchart.md:1762](./docs/flowchart.ja.md#アクセシビリティの行) | `"flowchart LR\naccTitle \t:   "`                                                                                           |

### 書かれたモード選択記号を残すか

1 形が compatibility にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                                         |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| compatibility | [compatibility.md:6896](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"treeView-beta\naccDescr\n─\n{z}\n   title   T\nroot\n\n\n\nx\n"` |

### 読み飛ばされるソースの範囲を残すか

1 形が eventmodeling にある。

| 図種          | 規則の文書                                                      | 書かれた形                                                    |
| ------------- | --------------------------------------------------------------- | ------------------------------------------------------------- |
| eventmodeling | [eventmodeling.md:842](./docs/eventmodeling.ja.md#hidden-forms) | `"eventmodeling tf 01 evt Alpha ---\nx\n---\ntf 02 evt Beta"` |

### 繰り返し書かれた要素を残すか

2 形が eventmodeling にある。

| 図種          | 規則の文書                                                       | 書かれた形                                      |
| ------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| eventmodeling | [eventmodeling.md:1351](./docs/eventmodeling.ja.md#source-order) | `"eventmodeling tf 01 evt Alpha ->> 02 ->> 02"` |
| eventmodeling | [eventmodeling.md:1353](./docs/eventmodeling.ja.md#source-order) | `"eventmodeling tf 01 evt Alpha ->> 02 ->> 02"` |

### メッセージの導入記号を明示するか

2 形が gitgraph にある。

| 図種     | 規則の文書                                        | 書かれた形                                                |
| -------- | ------------------------------------------------- | --------------------------------------------------------- |
| gitgraph | [gitgraph.md:262](./docs/gitgraph.ja.md#messages) | `"gitGraph\ncommit \"bare\" msg:\"explicit\" \"last\"\n"` |
| gitgraph | [gitgraph.md:263](./docs/gitgraph.ja.md#messages) | `"gitGraph\ncommit \"bare\" msg:\"explicit\" \"last\"\n"` |

### 暗黙のデータ型を明示するか

1 形が eventmodeling にある。

| 図種          | 規則の文書                                                   | 書かれた形                                                  |
| ------------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| eventmodeling | [eventmodeling.md:269](./docs/eventmodeling.ja.md#type-tags) | `"eventmodeling tf 01 evt Alpha {text}\nnote 01 {\nx\n}\n"` |

### 省略できる区切り記号を足すか、除くか、置き換えるか

10 形が c4、compatibility、gantt、radar、railroad、treemap にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| c4            | [c4.md:1043](./docs/c4.ja.md#空の引数)                                         | `"C4Context\nPerson(\"a\"\"A\")\nPerson(\"b\"   \"B\")\n"`                                                                         |
| compatibility | [compatibility.md:6196](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"usecase-beta\nactor U @{ 'icon' : 'person' , business : false , }"`                                                              |
| gantt         | [gantt.md:835](./docs/gantt.ja.md#リスト)                                      | `"gantt\nexcludes weekends,2024-01-01\nexcludes weekends ,  2024-01-01\nincludes 2024-01-01   2024-01-02\nexcludes a , b   c,d\n"` |
| gantt         | [gantt.md:837](./docs/gantt.ja.md#リスト)                                      | `"gantt\nexcludes weekends,2024-01-01\nexcludes weekends ,  2024-01-01\nincludes 2024-01-01   2024-01-02\nexcludes a , b   c,d\n"` |
| gantt         | [gantt.md:852](./docs/gantt.ja.md#リスト)                                      | `"gantt\nexcludes weekends,,2024-01-01\nincludes ,a,\nexcludes ,,\n"`                                                              |
| radar         | [radar.md:321](./docs/radar.ja.md#named-entries)                               | `"radar-beta\naxis North,South\ncurve trial{North 4,South:5}\n"`                                                                   |
| railroad      | [railroad.md:368](./docs/railroad.ja.md#ebnf-の並び)                           | `"railroad-ebnf-beta\nr=first ,\tsecond;"`                                                                                         |
| railroad      | [railroad.md:369](./docs/railroad.ja.md#ebnf-の並び)                           | `"railroad-ebnf-beta\nr=\"a\" ,\t\"b\" \"c\", \"last\";"`                                                                          |
| treemap       | [treemap.md:203](./docs/treemap.ja.md#separators)                              | `"treemap\n\"Comma\" \t, \t1_000"`                                                                                                 |
| treemap       | [treemap.md:204](./docs/treemap.ja.md#separators)                              | `"treemap\n\"Comma\" \t, \t1_000"`                                                                                                 |

### 同じ意味の括弧によるまとまりを残すか、書き換えるか

5 形が railroad、wardley にある。

| 図種     | 規則の文書                                          | 書かれた形                                           |
| -------- | --------------------------------------------------- | ---------------------------------------------------- |
| railroad | [railroad.md:426](./docs/railroad.ja.md#括弧)       | `"railroad-peg-beta\nr<-( ( \"group\" ) );"`         |
| railroad | [railroad.md:427](./docs/railroad.ja.md#括弧)       | `"railroad-peg-beta\nr<-( ( \"group\" ) );"`         |
| railroad | [railroad.md:472](./docs/railroad.ja.md#後置演算子) | `"railroad-ebnf-beta\nr=reference ?;"`               |
| wardley  | [wardley.md:309](./docs/wardley.ja.md#装飾)         | `"wardley-beta\ncomponent BareOnly[0.3,0.6]inertia"` |
| wardley  | [wardley.md:310](./docs/wardley.ja.md#装飾)         | `"wardley-beta\ncomponent BareOnly[0.3,0.6]inertia"` |

### 字下げによる木の表記を罫線による表記へ変えるか

3 形が compatibility、treeview にある。

| 図種          | 規則の文書                                                                     | 書かれた形                           |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------ |
| compatibility | [compatibility.md:6806](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"treeView-beta\nroot\n  child\n"`   |
| treeview      | [treeview.md:60](./docs/treeview.ja.md#modes)                                  | `"treeView-beta\nroot\n    child\n"` |
| treeview      | [treeview.md:63](./docs/treeview.ja.md#modes)                                  | `"treeView-beta\nroot\n    child\n"` |

### 書かれたセミコロンを残すか、除くか

26 形が agentflow、block、class、er、eventmodeling、flowchart、quadrant、
requirement、state、treeview、usecase、venn にある。

| 図種          | 規則の文書                                                                        | 書かれた形                                                                                                               |
| ------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| agentflow     | [agentflow.md:221](./docs/agentflow.ja.md#names-and-headings)                     | `"agentflow-beta TB\nconnector style:#x ; [T]"`                                                                          |
| agentflow     | [agentflow.md:908](./docs/agentflow.ja.md#kept-lines)                             | `"agentflow-beta TB\nA\n%%{open;B"`                                                                                      |
| block         | [block.md:830](./docs/block.ja.md#スタイル文の末尾のセミコロン)                   | `"block\nA\nclassDef c fill:#f00; %%{init: {}}%%\nstyle A fill:#f00; %% keep\n"`                                         |
| class         | [class.md:1495](./docs/class.ja.md#スタイル文の末尾のセミコロン)                  | `"classDiagram\nclass A\nclassDef c fill:#f00; %%{init: {}}%%\nstyle A fill:#f00; %% keep\n"`                            |
| class         | [class.md:1514](./docs/class.ja.md#スタイル文の末尾のセミコロン)                  | `"classDiagram\nstyle A fill:#f00;\u2028\n"`                                                                             |
| er            | [er.md:1750](./docs/er.ja.md#スタイルとクラス)                                    | `"erDiagram\nclassDef a fill:red;\nA\nclassDef b fill:red ;\nB\nstyle C fill:blue;\nstyle D fill:blue%%{init: {}}%%;\n"` |
| er            | [er.md:1827](./docs/er.ja.md#アクセシビリティの文)                                | `"erDiagram\naccDescr {style:#x};\n"`                                                                                    |
| er            | [er.md:2429](./docs/er.ja.md#スタイル文の末尾のセミコロン)                        | `"erDiagram\nA\nclassDef c fill:red%%{init: {}}%%;\nstyle A fill:blue%%{init: {}}%%;\n"`                                 |
| er            | [er.md:2440](./docs/er.ja.md#スタイル文の末尾のセミコロン)                        | `"erDiagram\nA\nclassDef c fill:#f00; %%{init: {}}%%\nB\n"`                                                              |
| er            | [er.md:2495](./docs/er.ja.md#スタイル文の末尾のセミコロン)                        | `"erDiagram\nstyle A fill:red\u2028\u00a0;\n%% c\n"`                                                                     |
| er            | [er.md:2802](./docs/er.ja.md#複数行の文)                                          | `"erDiagram\nstyle A\u2028%% c\nBar fill:red;\n"`                                                                        |
| eventmodeling | [eventmodeling.md:1076](./docs/eventmodeling.ja.md#semicolons)                    | `"eventmodeling tf 01 evt Alpha \"style:#x\" ;rf 02 cmd Beta"`                                                           |
| flowchart     | [flowchart.md:173](./docs/flowchart.ja.md#字下げ)                                 | `"flowchart LR\naccDescr {style:#x} direction LR;; C-->D\n"`                                                             |
| flowchart     | [flowchart.md:188](./docs/flowchart.ja.md#1-行に-1-文)                            | `"flowchart LR\nA[style:#x]-->direction;\n;B\n"`                                                                         |
| flowchart     | [flowchart.md:543](./docs/flowchart.ja.md#セミコロン)                             | `"flowchart LR\nA[style:#x];;\nB\n"`                                                                                     |
| quadrant      | [quadrant.md:867](./docs/quadrant.ja.md#複数行の文)                               | `"quadrantChart\nclassDef a\u2028%% c\nstyle color:#f00;\n"`                                                             |
| requirement   | [requirement.md:1299](./docs/requirement.ja.md#スタイル文の末尾のセミコロン)      | `"requirementDiagram\nclassDef c fill:#f00; %%{init: {}}%%\n"`                                                           |
| state         | [state.md:1705](./docs/state.ja.md#スタイル文の末尾のセミコロン)                  | `"stateDiagram-v2\nA --> B\nclassDef c fill:#f00; %%{init: {}}%%\nstyle A fill:#f00; %% keep\n"`                         |
| treeview      | [treeview.md:761](./docs/treeview.ja.md#carried-indentation)                      | `"treeView-beta\n\"style:#x\";  %% note\nchild\n"`                                                                       |
| treeview      | [treeview.md:1887](./docs/treeview.ja.md#description-blocks)                      | `"treeView-beta\naccDescr {style:#x}accDescr { ; }\n"`                                                                   |
| usecase       | [usecase.md:114](./docs/usecase.ja.md#statements-and-semicolons)                  | `"usecase-beta\nactor Reader(style:#abc)@{type:normal,;icon:''}\n"`                                                      |
| usecase       | [usecase.md:888](./docs/usecase.ja.md#semicolons-at-the-end-of-a-style-statement) | `"usecase-beta\nA\nclassDef c fill:#f00; %%{init: {}}%%\nstyle A fill:#f00; %% keep\n"`                                  |
| usecase       | [usecase.md:950](./docs/usecase.ja.md#classes-and-styles)                         | `"usecase-beta\nA\nstyle A fill:#abc,-- ;color:red"`                                                                     |
| venn          | [venn.md:738](./docs/venn.ja.md#semicolons-at-the-end-of-a-style-statement)       | `"venn-beta\nset A\nstyle A fill:#f00; %%{init: {}}%%\nstyle A fill:#f00; %% keep\n"`                                    |
| venn          | [venn.md:742](./docs/venn.ja.md#semicolons-at-the-end-of-a-style-statement)       | `"venn-beta\nset A\nstyle A fill:#f00; %%{init: {}}%%\nstyle A fill:#f00; %% keep\n"`                                    |
| venn          | [venn.md:780](./docs/venn.ja.md#line-rule-and-kept-lines)                         | `"venn-beta\nset A[style:#x]; text A t\n text u\n"`                                                                      |

### 無視するか取り除くセミコロンの横の空白をどう書くか

8 形が agentflow、block、class、flowchart、sequence、state、usecase、
venn にある。

| 図種      | 規則の文書                                                                        | 書かれた形                                                                            |
| --------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| agentflow | [agentflow.md:220](./docs/agentflow.ja.md#names-and-headings)                     | `agentflow-beta\nconnector style:#x ; [T]\n`                                          |
| block     | [block.md:801](./docs/block.ja.md#スタイル文の末尾のセミコロン)                   | `block\nA\nclassDef c fill:#f00 ;\nstyle A fill:#f00 ;\n`                             |
| class     | [class.md:1459](./docs/class.ja.md#スタイル文の末尾のセミコロン)                  | `classDiagram\nclass A\nclassDef c fill:#f00 ;\nstyle A fill:#f00 ;\n`                |
| flowchart | [flowchart.md:797](./docs/flowchart.ja.md#トークンの間の空白)                     | `"flowchart LR\nclick A call f(style:#x, ; ,b)\n"`                                    |
| sequence  | [sequence.md:568](./docs/sequence.ja.md#トークンの間の空白)                       | `"sequenceDiagram\n  participant A@{ \"alias\": \"style:#x\" };Note left ;of A: t\n"` |
| state     | [state.md:1664](./docs/state.ja.md#スタイル文の末尾のセミコロン)                  | `stateDiagram-v2\nA --> B\nclassDef c fill:#f00 ;\nstyle A fill:#f00 ;\n`             |
| usecase   | [usecase.md:870](./docs/usecase.ja.md#semicolons-at-the-end-of-a-style-statement) | `usecase-beta\nA\nclassDef c fill:#f00 ;\nstyle A fill:#f00 ;\n`                      |
| venn      | [venn.md:725](./docs/venn.ja.md#semicolons-at-the-end-of-a-style-statement)       | `venn-beta\nset A\nstyle A fill:#f00 ;\n`                                             |

### 構造上の部分の間の通常の隙間をどう書くか

24 形が agentflow、architecture、block、c4、compatibility、er、eventmodeling、
flowchart、gitgraph、radar、railroad、usecase、wardley にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                                                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| agentflow     | [agentflow.md:1787](./docs/agentflow.ja.md#click-statements)                   | `"agentflow-beta TB\nA\nclick A cb\t\"tip\""`                                                                                                                                                                      |
| architecture  | [architecture.md:108](./docs/architecture.ja.md#declaration-spacing)           | `architecture-beta\ngroup\t g\n`                                                                                                                                                                                   |
| block         | [block.md:714](./docs/block.ja.md#スタイル)                                    | `block-beta\nA\n    style    A\n`                                                                                                                                                                                  |
| c4            | [c4.md:1701](./docs/c4.ja.md#説明ブロック)                                     | `"C4Context accDescr{\n%% purpose\n}\nPerson(customer, \"Customer\")\n"`                                                                                                                                           |
| compatibility | [compatibility.md:7290](./docs/compatibility.ja.md#wardley-の原文と必須の改行) | `"wardley-beta\ncomponent \"title\"[0.3,0.6]"`                                                                                                                                                                     |
| er            | [er.md:1091](./docs/er.ja.md#トークンの間の空白)                               | `"erDiagram\nA:::c\np[P]\naccDescr{ D }\nA \|\|--u-B : x\n1one to one B : x\n"`                                                                                                                                    |
| eventmodeling | [eventmodeling.md:719](./docs/eventmodeling.ja.md#common-boundaries)           | `"eventmodeling   accTitle: A"`                                                                                                                                                                                    |
| flowchart     | [flowchart.md:1244](./docs/flowchart.ja.md#矢印の前後の空白)                   | `flowchart LR\nA e1@ --> B\n`                                                                                                                                                                                      |
| flowchart     | [flowchart.md:1272](./docs/flowchart.ja.md#矢印の前後の空白)                   | `flowchart LR\nA[x]e1@-->B\nC[x]-c@-->D\nE[x]xe@-->F\nG[x]oe@-->G2\nI[x]<e@-->J\nK[x]=k@==>L\nM[x]~~m@-->N\nO[x].o@-->P\nQ[x]x-q@-->R\nS[x]x~~~s@-->T\nU[x]<~~~u@-->V\n`                                           |
| gitgraph      | [gitgraph.md:14](./docs/gitgraph.ja.md#header)                                 | `"gitGraph\tLR :commit\n"`                                                                                                                                                                                         |
| radar         | [radar.md:386](./docs/radar.ja.md#options)                                     | `"radar-beta\nshowLegend\t false,ticks\t7,max  8,min\t2,graticule\tpolygon\n"`                                                                                                                                     |
| radar         | [radar.md:496](./docs/radar.ja.md#accessibility-lines)                         | `"radar-beta\naccTitle \t:   Access  words\t\naccDescr\t:   Detail  words \n"`                                                                                                                                     |
| railroad      | [railroad.md:260](./docs/railroad.ja.md#代入)                                  | `"railroad-beta\nlongName\t=\tterminal(\"assignment\");s=terminal(\"short\");"`                                                                                                                                    |
| railroad      | [railroad.md:368](./docs/railroad.ja.md#ebnf-の並び)                           | `railroad-ebnf-beta\nr=first ,\tsecond;`                                                                                                                                                                           |
| railroad      | [railroad.md:469](./docs/railroad.ja.md#後置演算子)                            | `"railroad-ebnf-beta\nr=\"chain\" * + [\"optional\"] ?;"`                                                                                                                                                          |
| railroad      | [railroad.md:527](./docs/railroad.ja.md#repeat-の表記)                         | `"railroad-abnf-beta\nr=9007199254740993 \"large\";"`                                                                                                                                                              |
| railroad      | [railroad.md:571](./docs/railroad.ja.md#呼出し)                                | `"railroad-beta\nr=sequence ( terminal ( \"first\" ) , choice ( special ( \"note\" ),nonterminal ( \"r\" ) ) , optional ( terminal ( \"\" ) ) , oneOrMore (terminal(\"many\")),zeroOrMore (terminal(\"any\")) );"` |
| railroad      | [railroad.md:572](./docs/railroad.ja.md#呼出し)                                | `"railroad-beta\nr=sequence ( terminal ( \"first\" ) , choice ( special ( \"note\" ),nonterminal ( \"r\" ) ) , optional ( terminal ( \"\" ) ) , oneOrMore (terminal(\"many\")),zeroOrMore (terminal(\"any\")) );"` |
| railroad      | [railroad.md:1871](./docs/railroad.ja.md#セミコロン)                           | `"railroad-beta\n   r=terminal( \"sty%%{wrap foo\n     le\" );"`                                                                                                                                                   |
| railroad      | [railroad.md:1923](./docs/railroad.ja.md#セミコロン)                           | `"%%{init: {}}%%\nrailroad-beta\na =  terminal( \"x\" );\n b  =  terminal( \"style\" );\n"`                                                                                                                        |
| usecase       | [usecase.md:1018](./docs/usecase.ja.md#direction-and-accessibility)            | `usecase-beta\ndirection  TD\nA\ndirection\tBT\ndirection RL`                                                                                                                                                      |
| wardley       | [wardley.md:308](./docs/wardley.ja.md#装飾)                                    | `wardley-beta\ncomponent Decor[0.3,0.6]label[1,-2]( build )( inertia )`                                                                                                                                            |
| wardley       | [wardley.md:630](./docs/wardley.ja.md#アクセシビリティ)                        | `wardley-beta\naccTitle \t:  A  B \t\naccDescr\t:  C  D \t`                                                                                                                                                        |
| wardley       | [wardley.md:980](./docs/wardley.ja.md#セミコロン)                              | `"wardley-beta\nAlpha  -> Beta; style:#tone;"`                                                                                                                                                                     |

### 構造上の隙間の U+2028 と U+2029 をそろえるか

29 形が agentflow、block、class、compatibility、er、eventmodeling、flowchart、
ishikawa、kanban、quadrant、requirement、sequence、state にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                                   |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| agentflow     | [agentflow.md:203](./docs/agentflow.ja.md#names-and-headings)                  | `"agentflow-beta TB\nflow F\u2028[T]\nA\nend"`               |
| agentflow     | [agentflow.md:332](./docs/agentflow.ja.md#names-and-headings)                  | `"agentflow-beta TB\nflow\u2028F\nA\nend"`                   |
| block         | [block.md:1230](./docs/block.ja.md#行区切り文字)                               | `"block-beta\na\u2028b\n"`                                   |
| class         | [class.md:310](./docs/class.ja.md#トークンの間の空白)                          | `"classDiagram\nclass A\u2028:::c\n"`                        |
| class         | [class.md:334](./docs/class.ja.md#トークンの間の空白)                          | `"classDiagram\nclass A\u2028<<interface>>\n"`               |
| class         | [class.md:372](./docs/class.ja.md#トークンの間の空白)                          | `"classDiagram\nnote\u2028\"n\"\n"`                          |
| class         | [class.md:508](./docs/class.ja.md#トークンの間の空白)                          | `"classDiagram\nstyle A fill:red\u2028,stroke:blue\n"`       |
| class         | [class.md:591](./docs/class.ja.md#トークンの間の空白)                          | `"classDiagram\nclick A call f(\u2028)\n"`                   |
| compatibility | [compatibility.md:5686](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"block-beta\nA\u2028B\n"`                                   |
| er            | [er.md:1531](./docs/er.ja.md#subgraph)                                         | `"erDiagram\nsubgraph S\u2028[Title]\nA\nend\n"`             |
| eventmodeling | [eventmodeling.md:673](./docs/eventmodeling.ja.md#data-boundaries)             | `"eventmodeling\ndata D {\nx\n}\u2028tf 01 evt A\n"`         |
| flowchart     | [flowchart.md:1001](./docs/flowchart.ja.md#トークンの間の空白)                 | `"flowchart LR\nA\nstyle A fill:red\u2028,stroke:blue\n"`    |
| flowchart     | [flowchart.md:1196](./docs/flowchart.ja.md#トークンの間の空白)                 | `"flowchart LR\nA\nclick A call f(\u2028)\n"`                |
| flowchart     | [flowchart.md:1461](./docs/flowchart.ja.md#ラベルの内側の空白)                 | `"flowchart LR\nA-->\|\"x\"\u2028\|B\n"`                     |
| flowchart     | [flowchart.md:1973](./docs/flowchart.ja.md#複数行の文)                         | `"flowchart LR\nA\nclick A\u2028href \"u\"\n"`               |
| flowchart     | [flowchart.md:2943](./docs/flowchart.ja.md#方向)                               | `"graph\u2029LR\nA\n"`                                       |
| flowchart     | [flowchart.md:3032](./docs/flowchart.ja.md#subgraph-のヘッダー)                | `"flowchart LR\nsubgraph S\u2028[t]\nA\nend\n"`              |
| ishikawa      | [ishikawa.md:771](./docs/ishikawa.ja.md#line-separators)                       | `"ishikawa\nR\n A\n%%{}%%\u2028  B"`                         |
| kanban        | [kanban.md:1059](./docs/kanban.ja.md#空白文字)                                 | `"kanban\n S[x]%% c\u2028   A\n"`                            |
| kanban        | [kanban.md:1062](./docs/kanban.ja.md#空白文字)                                 | `"kanban\n S[x]%% c\u2028   A\n"`                            |
| quadrant      | [quadrant.md:1150](./docs/quadrant.ja.md#行区切り文字)                         | `"quadrantChart\nx-axis L \u2028--> R\n"`                    |
| requirement   | [requirement.md:1876](./docs/requirement.ja.md#行区切り文字)                   | `"requirementDiagram\nrequirement r\u2028{\nid: 1\n}\n"`     |
| sequence      | [sequence.md:330](./docs/sequence.ja.md#トークンの間の空白)                    | `"sequenceDiagram\nloop\u2028 x\nA->>B: y\nend\n"`           |
| sequence      | [sequence.md:780](./docs/sequence.ja.md#矢印の前後の空白)                      | `"sequenceDiagram\nA ->> + \u2028 B: x\n"`                   |
| sequence      | [sequence.md:1475](./docs/sequence.ja.md#行区切り)                             | `"sequenceDiagram\ntitle\u2028 ;\nA->>B: x\n"`               |
| state         | [state.md:530](./docs/state.ja.md#トークンの間の空白)                          | `"stateDiagram-v2\nA\u2028:::c\n"`                           |
| state         | [state.md:608](./docs/state.ja.md#トークンの間の空白)                          | `"stateDiagram-v2\nclassDef c fill:red\u2028,stroke:blue\n"` |
| state         | [state.md:1189](./docs/state.ja.md#ノート)                                     | `"stateDiagram-v2\nnote \"t\"\u2028as N\n"`                  |
| state         | [state.md:1922](./docs/state.ja.md#行区切り文字)                               | `"stateDiagram-v2\naccDescr {}\u2028 A\n"`                   |

### スタイルの内側を CSS として整えるか

15 形が block、class、compatibility、er、requirement、state、treemap、
venn にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| block         | [block.md:645](./docs/block.ja.md#スタイル)                                    | `"block-beta\nA\nstyle A fill:#f00 %%{init: {}}%% , stroke:#333\n"`                                                             |
| class         | [class.md:439](./docs/class.ja.md#トークンの間の空白)                          | `"classDiagram\nclass A\nstyle A fill #f00\nstyle A fill#f00\n"`                                                                |
| compatibility | [compatibility.md:705](./docs/compatibility.ja.md#サイト設定)                  | `"treemap\n\"A\": 1\nclassDef zz color  :red %%{init: {}}%%\n"`                                                                 |
| compatibility | [compatibility.md:978](./docs/compatibility.ja.md#サイト設定)                  | `"classDiagram\nclassDef c fill:abc\\ ,stroke:green\nclass A\ncssClass \"A\" c\n"`                                              |
| compatibility | [compatibility.md:3952](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"erDiagram\nCUSTOMER\nstyle \n%% style comment\nCUSTOMER fill:navy\n"`                                                         |
| compatibility | [compatibility.md:6714](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"treemap\nclassDef zz color:red , fill:blue,stroke:rgb(1\\,2\\,3),;"`                                                          |
| compatibility | [compatibility.md:6768](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"treemap\nclassDef zz color:red , fill:blue,stroke:rgb(1\\,2\\,3),;"`                                                          |
| er            | [er.md:1690](./docs/er.ja.md#スタイルとクラス)                                 | `"erDiagram\nstyle A fill#f00,  4px wide\nclassDef c bold,italic\n"`                                                            |
| er            | [er.md:1698](./docs/er.ja.md#スタイルとクラス)                                 | `"erDiagram\nA\nSTYLE A fill:#f00;\nCLASSDEF c fill:#f00;\nSTYLE A stroke:blue %%{init:\n{}}%%,fill:#f00;\nSTYLE A fill:red\n"` |
| er            | [er.md:2694](./docs/er.ja.md#複数行の文)                                       | `"erDiagram\nCUSTOMER\nstyle \n%% style comment\nCUSTOMER fill:navy\n"`                                                         |
| requirement   | [requirement.md:581](./docs/requirement.ja.md#スタイルとクラス)                | `"requirementDiagram\nrequirement r {\n}\nstyle r fill#f00,  4px wide\nclassDef c bold,italic\n"`                               |
| state         | [state.md:1649](./docs/state.ja.md#スタイル文の末尾のセミコロン)               | `"stateDiagram\nstyle A x%%{x:{}}%%:y;\n"`                                                                                      |
| treemap       | [treemap.md:381](./docs/treemap.ja.md#style-gaps)                              | `"treemap\nclassDef zz\n%% gap\n\"Apparent\":2"`                                                                                |
| treemap       | [treemap.md:464](./docs/treemap.ja.md#styles)                                  | `"treemap\nclassDef zz fill : #f00 %%{init: {}}%%\n\"Leaf\":1:::zz\n"`                                                          |
| venn          | [venn.md:642](./docs/venn.ja.md#style-properties)                              | `"venn-beta\nset A\nstyle A fill:rgb(1,%%{init: {\"x\": \")\"}}%%  2,3)\n"`                                                     |

### 構造を囲む区切りのすぐ内側の空白をどう印字するか

15 形が agentflow、architecture、c4、compatibility、er、flowchart、kanban、pie、
railroad、requirement、wardley にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| agentflow     | [agentflow.md:1243](./docs/agentflow.ja.md#accessibility)                      | `"agentflow-beta TB\naccDescr {%%{init: {}}%%}"`                                                                                   |
| architecture  | [architecture.md:556](./docs/architecture.ja.md#group-modifiers)               | `"architecture-beta\nservice a\nservice b\na  {group}:R -- L:b\t{group}\n"`                                                        |
| architecture  | [architecture.md:824](./docs/architecture.ja.md#comments)                      | `"architecture-beta\nservice percent \"A%%B\" [C%%D]\naccDescr {E%%F}\ntitle Topic%% inline\n"`                                    |
| c4            | [c4.md:414](./docs/c4.ja.md#文ごとに改行)                                      | `"C4Context\naccDescr {D}accDescr {}Person(a,\"A\")\n"`                                                                            |
| compatibility | [compatibility.md:4593](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"flowchart TD\naccDescr {%% c\nText\n}\n"`                                                                                        |
| compatibility | [compatibility.md:6386](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"gitGraph\naccDescr {%% c\nText\n}\n"`                                                                                            |
| er            | [er.md:152](./docs/er.ja.md#属性ブロック)                                      | `"erDiagram\n\"style:#x\"; B {\u00a0\n} A[\"x;y\"]\n"`                                                                             |
| er            | [er.md:258](./docs/er.ja.md#属性ブロック)                                      | `erDiagram\nT {int a} subgraph S accDescr {}\nend\nU { int a   } subgraph V accDescr {}\nend\nW {int a} accTitle:\ndirection LR\n` |
| flowchart     | [flowchart.md:2096](./docs/flowchart.ja.md#データブロック)                     | `"flowchart TD\nA@{shape: circle %%{init: {}}%%}\nB@{shape: rect}%%{init: {}}%%\nC@{shape: circle}\n"`                             |
| flowchart     | [flowchart.md:2116](./docs/flowchart.ja.md#データブロック)                     | `"flowchart LR\nA@{---x}\n"`                                                                                                       |
| kanban        | [kanban.md:537](./docs/kanban.ja.md#データブロック)                            | `"kanban\n S\n   A@{ticket: X %%{init: {}}%%}\n   B@{ticket: Y}%%{init: {}}%%\n   C@{ticket: Z}\n"`                                |
| pie           | [pie.md:277](./docs/pie.ja.md#description-blocks)                              | `"pie\naccDescr {%% c\nD}"`                                                                                                        |
| railroad      | [railroad.md:787](./docs/railroad.ja.md#長い行)                                | `"railroad-beta\n r=terminal( \"classDef\" );"`                                                                                    |
| requirement   | [requirement.md:1178](./docs/requirement.ja.md#アクセシビリティの文)           | `requirementDiagram\n%%{init: {}}%% accDescr {x}    accTitle:\ndirection LR\n`                                                     |
| wardley       | [wardley.md:655](./docs/wardley.ja.md#アクセシビリティ)                        | `"wardley-beta\naccDescr {%%{wrap}%%}"`                                                                                            |

### 空白だけの説明ブロックをどう書くか

13 形が class、cynefin、gantt、gitgraph、journey、quadrant、requirement、
sequence、timeline、treeview、usecase、xychart にある。

| 図種        | 規則の文書                                                          | 書かれた形                                                                                                 |
| ----------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| class       | [class.md:1714](./docs/class.ja.md#空の説明ブロック)                | `classDiagram\naccDescr {  } class A\naccDescr {\n\n} class B\naccDescr{} class C\naccDescr{  } class D\n` |
| cynefin     | [cynefin.md:519](./docs/cynefin.ja.md#description-blocks)           | `"cynefin-beta\naccDescr { \t\n \n}\nclear \"AfterEmpty\""`                                                |
| gantt       | [gantt.md:1267](./docs/gantt.ja.md#空の説明ブロック)                | `gantt\naccDescr{}\naccDescr {}\naccDescr{ }\n`                                                            |
| gitgraph    | [gitgraph.md:485](./docs/gitgraph.ja.md#title-and-common-values)    | `"gitGraph\naccDescr {  }\naccDescr {\n\n}\naccDescr{}\naccDescr{  }\n"`                                   |
| journey     | [journey.md:682](./docs/journey.ja.md#空の説明ブロック)             | `journey\naccDescr{}\naccDescr {}\naccDescr{ }\n`                                                          |
| quadrant    | [quadrant.md:770](./docs/quadrant.ja.md#空の説明ブロック)           | `"quadrantChart\naccDescr{}\naccDescr {}\naccDescr{ }\n"`                                                  |
| requirement | [requirement.md:1041](./docs/requirement.ja.md#空の説明ブロック)    | `requirementDiagram\naccDescr{}\naccDescr{ }\naccDescr {}\n`                                               |
| requirement | [requirement.md:1432](./docs/requirement.ja.md#トークンの間の空白)  | `requirementDiagram\naccDescr   {   }\nrequirement r {\nid: 1\n}\nstyle   r   fill:red\nclass   r   c\n`   |
| sequence    | [sequence.md:1704](./docs/sequence.ja.md#複数行の値)                | `sequenceDiagram\naccDescr {  }\naccDescr {\n\n}\naccDescr{}\naccDescr{  }\n`                              |
| timeline    | [timeline.md:1072](./docs/timeline.ja.md#空の説明ブロック)          | `timeline\naccDescr{}\naccDescr {}\naccDescr{ }\n`                                                         |
| treeview    | [treeview.md:1887](./docs/treeview.ja.md#description-blocks)        | `treeView-beta\naccDescr { \t\n }\nR\n`                                                                    |
| usecase     | [usecase.md:1067](./docs/usecase.ja.md#direction-and-accessibility) | `usecase-beta\naccDescr {\n\n\n}\naccDescr {}\naccTitle:\nAfter`                                           |
| xychart     | [xychart.md:768](./docs/xychart.ja.md#空の説明ブロック)             | `"xychart\naccDescr{}\naccDescr {}\naccDescr{ }\n"`                                                        |

### 説明をブロックかコロンの行で書くか

13 形が architecture、compatibility、cynefin、packet、radar、railroad、state、
treemap、treeview、wardley にある。

| 図種          | 規則の文書                                                             | 書かれた形                                                                                               |
| ------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| architecture  | [architecture.md:699](./docs/architecture.ja.md#description-blocks)    | `"architecture-beta\naccDescr {\n%% comment\n}\n"`                                                       |
| compatibility | [compatibility.md:2954](./docs/compatibility.ja.md#1-行の説明ブロック) | `"pie\naccDescr %%{init: {}}%% {a\nb}\n\"A\": 1\n"`                                                      |
| compatibility | [compatibility.md:2958](./docs/compatibility.ja.md#1-行の説明ブロック) | `"pie\naccDescr %%{init: {}}%% {a\nb}\n\"A\": 1\n"`                                                      |
| compatibility | [compatibility.md:3002](./docs/compatibility.ja.md#1-行の説明ブロック) | `"flowchart TD\naccDescr {}\n"`                                                                          |
| cynefin       | [cynefin.md:519](./docs/cynefin.ja.md#description-blocks)              | `"cynefin-beta\naccDescr {%%{wrap}%%}"`                                                                  |
| packet        | [packet.md:388](./docs/packet.ja.md#description-blocks)                | `"packet\naccDescr {\n A\n B\n}\n"`                                                                      |
| radar         | [radar.md:536](./docs/radar.ja.md#description-blocks)                  | `"radar-beta\naccDescr\n\n{ Words }\n"`                                                                  |
| railroad      | [railroad.md:1212](./docs/railroad.ja.md#説明ブロック)                 | `"railroad-beta\naccDescr {%%{wrap}%%}\naccDescr {\n%% removed block\n}\nr=terminal(\"trivia block\");"` |
| state         | [state.md:1151](./docs/state.ja.md#ノート)                             | `"stateDiagram-v2\n A\n   note   right of    A   \n       end note\n B\n"`                               |
| treemap       | [treemap.md:880](./docs/treemap.ja.md#description-blocks)              | `"treemap\naccDescr {\n%% block comment\n}\n\"AfterCommentBlock\":3"`                                    |
| treeview      | [treeview.md:1872](./docs/treeview.ja.md#description-blocks)           | `"treeView-beta\naccDescr {\nx─\n}\n"`                                                                   |
| treeview      | [treeview.md:1893](./docs/treeview.ja.md#description-blocks)           | `"treeView-beta\naccDescr%%{init: {}}%%{│}\nroot─\n"`                                                    |
| wardley       | [wardley.md:648](./docs/wardley.ja.md#アクセシビリティ)                | `"wardley-beta\naccDescr {%%{wrap}%%}"`                                                                  |

### 本体の文字列と開始・終了の区切り記号をどの行に置くか

10 形が c4、er、flowchart、kanban、radar、sequence、timeline、usecase にある。

| 図種      | 規則の文書                                                 | 書かれた形                                                                                                                           |
| --------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| c4        | [c4.md:1713](./docs/c4.ja.md#説明ブロック)                 | `"C4Context\naccDescr {first\n   second}\nPerson(a,\"A\")\n"`                                                                        |
| c4        | [c4.md:1736](./docs/c4.ja.md#説明ブロック)                 | `"C4Context\naccDescr {first\n   second}\nPerson(a,\"A\")\n"`                                                                        |
| er        | [er.md:258](./docs/er.ja.md#属性ブロック)                  | `"erDiagram\nT {int a} subgraph S accDescr {}\nend\nU { int a   } subgraph V accDescr {}\nend\nW {int a} accTitle:\ndirection LR\n"` |
| er        | [er.md:2816](./docs/er.ja.md#複数行の文)                   | `"erDiagram\nA\u2028%% c\nBar { int\na\nint b\n}\n"`                                                                                 |
| flowchart | [flowchart.md:2259](./docs/flowchart.ja.md#データブロック) | `"flowchart LR\nA@{\n      label: Alpha }\n"`                                                                                        |
| kanban    | [kanban.md:558](./docs/kanban.ja.md#データブロック)        | `"kanban\nS\n  A@{\n       ticket: A }\n"`                                                                                           |
| radar     | [radar.md:536](./docs/radar.ja.md#description-blocks)      | `"radar-beta\naccDescr {\n%% only comment\n}\n"`                                                                                     |
| sequence  | [sequence.md:1744](./docs/sequence.ja.md#複数行の値)       | `"sequenceDiagram\nparticipant A@{\n         \"type\": \"queue\" }\n"`                                                               |
| timeline  | [timeline.md:1257](./docs/timeline.ja.md#複数行の値)       | `"timeline\naccDescr {a\nb\n\nc\n}\n"`                                                                                               |
| usecase   | [usecase.md:811](./docs/usecase.ja.md#json-tables)         | `"usecase-beta\njson A @{\n        \"name\": \"Alpha\" }\n"`                                                                         |

### 文の中のどの物理行の改行をつなぐか

41 形が agentflow、class、compatibility、er、eventmodeling、flowchart、gantt、
gitgraph、info、journey、quadrant、radar、railroad、requirement、sequence、
state、treemap にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| agentflow     | [agentflow.md:1179](./docs/agentflow.ja.md#accessibility)                      | `"agentflow-beta TB\naccTitle:\n%%{init: {}}%%\nT"`                                                                                           |
| agentflow     | [agentflow.md:1351](./docs/agentflow.ja.md#multiline-statements-and-values)    | `"agentflow-beta TB\nA-->\nB"`                                                                                                                |
| agentflow     | [agentflow.md:1831](./docs/agentflow.ja.md#click-statements)                   | `"agentflow-beta TB\nA\nclick A\ncb"`                                                                                                         |
| class         | [class.md:1551](./docs/class.ja.md#複数行の文)                                 | `"classDiagram\ndirection\n%% c\nLR\n"`                                                                                                       |
| compatibility | [compatibility.md:5798](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"flowchart TD\nA\u2028%% c\n-->\n\nB\n"`                                                                                                     |
| compatibility | [compatibility.md:7147](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"railroad-beta\nr=terminal(\"x\");\n"`                                                                                                       |
| er            | [er.md:1728](./docs/er.ja.md#スタイルとクラス)                                 | `"erDiagram\nclassDef a fill:red \nA\nstyle B fill:blue\t\nC\nclassDef c fill:red \n\n  D\n"`                                                 |
| er            | [er.md:1730](./docs/er.ja.md#スタイルとクラス)                                 | `"erDiagram\nclassDef a fill:red \nA\nstyle B fill:blue\t\nC\nclassDef c fill:red \n\n  D\n"`                                                 |
| er            | [er.md:1741](./docs/er.ja.md#スタイルとクラス)                                 | `"erDiagram\nclassDef a fill:red\u000b\nA\n"`                                                                                                 |
| er            | [er.md:2688](./docs/er.ja.md#複数行の文)                                       | `"erDiagram\ndirection\n%%{init: {}}%%\nLR\naccTitle:\n%%{init: {}}%%\nT\n"`                                                                  |
| eventmodeling | [eventmodeling.md:395](./docs/eventmodeling.ja.md#declarations-and-notes)      | ``eventmodeling data\nD\n` text `\n{\nvalue\n}\nnote\n01\n{\n}\n``                                                                            |
| eventmodeling | [eventmodeling.md:396](./docs/eventmodeling.ja.md#declarations-and-notes)      | ``eventmodeling data\nD\n` text `\n{\nvalue\n}\nnote\n01\n{\n}\n``                                                                            |
| flowchart     | [flowchart.md:1450](./docs/flowchart.ja.md#ラベルの内側の空白)                 | `"flowchart LR\nA[\"x\"\n]\nB[\"x\"\n%% c\n]\nC[\"x\" %%{x}%% ]\nD[\"x\"%%{x}%%]\n"`                                                          |
| flowchart     | [flowchart.md:1927](./docs/flowchart.ja.md#複数行の文)                         | `"flowchart LR\n  A -->\nB -->\n      C\n"`                                                                                                   |
| flowchart     | [flowchart.md:1930](./docs/flowchart.ja.md#複数行の文)                         | `"flowchart LR\n  A -->\nB -->\n      C\n"`                                                                                                   |
| flowchart     | [flowchart.md:2984](./docs/flowchart.ja.md#subgraph-のヘッダー)                | `"flowchart LR\nsubgraph S[ T\n]\nA\nend\nsubgraph U[ T\n%% c\n]\nB\nend\n"`                                                                  |
| gantt         | [gantt.md:1339](./docs/gantt.ja.md#複数行の文)                                 | `"gantt\nclick id1 call f(1,\n 2)\n"`                                                                                                         |
| gitgraph      | [gitgraph.md:485](./docs/gitgraph.ja.md#title-and-common-values)               | `"gitGraph\naccDescr %%{wrap}%%\n{ a }\n"`                                                                                                    |
| gitgraph      | [gitgraph.md:833](./docs/gitgraph.ja.md#line-terminators-and-unicode)          | `(built) "gitGraph\naccDescr\n{A\nB}\n"`                                                                                                      |
| info          | [info.md:14](./docs/info.ja.md#header)                                         | `"info\n%% c\nshowInfo"`                                                                                                                      |
| info          | [info.md:106](./docs/info.ja.md#title)                                         | `"info\ntitle\naccTitle: A"`                                                                                                                  |
| info          | [info.md:149](./docs/info.ja.md#accessibility-lines)                           | `"info\naccTitle:\n\naccDescr: D"`                                                                                                            |
| journey       | [journey.md:750](./docs/journey.ja.md#複数行の文)                              | `"journey\nsection S\naccTitle:\n%%{init: {}}%% T\naccDescr\n%% colon\n:\n%% text\nD\nA:5:Me\n"`                                              |
| quadrant      | [quadrant.md:414](./docs/quadrant.ja.md#点)                                    | `"quadrantChart\nA: [0.3,\n%%{init: {}}%%\n0.6]\n"`                                                                                           |
| quadrant      | [quadrant.md:826](./docs/quadrant.ja.md#複数行の文)                            | `"quadrantChart\nA: [0.3, \n%%{init: {}}%%\n0.6]\n"`                                                                                          |
| radar         | [radar.md:242](./docs/radar.ja.md#multi-line-statements)                       | `"radar-beta\ncurve trial{4,\n%% entry note\n5\n}\n"`                                                                                         |
| radar         | [radar.md:724](./docs/radar.ja.md#hidden-forms)                                | `"radar-beta\naxis North%%{!open}%%\n[%%{!value}%%\n\"N\"%%{!close}%%\n]\n"`                                                                  |
| radar         | [radar.md:726](./docs/radar.ja.md#hidden-forms)                                | `"radar-beta\naxis North%%{!open}%%\n[%%{!value}%%\n\"N\"%%{!close}%%\n]\n"`                                                                  |
| railroad      | [railroad.md:755](./docs/railroad.ja.md#長い行)                                | `"railroad-beta\nr\n=\nsequence\n(terminal\n(\n\"joined\"\n)\n,\nterminal(\"tail\")\n)\n;"`                                                   |
| railroad      | [railroad.md:756](./docs/railroad.ja.md#長い行)                                | `"railroad-beta\nconstructor=terminal/* call */(\"x\");\ncloser=terminal(\"x\"/* close */);\n"`                                               |
| railroad      | [railroad.md:788](./docs/railroad.ja.md#長い行)                                | `"railroad-ebnf-beta\nexpression =\n (term, { (\"+\" \| \"-\"), term })\n \| (\"(\", expression, \")\")\n \|\n number;\n"`                    |
| railroad      | [railroad.md:790](./docs/railroad.ja.md#長い行)                                | `"railroad-ebnf-beta\nexpression =\n (term, { (\"+\" \| \"-\"), term })\n \| (\"(\", expression, \")\")\n \|\n number;\n"`                    |
| railroad      | [railroad.md:790](./docs/railroad.ja.md#長い行)                                | `"railroad-ebnf-beta\nexpression =\n (term, { (\"+\" \| \"-\"), term })\n \| (\"(\", expression, \")\")\n \|\n number;\n"`                    |
| railroad      | [railroad.md:1212](./docs/railroad.ja.md#説明ブロック)                         | `"railroad-beta\naccDescr\n{\n   first\n\n  continuation\n}\nr=terminal(\"description\");"`                                                   |
| requirement   | [requirement.md:120](./docs/requirement.ja.md#本体)                            | `"requirementDiagram\nrequirement \n%%{init: {}}%%\ncheckout {\nid: 1\n}\n"`                                                                  |
| requirement   | [requirement.md:1348](./docs/requirement.ja.md#複数行の文)                     | `"requirementDiagram\nrequirement \n%%{init: {}}%%\ncheckout {\nid: 1\n}\n"`                                                                  |
| sequence      | [sequence.md:773](./docs/sequence.ja.md#矢印の前後の空白)                      | `"sequenceDiagram\nA ->> + \n%% c\n  B: a\nB ->> - \n%% c\nA: b\nA () \n%% c\n->> B: c\nA ->> () \n%% c\nB: d\nNote over A , \n%% c\nB: e\n"` |
| sequence      | [sequence.md:1662](./docs/sequence.ja.md#複数行の文)                           | `"sequenceDiagram\nloop x\nAlice -->> \n%% between\n  Bob: hi\nBob ->> \n%%{init: {}}%%\nAlice: y\nend\n"`                                    |
| state         | [state.md:77](./docs/state.ja.md#複合状態)                                     | `"stateDiagram-v2\nstate D %%{init: {}}%%\n{\nE\n}\n"`                                                                                        |
| state         | [state.md:1798](./docs/state.ja.md#複数行の文)                                 | `"stateDiagram-v2\ndirection\n%% c\nLR\n"`                                                                                                    |
| treemap       | [treemap.md:378](./docs/treemap.ja.md#style-gaps)                              | `"treemap\nclassDef zz\n%% gap\n\"Apparent\":2"`                                                                                              |

### 同じ行にある文やヘッダーを別の行に分けるか

32 形が block、compatibility、cynefin、er、eventmodeling、gitgraph、info、pie、
quadrant、radar、railroad、sequence、venn、wardley、xychart にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| block         | [block.md:166](./docs/block.ja.md#行)                                          | `"block-beta\ncolumns 3\na b c\nd   e   f\n"`                                                                                           |
| block         | [block.md:176](./docs/block.ja.md#行)                                          | `"block-beta\ncolumns 3\na b c\nd   e   f\n"`                                                                                           |
| block         | [block.md:182](./docs/block.ja.md#行)                                          | `"block-beta\ncolumns 3\na b c\nd   e   f\n"`                                                                                           |
| compatibility | [compatibility.md:2809](./docs/compatibility.ja.md#1-行の説明ブロック)         | `"flowchart TD\naccDescr {a} B[\"x;y\"]\n"`                                                                                             |
| compatibility | [compatibility.md:2818](./docs/compatibility.ja.md#1-行の説明ブロック)         | `"flowchart TD\nA --> B; accDescr {a;b}\n"`                                                                                             |
| compatibility | [compatibility.md:4948](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"erDiagram\n\u2028A direction LR\nA\n"`                                                                                                |
| compatibility | [compatibility.md:7155](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"railroad-beta\nr=terminal(\"style\");\ns=terminal(\"x\");\n"`                                                                         |
| compatibility | [compatibility.md:7198](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"railroad-beta\nr=terminal(\"style\");s=terminal(\"x\");\n"`                                                                           |
| cynefin       | [cynefin.md:27](./docs/cynefin.ja.md#header)                                   | `"cynefin-beta complex \"A\" %%{{x}}%%\n"`                                                                                              |
| cynefin       | [cynefin.md:655](./docs/cynefin.ja.md#hidden-boundaries)                       | `"cynefin-beta complex \"A\" %%{{x}}%%\n"`                                                                                              |
| er            | [er.md:1536](./docs/er.ja.md#subgraph)                                         | `"erDiagram\nsubgraph S accDescr {} accDescr {}\nA\nend\nsubgraph T [Title]   accDescr { }\nB\nend\nsubgraph U\naccDescr {}\nC\nend\n"` |
| eventmodeling | [eventmodeling.md:19](./docs/eventmodeling.ja.md#header)                       | `"eventmodeling tf 01 evt A %%{{x}}%%\n"`                                                                                               |
| eventmodeling | [eventmodeling.md:850](./docs/eventmodeling.ja.md#hidden-forms)                | `"eventmodeling gwt 01 given evt A %%{{x}}%%\nthen evt B\n"`                                                                            |
| eventmodeling | [eventmodeling.md:1099](./docs/eventmodeling.ja.md#semicolons)                 | `"eventmodeling gwt 01 given evt Alpha /*style:#x;*/then cmd Beta"`                                                                     |
| eventmodeling | [eventmodeling.md:1104](./docs/eventmodeling.ja.md#semicolons)                 | `"eventmodeling accDescr {x\ny;} tf 17 evt End\n"`                                                                                      |
| gitgraph      | [gitgraph.md:152](./docs/gitgraph.ja.md#blank-lines)                           | `"gitGraph title style:#a;b\n"`                                                                                                         |
| gitgraph      | [gitgraph.md:779](./docs/gitgraph.ja.md#semicolons)                            | `"gitGraph title style:#a;b\n"`                                                                                                         |
| info          | [info.md:543](./docs/info.ja.md#blank-lines)                                   | `"info title style:#a;b"`                                                                                                               |
| pie           | [pie.md:511](./docs/pie.ja.md#directives-and-semicolons)                       | `"pie title style:#a;b"`                                                                                                                |
| pie           | [pie.md:565](./docs/pie.ja.md#blank-lines)                                     | `"pie title style:#a;b"`                                                                                                                |
| quadrant      | [quadrant.md:114](./docs/quadrant.ja.md#1-行-1-文)                             | `"quadrantChart x-axis style; title a:#b;c\n"`                                                                                          |
| radar         | [radar.md:805](./docs/radar.ja.md#hidden-boundaries)                           | `"radar-beta\naxis North%%{!suffix}%%\ncurve trial{4}\n"`                                                                               |
| radar         | [radar.md:806](./docs/radar.ja.md#hidden-boundaries)                           | `"radar-beta\naxis North%%{!suffix}%%\ncurve trial{4}\n"`                                                                               |
| radar         | [radar.md:908](./docs/radar.ja.md#semicolons)                                  | `"radar-beta title style:#red;;\n"`                                                                                                     |
| railroad      | [railroad.md:20](./docs/railroad.ja.md#見出し)                                 | `"railroad-abnf-beta%%{!heading}%%\nr=\"x\";"`                                                                                          |
| sequence      | [sequence.md:1201](./docs/sequence.ja.md#コメント)                             | `"sequenceDiagram\naccDescr {} A->>B: x #a; \n"`                                                                                        |
| sequence      | [sequence.md:1318](./docs/sequence.ja.md#コメント)                             | `"sequenceDiagram\nloop style:#x;; loop x; A->>B: body; end #;  \nend\n"`                                                               |
| venn          | [venn.md:956](./docs/venn.ja.md#directives)                                    | `"venn-beta%%{init: {}}%% set A[style:#x;y]"`                                                                                           |
| wardley       | [wardley.md:17](./docs/wardley.ja.md#見出し)                                   | `"wardley-beta pipeline Parent { %%{!x}%%\n\ncomponent Child[0.5]\n}\ncomponent Parent[0.3,0.6]\n"`                                     |
| wardley       | [wardley.md:736](./docs/wardley.ja.md#hidden-の境界)                           | `"wardley-beta component HeaderSuffix[0.3,0.6]%%{!suffix}%%\n\ncomponent HeaderAfter[0.4,0.7]"`                                         |
| wardley       | [wardley.md:740](./docs/wardley.ja.md#hidden-の境界)                           | `"wardley-beta pipeline Parent { %%{!x}%%\n\ncomponent Child[0.5]\n}\ncomponent Parent[0.3,0.6]\n"`                                     |
| xychart       | [xychart.md:103](./docs/xychart.ja.md#1-行-1-文)                               | `"xychart title \"style:#c;d\" line [1];\n"`                                                                                            |

### 長い文とデータブロックを printWidth で折り返すか

6 形が flowchart、kanban、treeview にある。

| 図種      | 規則の文書                                                 | 書かれた形                                                                                                                                                  |
| --------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| flowchart | [flowchart.md:1718](./docs/flowchart.ja.md#折り返し)       | `"flowchart LR\n  AAAAAAAAAAAAAAAAAAAA --> BBBBBBBBBBBBBBBBBBBB --> CCCCCCCCCCCCCCCCCCCC --> DDDDDDDDDDDDDDDDDDDD\n"`                                       |
| flowchart | [flowchart.md:2146](./docs/flowchart.ja.md#データブロック) | `"flowchart LR\nA[\"A label of the node that is so long that the first line cannot fit within eighty columns\"]@{ shape: rect, pos: \"t\" }\n"`             |
| flowchart | [flowchart.md:2154](./docs/flowchart.ja.md#データブロック) | `"flowchart LR\nA@{ shape: rect,\t\t\t\tlabel: x }\n"`                                                                                                      |
| flowchart | [flowchart.md:2183](./docs/flowchart.ja.md#データブロック) | `"flowchart LR\nsubgraph S\nA@{ shape: rect, label: \"A long label for the step\", pos: \"t\", h: 60 }\nend\n"`                                             |
| kanban    | [kanban.md:535](./docs/kanban.ja.md#データブロック)        | `"kanban\n  todo[Todo]\n    t1[Write the release notes for version two of the product that is released this month]@{ ticket: PR-101, priority: 'High' }\n"` |
| treeview  | [treeview.md:2681](./docs/treeview.ja.md#long-lines)       | `"treeView-beta\nR :::long-class-name icon(long-pack:long-icon-name) ## long description with words\n"`                                                     |

### 桁をそろえるための余白をどう書くか

9 形が compatibility、gantt、journey、printed-form、timeline にある。

| 図種          | 規則の文書                                                              | 書かれた形                                                                                                                                                 |
| ------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| compatibility | [compatibility.md:1230](./docs/compatibility.ja.md#サイト設定)          | `"timeline\n2020    : e   \n"`                                                                                                                             |
| compatibility | [compatibility.md:1238](./docs/compatibility.ja.md#サイト設定)          | `"journey\nsection Tea\nMake tea    : 5: Me\nDrink tea   : 5: Me\n"`                                                                                       |
| gantt         | [gantt.md:342](./docs/gantt.ja.md#タスクのデータ)                       | `"gantt\n  section S\n    Short:a1, 2014-01-01, 3d\n    A\tb   :a2, after a1, 2d\n    A longer name   :a3, after a2, 1d\n"`                                |
| gantt         | [gantt.md:402](./docs/gantt.ja.md#タスクのデータ)                       | `"gantt\n  section S\n    Short   :a1, 2014-01-01, 3d\n    A\tb   :a2, after a1, 2d\n    A longer name   :a3, after a2, 1d\n"`                             |
| gantt         | [gantt.md:412](./docs/gantt.ja.md#タスクのデータ)                       | `"gantt\n  section S\n    Short:a1, 2014-01-01, 3d\n    %%{init: {}}%% A task:a2, after a1, 2d\n    A longer name:a3, after a2, 1d\n"`                     |
| gantt         | [gantt.md:419](./docs/gantt.ja.md#タスクのデータ)                       | `"gantt\n  section S\n    Short   :a1, 2014-01-01, 3d\n    A task %%{init:\n      {}}%% more  :a2, after a1, 2d\n    A longer name   :a3, after a2, 1d\n"` |
| journey       | [journey.md:292](./docs/journey.ja.md#タスクのデータ)                   | `"journey\nMake tea        : 5: Me\nGo upstairs      : 3: Me\nDo work          : 1: Me, Cat\n"`                                                            |
| printed-form  | [printed-form.md:170](./docs/printed-form.ja.md#桁をそろえるための余白) | `"timeline\nA    : x\nLong : y"`                                                                                                                           |
| timeline      | [timeline.md:408](./docs/timeline.ja.md#period-と-event)                | `"timeline\nsection S\nab\t : first\n: second\n"`                                                                                                          |

### 構造上の行、コメント、directive をどう字下げするか

61 形が architecture、block、compatibility、cynefin、er、eventmodeling、
flowchart、gitgraph、journey、mindmap、quadrant、radar、railroad、requirement、
state、timeline、treemap、venn、wardley、xychart にある。

| 図種          | 規則の文書                                                                                           | 書かれた形                                                                                                                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| architecture  | [architecture.md:792](./docs/architecture.ja.md#comments)                                            | `%% lead\narchitecture-beta\n%% alone\nservice a%%touch\nservice b   %% separated  \n`                                                                                                                                      |
| architecture  | [architecture.md:834](./docs/architecture.ja.md#global-directives)                                   | `"architecture-beta\n%%{init: {\"architecture\": {\"iconSize\": 24}}}%%\nservice a\n"`                                                                                                                                      |
| architecture  | [architecture.md:890](./docs/architecture.ja.md#hidden-forms)                                        | `architecture-beta\n%%{!opaque\nbody}%%\nservice body_directive\n`                                                                                                                                                          |
| block         | [block.md:879](./docs/block.ja.md#複数行の文)                                                        | `"block-beta\nblock:\n%% head\nG[\"group\"]\ncolumns\n%% count\n2\nA\n%% shape\n[\"first\n raw\"] -->\n%% target\nB\nclass\n%% ids\nA hot\nstyle\n%% styled id\nA fill:red\nclassDef\n%% class name\nhot fill:blue\nend\n"` |
| compatibility | [compatibility.md:3871](./docs/compatibility.ja.md#コメントやディレクティブの前後の構造の継続行)     | `requirementDiagram\nrequirement r {\naccDescr {\n%% c\n}\nid: 1\n}\n`                                                                                                                                                      |
| compatibility | [compatibility.md:3879](./docs/compatibility.ja.md#コメントやディレクティブの前後の構造の継続行)     | `requirementDiagram\nrequirement r {\naccDescr {\n%%{init: {}}%%\n}\nid: 1\n}\n`                                                                                                                                            |
| compatibility | [compatibility.md:3885](./docs/compatibility.ja.md#コメントやディレクティブの前後の構造の継続行)     | `stateDiagram-v2\nstate D\n%% c\n{\nE\n}\n`                                                                                                                                                                                 |
| compatibility | [compatibility.md:3897](./docs/compatibility.ja.md#コメントやディレクティブの前後の構造の継続行)     | `gantt\nsection S\nweekday\n%% day\nmonday\nweekend\n%% end\nfriday\nincludes\n%% included\n2024-01-01\nexcludes\n%% excluded\nweekends\naccTitle:\n%% title\nT\naccDescr\n%% colon\n:\n%% description\nD\n`                |
| compatibility | [compatibility.md:3920](./docs/compatibility.ja.md#コメントやディレクティブの前後の構造の継続行)     | `stateDiagram-v2\nstate \n%% checkout states\nCheckout {\nIdle --> Paid\n}\n`                                                                                                                                               |
| compatibility | [compatibility.md:3929](./docs/compatibility.ja.md#コメントやディレクティブの前後の構造の継続行)     | `eventmodeling\ndata\n// payload\nCart {\n  sku: SHIRT-M\n}\nnote\n// payment note\n01 {\n  Payment received\n}\n`                                                                                                          |
| compatibility | [compatibility.md:3930](./docs/compatibility.ja.md#コメントやディレクティブの前後の構造の継続行)     | `eventmodeling\ntf 01 evt Checkout [[Cart]]\ndata\n%%{wrap}%%\nCart {\n  sku: SHIRT-M\n    quantity: 2\n}\n`                                                                                                                |
| compatibility | [compatibility.md:3932](./docs/compatibility.ja.md#ほかに書かれたまま残すもの)                       | `"eventmodeling\ndata\n// payload\nCart {\n  sku: SHIRT-M\n}\nnote\n// payment note\n01 {\n  Payment received\n}\n"`                                                                                                        |
| compatibility | [compatibility.md:3940](./docs/compatibility.ja.md#コメントやディレクティブの前後の構造の継続行)     | `eventmodeling\ngwt\n// scenario\n01 given evt Added then cmd Charge\n`                                                                                                                                                     |
| compatibility | [compatibility.md:4520](./docs/compatibility.ja.md#複数行の-sequence-の文)                           | `sequenceDiagram\nloop x\nAlice -->> \n%% between\n  Bob: hi\nBob ->> \n%%{init: {}}%%\nAlice: y\nend\n`                                                                                                                    |
| compatibility | [compatibility.md:5512](./docs/compatibility.ja.md#単位引用符字句解析器で決まる-xy-チャートの行)     | `xychart\ntitle A \n%% c\nB\nline [1]\n`                                                                                                                                                                                    |
| compatibility | [compatibility.md:5600](./docs/compatibility.ja.md#テキスト引用符字句解析器で決まる象限チャートの行) | `quadrantChart\nA: [0.3, \n%% c\n0.6]\n`                                                                                                                                                                                    |
| compatibility | [compatibility.md:5678](./docs/compatibility.ja.md#空白や字句解析器で決まるブロック図の行)           | `block-beta\nA -->\n%% c\nB\n`                                                                                                                                                                                              |
| compatibility | [compatibility.md:5993](./docs/compatibility.ja.md#c4-の引数の単位と物理行)                          | `"C4Context accDescr {\n%% c\n}\nPerson(a,\"A\")\n"`                                                                                                                                                                        |
| compatibility | [compatibility.md:6000](./docs/compatibility.ja.md#c4-の引数の単位と物理行)                          | `"C4Context\naccDescr   :%%{wrap}%% D\naccTitle\n%% colon\n:\n%%{wrap}%% T\nPerson(a,\"A\")\n"`                                                                                                                             |
| compatibility | [compatibility.md:6661](./docs/compatibility.ja.md#radar-の原文の群と-hidden-境界)                   | `radar-beta\ncurve trial{4,\n%% entry note\n5\n}\n`                                                                                                                                                                         |
| cynefin       | [cynefin.md:14](./docs/cynefin.ja.md#header)                                                         | `"  cynefin-beta complex \"Header\""`                                                                                                                                                                                       |
| cynefin       | [cynefin.md:568](./docs/cynefin.ja.md#hidden-forms)                                                  | `"cynefin-beta\ncomplex\n---\nempty-body-owner\n---\nclear \"OtherOwner\""`                                                                                                                                                 |
| cynefin       | [cynefin.md:569](./docs/cynefin.ja.md#hidden-forms)                                                  | `"cynefin-beta\ncomplex\n%%{!leading-owner}%%\n\"LeadingChild\""`                                                                                                                                                           |
| cynefin       | [cynefin.md:806](./docs/cynefin.ja.md#global-directives)                                             | `"cynefin-beta\n%%{init: {\"cynefin\":{\"width\":1000}}}%%\nclear \"Configured\""`                                                                                                                                          |
| cynefin       | [cynefin.md:842](./docs/cynefin.ja.md#comments)                                                      | `"cynefin-beta\n%% body note\ncomplex \"BodyComment\""`                                                                                                                                                                     |
| er            | [er.md:1942](./docs/er.ja.md#アクセシビリティの文)                                                   | `"erDiagram\n    A accTitle:\ndirection LR\n"`                                                                                                                                                                              |
| eventmodeling | [eventmodeling.md:77](./docs/eventmodeling.ja.md#indentation)                                        | `eventmodeling\ndata\n// payload\nCart {\n  sku: SHIRT-M\n}\nnote\n// payment note\n01 {\n  Payment received\n}\n`                                                                                                          |
| eventmodeling | [eventmodeling.md:366](./docs/eventmodeling.ja.md#declarations-and-notes)                            | `"eventmodeling\ndata\n// payload\nCart {\n  sku: SHIRT-M\n}\nnote\n// payment note\n01 {\n  Payment received\n}\n"`                                                                                                        |
| eventmodeling | [eventmodeling.md:518](./docs/eventmodeling.ja.md#data-blocks)                                       | ``"eventmodeling data ---\nn\n---\nD ---\nv\n---\n` ---\nt\n---\ntext ---\nc\n---\n` ---\nb\n---\n{\nx\n}\n"``                                                                                                              |
| eventmodeling | [eventmodeling.md:842](./docs/eventmodeling.ja.md#hidden-forms)                                      | `"eventmodeling tf ---\na\n---\n01 %%{{x}}%%\nevt ---\nb\n---\nAlpha"`                                                                                                                                                      |
| eventmodeling | [eventmodeling.md:845](./docs/eventmodeling.ja.md#hidden-forms)                                      | `(built) "eventmodeling\n  %%{{native}}%%\ntf 01 evt Alpha\n"`                                                                                                                                                              |
| eventmodeling | [eventmodeling.md:1030](./docs/eventmodeling.ja.md#global-directives)                                | `eventmodeling gwt 01 given evt Alpha %%{wrap}%%cmd Beta then ui Screen`                                                                                                                                                    |
| eventmodeling | [eventmodeling.md:1212](./docs/eventmodeling.ja.md#long-lines)                                       | `"eventmodeling tf 01 evt\n/* c */\nAlpha\n"`                                                                                                                                                                               |
| flowchart     | [flowchart.md:1941](./docs/flowchart.ja.md#複数行の文)                                               | `flowchart LR\nA -->\n%% a\n%% b\nB\n`                                                                                                                                                                                      |
| gitgraph      | [gitgraph.md:567](./docs/gitgraph.ja.md#comments)                                                    | `"\n%% c\n---\ntitle: Ignored\n---\ngitGraph\ncommit\n"`                                                                                                                                                                    |
| gitgraph      | [gitgraph.md:629](./docs/gitgraph.ja.md#hidden-yaml)                                                 | `"gitGraph\n---\nx\n--- \ncommit\n"`                                                                                                                                                                                        |
| gitgraph      | [gitgraph.md:944](./docs/gitgraph.ja.md#markdown-fences)                                             | Markdown が補うフェンス・リスト・引用の字下げと行末                                                                                                                                                                         |
| journey       | [journey.md:750](./docs/journey.ja.md#複数行の文)                                                    | `journey\nsection S\naccTitle:\n%%{init: {}}%% T\naccDescr\n%% colon\n:\n%% text\nD\nA:5:Me\n`                                                                                                                              |
| journey       | [journey.md:898](./docs/journey.ja.md#コメント)                                                      | `journey\ntitle T\n      # last`                                                                                                                                                                                            |
| mindmap       | [mindmap.md:660](./docs/mindmap.ja.md#コメント)                                                      | `(built) "   %% c\nmindmap\n  root\n"`                                                                                                                                                                                      |
| quadrant      | [quadrant.md:826](./docs/quadrant.ja.md#複数行の文)                                                  | `"quadrantChart\n\"first\n raw\": [0.3, \n%% y\n0.6]\n"`                                                                                                                                                                    |
| radar         | [radar.md:248](./docs/radar.ja.md#multi-line-statements)                                             | `"radar-beta\ncurve c[\"style:#a\"]{\n1\n} title tail;\n"`                                                                                                                                                                  |
| radar         | [radar.md:729](./docs/radar.ja.md#hidden-forms)                                                      | `"radar-beta\n---\nnot: [yaml\n---\naxis North\n"`                                                                                                                                                                          |
| railroad      | [railroad.md:105](./docs/railroad.ja.md#字下げ)                                                      | `"railroad-abnf-beta\n r=\"first\" ; content; protected\n \"last\";\n"`                                                                                                                                                     |
| railroad      | [railroad.md:790](./docs/railroad.ja.md#長い行)                                                      | `"railroad-ebnf-beta\nexpression =\n (term, { (\"+\" \| \"-\"), term })\n \| (\"(\", expression, \")\")\n \|\n number;\n"`                                                                                                  |
| railroad      | [railroad.md:1326](./docs/railroad.ja.md#コメント)                                                   | `"railroad-beta\nr=sequence(\n/* opening\n  inner column */\nterminal(\"a\"),\n\n%% between\n/* next */ terminal(\"b\")\n\n/* close */\n);\n"`                                                                              |
| railroad      | [railroad.md:1327](./docs/railroad.ja.md#コメント)                                                   | `"railroad-beta\nr=sequence(terminal(\"a\"),optional%% nested\n(terminal(\"b\")));\n"`                                                                                                                                      |
| railroad      | [railroad.md:1334](./docs/railroad.ja.md#コメント)                                                   | `"railroad-beta\nr=terminal\n/* constructor */(\"a\"\n/* closer */);\n"`                                                                                                                                                    |
| railroad      | [railroad.md:1861](./docs/railroad.ja.md#セミコロン)                                                 | `"railroad-abnf-beta\n r=\"first\" ; content; protected\n \"last\";\n"`                                                                                                                                                     |
| requirement   | [requirement.md:1178](./docs/requirement.ja.md#アクセシビリティの文)                                 | `"requirementDiagram\n    accDescr { x } accTitle:\ndirection LR\n"`                                                                                                                                                        |
| state         | [state.md:77](./docs/state.ja.md#複合状態)                                                           | `stateDiagram-v2\nstate D\n%% c\n{\nE\n}\n`                                                                                                                                                                                 |
| state         | [state.md:1910](./docs/state.ja.md#行区切り文字)                                                     | `"stateDiagram-v2\n%%{init: {}}%%\u2028 A\n"`                                                                                                                                                                               |
| timeline      | [timeline.md:433](./docs/timeline.ja.md#period-と-event)                                             | `timeline\n2004\n# before the first event\n: first\n%%{init: {}}%%\n# between events\n: second\n`                                                                                                                           |
| timeline      | [timeline.md:1145](./docs/timeline.ja.md#複数行の文)                                                 | `timeline\nsection S\naccTitle:\n%% title\nT\naccDescr\n%% colon\n:\n%%{init: {}}%% D\na : b\n`                                                                                                                             |
| timeline      | [timeline.md:1354](./docs/timeline.ja.md#コメント)                                                   | `timeline\ntitle T\n      # last`                                                                                                                                                                                           |
| treemap       | [treemap.md:382](./docs/treemap.ja.md#style-gaps)                                                    | `"treemap\nclassDef hot\n%% appearance\ncolor:#f00;;\n\"Leaf\":1:::hot"`                                                                                                                                                    |
| treemap       | [treemap.md:789](./docs/treemap.ja.md#title)                                                         | `"treemap\n    title   Budget\n  \"A\": 1\n"`                                                                                                                                                                               |
| venn          | [venn.md:1237](./docs/venn.ja.md#final-newline)                                                      | `(built) "venn-beta\nset A"`                                                                                                                                                                                                |
| wardley       | [wardley.md:893](./docs/wardley.ja.md#コメント)                                                      | `  %% prefix\nwardley-beta\n%% ordinary \t\ncomponent Comments[0.3,0.6]`                                                                                                                                                    |
| xychart       | [xychart.md:774](./docs/xychart.ja.md#空の説明ブロック)                                              | `"xychart\naccDescr {\n%% c\n}\naccDescr {%%{init: {}}%%}\n"`                                                                                                                                                               |
| xychart       | [xychart.md:1064](./docs/xychart.ja.md#指令)                                                         | `"xychart\n    %%{init: {}}%%\ntitle T\n"`                                                                                                                                                                                  |

### 値とデータの本体の桁位置を字下げし直すか

9 形が agentflow、compatibility、eventmodeling、flowchart、sequence、state、
usecase にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                                                                                   |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| agentflow     | [agentflow.md:828](./docs/agentflow.ja.md#metadata-blocks)                     | `"agentflow-beta TB\nA-->\nB@{\nx: 1\n}"`                                                                    |
| agentflow     | [agentflow.md:830](./docs/agentflow.ja.md#metadata-blocks)                     | `"agentflow-beta TB\nconnector C@{}@{\nx: 1\n}"`                                                             |
| compatibility | [compatibility.md:3930](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"eventmodeling\ndata\n// payload\nCart {\n      <b>Payment received</b>\n}\n"`                              |
| eventmodeling | [eventmodeling.md:569](./docs/eventmodeling.ja.md#data-blocks)                 | `"eventmodeling tf 01 evt Alpha [[D]] data D {\n}\ntf 02 evt Beta\n}\n"`                                     |
| flowchart     | [flowchart.md:2322](./docs/flowchart.ja.md#データブロック)                     | `"flowchart LR\nA -->\nB@{\nlabel: Beta\n}\n"`                                                               |
| sequence      | [sequence.md:1745](./docs/sequence.ja.md#複数行の値)                           | `"sequenceDiagram\nparticipant A@{\n\"type\": \"queue\"\n}\n"`                                               |
| sequence      | [sequence.md:1756](./docs/sequence.ja.md#複数行の値)                           | `"sequenceDiagram\n  box Aqua G\n    participant B\n  end; participant A@{\n    \"type\": \"actor\"\n  }\n"` |
| state         | [state.md:1099](./docs/state.ja.md#ノート)                                     | `"stateDiagram-v2\nA\nnote right of A  %%{init: {}}%%\n  first\n second\nend note\n"`                        |
| usecase       | [usecase.md:439](./docs/usecase.ja.md#stereotypes)                             | `"usecase-beta\nactor A << x\u2028%% c\n  y >>\n"`                                                           |

### 注釈を持ち主の行に結合するか

2 形が treeview にある。

| 図種     | 規則の文書                                                 | 書かれた形                                         |
| -------- | ---------------------------------------------------------- | -------------------------------------------------- |
| treeview | [treeview.md:1283](./docs/treeview.ja.md#annotation-lines) | `"treeView-beta\nR\n   :::hot\nC\n"`               |
| treeview | [treeview.md:1284](./docs/treeview.ja.md#annotation-lines) | `"treeView-beta\n├─ node\n%% between\n└─ ::: X\n"` |

### ガイドをノードの前後のどちらに置くか

1 形が treeview にある。

| 図種     | 規則の文書                                           | 書かれた形                                                  |
| -------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| treeview | [treeview.md:550](./docs/treeview.ja.md#decorations) | `"treeView-beta\n\"r─\"\n│\n└─ :::X\n%% after\n\"next\"\n"` |

### 項目の間の空行を何行残すか

31 形が architecture、block、cynefin、er、eventmodeling、gantt、gitgraph、info、
ishikawa、journey、kanban、pie、quadrant、radar、railroad、requirement、
timeline、treemap、treeview、usecase、venn、wardley、xychart にある。

| 図種          | 規則の文書                                                                        | 書かれた形                                                                                      |
| ------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| architecture  | [architecture.md:1046](./docs/architecture.ja.md#blank-lines)                     | `"architecture-beta\nservice a\n\nservice b\n"`                                                 |
| block         | [block.md:810](./docs/block.ja.md#スタイル文の末尾のセミコロン)                   | `"block\nA\nclassDef c fill:#f00;\n\n%% color\nstyle A fill:#f00;\n"`                           |
| cynefin       | [cynefin.md:881](./docs/cynefin.ja.md#blank-lines)                                | `"cynefin-beta\n\ncomplex \"BlankStart\"\n\n \t\n\n\"BlankEnd\"\n\n\n"`                         |
| er            | [er.md:1521](./docs/er.ja.md#subgraph)                                            | `erDiagram\nsubgraph S\nend\nsubgraph T\n\n\nend\nsubgraph U\n%% c\nend\n`                      |
| er            | [er.md:2415](./docs/er.ja.md#スタイル文の末尾のセミコロン)                        | `"erDiagram\nA\nclassDef c fill:#f00;\n\n%% color\nstyle A fill:#f00;\n"`                       |
| eventmodeling | [eventmodeling.md:671](./docs/eventmodeling.ja.md#data-boundaries)                | `"eventmodeling tf 01 evt Alpha [[D]] data D {\nx\n} \ntf 02 evt Beta"`                         |
| eventmodeling | [eventmodeling.md:1151](./docs/eventmodeling.ja.md#blank-lines)                   | `"eventmodeling\ntf 01 evt A\n\nrf 02 cmd B\n"`                                                 |
| gantt         | [gantt.md:261](./docs/gantt.ja.md#空行)                                           | `"gantt\ntitle T\n\n%% c\n\n\n%% d\nsection S\n"`                                               |
| gitgraph      | [gitgraph.md:141](./docs/gitgraph.ja.md#blank-lines)                              | `"gitGraph\ncommit\n\n%% group\ncommit"`                                                        |
| info          | [info.md:531](./docs/info.ja.md#blank-lines)                                      | `"info\ntitle A\n\naccTitle: B"`                                                                |
| ishikawa      | [ishikawa.md:227](./docs/ishikawa.ja.md#blank-lines)                              | `"ishikawa\nR\n\n A"`                                                                           |
| ishikawa      | [ishikawa.md:230](./docs/ishikawa.ja.md#blank-lines)                              | `"ishikawa\nR\n\n %% c\n\n %%{init: {}}%%\n\n A"`                                               |
| journey       | [journey.md:210](./docs/journey.ja.md#空行)                                       | `"journey\ntitle T\n\n\nsection S\n\n\nA: 5\n\n\nsection U\n\nB: 1\n\n"`                        |
| kanban        | [kanban.md:597](./docs/kanban.ja.md#データブロック)                               | `"kanban\nS\n%%{init: {}}%%\n  %% before\n\n  A@{\nticket: A\n}\n  %% after\n%%{init: {}}%%\n"` |
| pie           | [pie.md:552](./docs/pie.ja.md#blank-lines)                                        | `"pie\n\"A\":1\n\n\"B\":2"`                                                                     |
| quadrant      | [quadrant.md:181](./docs/quadrant.ja.md#空行)                                     | `"quadrantChart\ntitle T\n\nquadrant-1 A\n"`                                                    |
| radar         | [radar.md:950](./docs/radar.ja.md#blank-lines)                                    | `"\n\nradar-beta\n\n\naxis North\n \t\n\ncurve trial{4}\n\n"`                                   |
| radar         | [radar.md:952](./docs/radar.ja.md#blank-lines)                                    | `"\n\nradar-beta\n\n\naxis North\n \t\n\ncurve trial{4}\n\n"`                                   |
| railroad      | [railroad.md:1652](./docs/railroad.ja.md#hidden-の境界)                           | `"railroad-beta accDescr{moved}\n%%{!after metadata}%%\n\nr=terminal(\"after moved\");"`        |
| railroad      | [railroad.md:3074](./docs/railroad.ja.md#markdown-フェンス)                       | `"railroad-beta\n%%{!x}%%\n\nr=terminal(\"x\");"`                                               |
| requirement   | [requirement.md:1284](./docs/requirement.ja.md#スタイル文の末尾のセミコロン)      | `"requirementDiagram\nclassDef c fill:#f00;\n\n%% color\nstyle r fill:#f00;\n"`                 |
| timeline      | [timeline.md:269](./docs/timeline.ja.md#空行)                                     | `"timeline\ntitle T\n\n\nsection S\n\n\n2002 : x\n\n\nsection U\n\n2004 : y\n\n"`               |
| timeline      | [timeline.md:274](./docs/timeline.ja.md#空行)                                     | `"timeline\n2004 : Facebook\n\n\n: Google\n"`                                                   |
| timeline      | [timeline.md:279](./docs/timeline.ja.md#空行)                                     | `"timeline\n2004 : A\n\n: B\n"`                                                                 |
| treemap       | [treemap.md:1178](./docs/treemap.ja.md#blank-lines)                               | `"treemap\n\"A\":1\n\n\"B\":2\n"`                                                               |
| treeview      | [treeview.md:2434](./docs/treeview.ja.md#blank-lines)                             | `"treeView-beta\nR\n\n C\n"`                                                                    |
| usecase       | [usecase.md:879](./docs/usecase.ja.md#semicolons-at-the-end-of-a-style-statement) | `"usecase-beta\nA\nclassDef c fill:#f00;\n\n%% color\nstyle A fill:#f00;\n"`                    |
| venn          | [venn.md:215](./docs/venn.ja.md#blank-lines)                                      | `"\nvenn-beta\n\n\nset A\n\n\nset B\n\n"`                                                       |
| venn          | [venn.md:734](./docs/venn.ja.md#semicolons-at-the-end-of-a-style-statement)       | `"venn-beta\nset A\nstyle A fill:#f00;\n\n%% color\nstyle A fill:#0f0;\n"`                      |
| wardley       | [wardley.md:923](./docs/wardley.ja.md#空行)                                       | `"\n\nwardley-beta\n\n\ncomponent GroupA[0.3,0.6]\n \t\n\n\ncomponent GroupB[0.4,0.7]\n\n"`     |
| xychart       | [xychart.md:186](./docs/xychart.ja.md#空行)                                       | `"xychart\ntitle A\n\nline [1]\n"`                                                              |

### 値の端の余白をそろえるか

10 形が agentflow、c4、compatibility、eventmodeling、venn にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                                                                     |
| ------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| agentflow     | [agentflow.md:1777](./docs/agentflow.ja.md#click-statements)                   | `"agentflow-beta TB\nA\nclick A call f ()"`                                                    |
| c4            | [c4.md:1606](./docs/c4.ja.md#アクセシビリティの行)                             | `"C4Context\ntitle\n%% comment\n  T\nPerson(a,\"A\")\n"`                                       |
| compatibility | [compatibility.md:3885](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"classDiagram\nclick A call f (1)\n"`                                                         |
| compatibility | [compatibility.md:5335](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"timeline\ntitle\n%% c\n    Text\n"`                                                          |
| compatibility | [compatibility.md:6145](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"agentflow-beta TB\nstyle A  fill:red\n"`                                                     |
| eventmodeling | [eventmodeling.md:481](./docs/eventmodeling.ja.md#inline-data)                 | `"eventmodeling tf 01 evt Alpha { \t x  }"`                                                    |
| eventmodeling | [eventmodeling.md:752](./docs/eventmodeling.ja.md#title)                       | `"eventmodeling title  'Heading'  \ntf 01 evt Alpha"`                                          |
| eventmodeling | [eventmodeling.md:754](./docs/eventmodeling.ja.md#title)                       | `"eventmodeling title  'Heading'  \ntf 01 evt Alpha"`                                          |
| venn          | [venn.md:356](./docs/venn.ja.md#labels)                                        | `"venn-beta\nset A[ %%{x}%% T ]\nset B[ T %%{x}%% ]\nset C[ a; ]\nset D[ a;b ]\nset E[ L ]\n"` |
| venn          | [venn.md:391](./docs/venn.ja.md#labels)                                        | `"venn-beta\nset A[ %%{x}%% T ]\nset B[ T %%{x}%% ]\nset C[ a; ]\nset D[ a;b ]\nset E[ L ]\n"` |

### 値の中の空白と空行をそろえるか

4 形が eventmodeling、radar、usecase にある。

| 図種          | 規則の文書                                                      | 書かれた形                                                                 |
| ------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| eventmodeling | [eventmodeling.md:1154](./docs/eventmodeling.ja.md#blank-lines) | `"eventmodeling tf 01 evt Alpha [[D]] data D {\nx\n\n\n}\n"`               |
| radar         | [radar.md:952](./docs/radar.ja.md#blank-lines)                  | `"radar-beta\naxis North[\"one\n\n\nlast\"]\n"`                            |
| usecase       | [usecase.md:699](./docs/usecase.ja.md#native-metadata)          | `"usecase-beta\nactor Reader@{\n\n%%{init: {\n}}%%\n\n\ntype:normal\n}\n"` |
| usecase       | [usecase.md:720](./docs/usecase.ja.md#native-metadata)          | `"usecase-beta\nactor U@{type:hollow\n\n}\n"`                              |

### コメント以外の行の末尾の空白を取り除くか

48 形が architecture、compatibility、cynefin、er、eventmodeling、flowchart、
gantt、gitgraph、info、ishikawa、journey、kanban、mindmap、quadrant、radar、
railroad、requirement、sankey、sequence、state、timeline、treemap、
usecase にある。

| 図種          | 規則の文書                                                                                       | 書かれた形                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| architecture  | [architecture.md:1072](./docs/architecture.ja.md#trailing-whitespace)                            | `architecture-beta \t\nservice a(cloud)[A] \t\njunction j\t\na:R -- L:j\t\nalign row a j \t\naccDescr {D}\t\n`                   |
| architecture  | [architecture.md:1099](./docs/architecture.ja.md#frontmatter-yaml)                               | `"--- \t\ntitle: Net\n--- \t\narchitecture-beta\nservice a\n"`                                                                   |
| compatibility | [compatibility.md:3868](./docs/compatibility.ja.md#コメントやディレクティブの前後の構造の継続行) | 隙間の最初の LF の前の空白と、値や directive の内側全体                                                                          |
| compatibility | [compatibility.md:5822](./docs/compatibility.ja.md#ほかに書かれたまま残すもの)                   | `"--- \ntitle: X\n--- \nflowchart TD\nA\n"`                                                                                      |
| compatibility | [compatibility.md:5899](./docs/compatibility.ja.md#markdown-のコードブロック)                    | `(built) "flowchart TD\nA -->  \n"`                                                                                              |
| compatibility | [compatibility.md:5904](./docs/compatibility.ja.md#ほかに書かれたまま残すもの)                   | `"error  \n"`                                                                                                                    |
| compatibility | [compatibility.md:5908](./docs/compatibility.ja.md#ほかに書かれたまま残すもの)                   | `"error  \n"`                                                                                                                    |
| compatibility | [compatibility.md:6637](./docs/compatibility.ja.md#ほかに書かれたまま残すもの)                   | `"radar-beta\naxis A---\nx\n--- \n"`                                                                                             |
| compatibility | [compatibility.md:7365](./docs/compatibility.ja.md#ほかに書かれたまま残すもの)                   | `"wardley-beta\ncomponent Alpha [0.1,0.2]%%{!}%% \n"`                                                                            |
| cynefin       | [cynefin.md:182](./docs/cynefin.ja.md#component-spacing)                                         | `"cynefin-beta\ncomplex-->clear%%{!eof-pad}%% \t"`                                                                               |
| cynefin       | [cynefin.md:644](./docs/cynefin.ja.md#hidden-boundaries)                                         | `"cynefin-beta\ncomplex-->clear%%{!eof-pad}%% \t"`                                                                               |
| cynefin       | [cynefin.md:1254](./docs/cynefin.ja.md#markdown-fences)                                          | `"cynefin-beta\nclear-->chaotic%%{!x}%% \t"`                                                                                     |
| er            | [er.md:2264](./docs/er.ja.md#フロントマター-yaml)                                                | `"---  \ntitle:   x\n---\t \nerDiagram\nA\n"`                                                                                    |
| er            | [er.md:2689](./docs/er.ja.md#複数行の文)                                                         | `"erDiagram\ndirection  \n%%{init: {}}%%\nLR\n"`                                                                                 |
| eventmodeling | [eventmodeling.md:567](./docs/eventmodeling.ja.md#data-blocks)                                   | `"eventmodeling\ntf 01 evt Alpha [[D]]\ndata D {\n    first \t\n \t\n      second  \n}\n"`                                       |
| eventmodeling | [eventmodeling.md:672](./docs/eventmodeling.ja.md#data-boundaries)                               | `"eventmodeling tf 01 evt Alpha [[D]] data D {\nx\n} \ntf 02 evt Beta"`                                                          |
| eventmodeling | [eventmodeling.md:845](./docs/eventmodeling.ja.md#hidden-forms)                                  | `"eventmodeling\n%%{{native}}%% \t\ntf 01 evt Alpha"`                                                                            |
| eventmodeling | [eventmodeling.md:1185](./docs/eventmodeling.ja.md#trailing-whitespace)                          | `eventmodeling \t\ntf 01 evt Alpha \t\nentity Shop.Buy \t`                                                                       |
| eventmodeling | [eventmodeling.md:1277](./docs/eventmodeling.ja.md#frontmatter-yaml)                             | `"--- \ntitle: Real\n--- \neventmodeling tf 01 evt Alpha"`                                                                       |
| flowchart     | [flowchart.md:3582](./docs/flowchart.ja.md#フロントマターの-yaml)                                | `"---  \ntitle:   x\n---\t \nflowchart LR\nA\n"`                                                                                 |
| gantt         | [gantt.md:1058](./docs/gantt.ja.md#click-文)                                                     | `"gantt\na : id1, 1d\nclick id1 href \"u\"   \nclick id1 call f()  \t\n"`                                                        |
| gantt         | [gantt.md:1501](./docs/gantt.ja.md#トークンの間の空白)                                           | `gantt   \ntitle T\n`                                                                                                            |
| gantt         | [gantt.md:1769](./docs/gantt.ja.md#フロントマターの-yaml)                                        | `"---\ntitle: T\n---  \ngantt\ntitle T\n"`                                                                                       |
| gitgraph      | [gitgraph.md:832](./docs/gitgraph.ja.md#line-terminators-and-unicode)                            | `(built) "gitGraph\ntitle T\u00a0\n"`                                                                                            |
| info          | [info.md:822](./docs/info.ja.md#markdown-fences)                                                 | `"info\n%%{! ignored }%% \ntitle T"`                                                                                             |
| ishikawa      | [ishikawa.md:882](./docs/ishikawa.ja.md#frontmatter-yaml)                                        | `"---\ntitle:   T\n--- \t\n%% pre\n%%{wrap}%%\nishikawa\nR"`                                                                     |
| journey       | [journey.md:859](./docs/journey.ja.md#トークンの間の空白)                                        | `journey   \ntitle T\n`                                                                                                          |
| journey       | [journey.md:1042](./docs/journey.ja.md#フロントマターの-yaml)                                    | `"---\ntitle: T\n---  \njourney\ntitle T\n"`                                                                                     |
| kanban        | [kanban.md:1189](./docs/kanban.ja.md#フロントマターの-yaml)                                      | `"---\ntitle: T\n---  \nkanban\n S\n"`                                                                                           |
| mindmap       | [mindmap.md:836](./docs/mindmap.ja.md#フロントマターの-yaml)                                     | `"---\ntitle: T\n---  \nmindmap\n  root\n"`                                                                                      |
| quadrant      | [quadrant.md:660](./docs/quadrant.ja.md#title-とアクセシビリティの文)                            | `"quadrantChart\ntitle   \nquadrant-1 A\n"`                                                                                      |
| quadrant      | [quadrant.md:828](./docs/quadrant.ja.md#複数行の文)                                              | `"quadrantChart\n\"first\n raw\": [0.3, \n%% y\n0.6]\n"`                                                                         |
| radar         | [radar.md:497](./docs/radar.ja.md#accessibility-lines)                                           | `"radar-beta\naccTitle: \naccDescr:\t\naxis North\n"`                                                                            |
| radar         | [radar.md:808](./docs/radar.ja.md#hidden-boundaries)                                             | `"radar-beta\naccDescr {Detail}---\nopaque EOF\n--- \t"`                                                                         |
| railroad      | [railroad.md:2674](./docs/railroad.ja.md#frontmatter-の-yaml)                                    | `"--- \ntitle: Guard\n--- \nrailroad-abnf-beta\nr=\"padding guard\";"`                                                           |
| requirement   | [requirement.md:1350](./docs/requirement.ja.md#複数行の文)                                       | `"requirementDiagram\na -  \n%%{init: {}}%%\nsatisfies -> b\n"`                                                                  |
| requirement   | [requirement.md:1439](./docs/requirement.ja.md#トークンの間の空白)                               | `requirementDiagram\nstyle r fill:red   \nclass r c   \nclassDef c fill:red \n`                                                  |
| requirement   | [requirement.md:1827](./docs/requirement.ja.md#フロントマターの-yaml)                            | `"---\ntitle: T\n---  \nrequirementDiagram\nrequirement r {\nid: 1\n}\n"`                                                        |
| sankey        | [sankey.md:533](./docs/sankey.ja.md#フロントマターの-yaml)                                       | `"---\ntitle: T\n---  \nsankey\na,b,1\n"`                                                                                        |
| sequence      | [sequence.md:1433](./docs/sequence.ja.md#行区切り)                                               | `(built) "sequenceDiagram\nbox red\u2028  \nparticipant A\nend\n"`                                                               |
| state         | [state.md:939](./docs/state.ja.md#ノート)                                                        | `"stateDiagram-v2\nA\nnote left of A :  \nnote right of A : x %% c\nnote left of A : x %%{init: {}}%% y\nnote right of A:  é\n"` |
| state         | [state.md:1141](./docs/state.ja.md#ノート)                                                       | `stateDiagram-v2\nA\nnote right of A  \n\n\n  first\n second\n     \n\nend note\n`                                               |
| state         | [state.md:1141](./docs/state.ja.md#ノート)                                                       | `"stateDiagram-v2\nA\nnote right of A %%{init: {}}%%  \n  first\nend note\n"`                                                    |
| timeline      | [timeline.md:943](./docs/timeline.ja.md#ヘッダーと方向)                                          | `timeline TD   \ntitle T\n`                                                                                                      |
| timeline      | [timeline.md:1314](./docs/timeline.ja.md#トークンの間の空白)                                     | `timeline   \ntitle T\n`                                                                                                         |
| timeline      | [timeline.md:1513](./docs/timeline.ja.md#フロントマターの-yaml)                                  | `"---\ntitle: T\n---  \ntimeline\ntitle T\n"`                                                                                    |
| treemap       | [treemap.md:559](./docs/treemap.ja.md#semicolons)                                                | `"treemap\nclassDef zz color:#f00;; \t\n"`                                                                                       |
| usecase       | [usecase.md:1339](./docs/usecase.ja.md#frontmatter-yaml)                                         | `"---\nconfig: {usecase: {useMaxWidth: false}}\n---  \n%% comment\n%%{wrap}%%\nusecase-beta\nDocument"`                          |

### 末尾の改行と空白だけの隙間をどう書くか

24 形が agentflow、architecture、c4、compatibility、cynefin、er、eventmodeling、
flowchart、gitgraph、info、ishikawa、kanban、packet、pie、radar、railroad、
treemap、treeview、usecase、venn にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                       |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| agentflow     | [agentflow.md:1731](./docs/agentflow.ja.md#final-newline)                      | `"agentflow-beta TB\nA\n%%{open"`                |
| architecture  | [architecture.md:1297](./docs/architecture.ja.md#final-newline)                | `"architecture-beta\nservice a\n%%{init: {}"`    |
| c4            | [c4.md:2428](./docs/c4.ja.md#末尾の改行)                                       | `"C4Context\nPerson(a,\"A\")\n%%{init: {oops"`   |
| compatibility | [compatibility.md:7346](./docs/compatibility.ja.md#wardley-の原文と必須の改行) | `"wardley-beta\n\"style:#x\"  -> \"Tail\"; "`    |
| cynefin       | [cynefin.md:1198](./docs/cynefin.ja.md#final-newline)                          | `"cynefin-beta\n%%{init: true"`                  |
| er            | [er.md:2050](./docs/er.ja.md#コメント)                                         | `erDiagram\nA\n%% c`                             |
| eventmodeling | [eventmodeling.md:1029](./docs/eventmodeling.ja.md#global-directives)          | `"eventmodeling tf 01 evt Alpha %%{init: {oops"` |
| eventmodeling | [eventmodeling.md:1455](./docs/eventmodeling.ja.md#markdown-fences)            | `(built) "eventmodeling\ntf 01 evt Alpha\n\n"`   |
| flowchart     | [flowchart.md:755](./docs/flowchart.ja.md#空行)                                | `flowchart LR`                                   |
| gitgraph      | [gitgraph.md:897](./docs/gitgraph.ja.md#final-newline)                         | `"gitGraph\n%%{init: {\ncommit id:\"lost\""`     |
| info          | [info.md:728](./docs/info.ja.md#final-newline)                                 | `"info %%{wrap: !tail"`                          |
| ishikawa      | [ishikawa.md:236](./docs/ishikawa.ja.md#blank-lines)                           | `"ishikawa\nR\n%%\n \t\n\n"`                     |
| ishikawa      | [ishikawa.md:955](./docs/ishikawa.ja.md#final-newline)                         | `"ishikawa\nR\n%%{init: {}"`                     |
| kanban        | [kanban.md:1295](./docs/kanban.ja.md#末尾の改行)                               | `"kanban\n S\n%%\n\n\n"`                         |
| packet        | [packet.md:904](./docs/packet.ja.md#final-newline)                             | `"packet\n0:\"A\"\n%%{init:"`                    |
| pie           | [pie.md:800](./docs/pie.ja.md#final-newline)                                   | `"pie\n\"End\":2%%{init: {}"`                    |
| radar         | [radar.md:684](./docs/radar.ja.md#global-directives)                           | `"radar-beta\naxis North%%{init: {"`             |
| railroad      | [railroad.md:2910](./docs/railroad.ja.md#末尾改行)                             | `"railroad-beta\n%%{unfinished"`                 |
| treemap       | [treemap.md:1330](./docs/treemap.ja.md#final-newline)                          | `"treemap\n\"OpenDirective\":2%%{wrap"`          |
| treeview      | [treeview.md:2983](./docs/treeview.ja.md#final-newline)                        | `"treeView-beta\n\"R\"%%{unfinished"`            |
| usecase       | [usecase.md:1199](./docs/usecase.ja.md#directives)                             | `"usecase-beta\nA\n%%{init: {}"`                 |
| usecase       | [usecase.md:1379](./docs/usecase.ja.md#final-newline)                          | `"usecase-beta\nA%%{init: {}"`                   |
| venn          | [venn.md:938](./docs/venn.ja.md#directives)                                    | `"venn-beta\nset A\n%%{init: {}"`                |
| venn          | [venn.md:1235](./docs/venn.ja.md#final-newline)                                | `"venn-beta\nset A\n%%{init: true"`              |

### 先頭の U+FEFF を残すか

2 形が kanban、usecase にある。

| 図種    | 規則の文書                                               | 書かれた形                  |
| ------- | -------------------------------------------------------- | --------------------------- |
| kanban  | [kanban.md:1047](./docs/kanban.ja.md#空白文字)           | `"\ufeffkanban\n S\n"`      |
| usecase | [usecase.md:1317](./docs/usecase.ja.md#line-terminators) | `"\ufeffusecase-beta\nA\n"` |

### コメントの区切り記号をどの形で書くか

2 形が compatibility にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                                                      |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| compatibility | [compatibility.md:7144](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"railroad-ebnf-beta\n(* c *) r=\"x\";\n"`                                      |
| compatibility | [compatibility.md:7586](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"eventmodeling tf 070evt Before/*left*/ %%{wrap}%%/*right*/rf 071cmd After\n"` |

### 行内コメントの横の空白をどう書くか

32 形が agentflow、architecture、compatibility、cynefin、eventmodeling、
flowchart、gitgraph、info、ishikawa、kanban、mindmap、packet、pie、radar、
railroad、requirement、state、wardley にある。

| 図種          | 規則の文書                                                                                 | 書かれた形                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| agentflow     | [agentflow.md:972](./docs/agentflow.ja.md#comments)                                        | `agentflow-beta TB\nA;%% c\nB`                                                                                                                      |
| agentflow     | [agentflow.md:975](./docs/agentflow.ja.md#comments)                                        | `"agentflow-beta TB\nA[x  %% comment\n]"`                                                                                                           |
| architecture  | [architecture.md:793](./docs/architecture.ja.md#comments)                                  | `"%% lead\narchitecture-beta\n%% alone\nservice a%%touch\nservice b   %% separated  \n"`                                                            |
| architecture  | [architecture.md:793](./docs/architecture.ja.md#comments)                                  | `%% lead\narchitecture-beta\n%% alone\nservice a%%touch\nservice b   %% separated  \n`                                                              |
| compatibility | [compatibility.md:1241](./docs/compatibility.ja.md#同じに描かれるキーワードの後のテキスト) | `(built) "sequenceDiagram\ntitle T   %% comment\nA->>B: x\n"`                                                                                       |
| compatibility | [compatibility.md:1241](./docs/compatibility.ja.md#同じに描かれるキーワードの後のテキスト) | `(built) "gantt\ntitle Plan   %% comment\nsection S\nA: 1d\n"`                                                                                      |
| cynefin       | [cynefin.md:843](./docs/cynefin.ja.md#comments)                                            | `"cynefin-beta\ncomplex \"Separated\"   %% note  \n\"NextSeparated\""`                                                                              |
| cynefin       | [cynefin.md:843](./docs/cynefin.ja.md#comments)                                            | `"cynefin-beta\ncomplex \"Attached\"%% item note\n\"NextAttached\""`                                                                                |
| eventmodeling | [eventmodeling.md:220](./docs/eventmodeling.ja.md#source-references)                       | `"eventmodeling tf 01 evt Alpha/*a*/->>/*b*/02"`                                                                                                    |
| eventmodeling | [eventmodeling.md:270](./docs/eventmodeling.ja.md#type-tags)                               | ``"eventmodeling tf 01 evt Alpha `/*a*/json/*b*/`/*c*/{x}"``                                                                                        |
| eventmodeling | [eventmodeling.md:915](./docs/eventmodeling.ja.md#comments)                                | `"eventmodeling tf/*a*/01 evt /*b*/Alpha // tail \t\nrf 02 cmd Beta"`                                                                               |
| flowchart     | [flowchart.md:3529](./docs/flowchart.ja.md#スタイルの行末の空白)                           | `"flowchart LR\nA\nstyle A fill:red\u00a0 %% c\n"`                                                                                                  |
| gitgraph      | [gitgraph.md:563](./docs/gitgraph.ja.md#comments)                                          | `"%% before\ngitGraph %% header\ncommit%% glued\ncommit  %% apart\n    %% last\n"`                                                                  |
| info          | [info.md:107](./docs/info.ja.md#title)                                                     | `"info\ntitle T%% c"`                                                                                                                               |
| info          | [info.md:396](./docs/info.ja.md#comments)                                                  | `"info%% heading\nshowInfo   %% flag \t\ntitle Topic%% text\naccDescr {D}  %%% triple\n"`                                                           |
| ishikawa      | [ishikawa.md:307](./docs/ishikawa.ja.md#comments)                                          | `"ishikawa   %% note\nR"`                                                                                                                           |
| ishikawa      | [ishikawa.md:307](./docs/ishikawa.ja.md#comments)                                          | `"ishikawa%% note\nR"`                                                                                                                              |
| kanban        | [kanban.md:790](./docs/kanban.ja.md#コメント)                                              | `"kanban\n S[x]   %% c\n   A[y]%% d\n"`                                                                                                             |
| kanban        | [kanban.md:792](./docs/kanban.ja.md#コメント)                                              | `"kanban\n S[x]   %% c\n   A[y]%% d\n"`                                                                                                             |
| kanban        | [kanban.md:795](./docs/kanban.ja.md#コメント)                                              | `"kanban\n S[x]   %% c\n   A[y]%% d\n"`                                                                                                             |
| mindmap       | [mindmap.md:666](./docs/mindmap.ja.md#コメント)                                            | `"mindmap\n  root\n    a[x] %% c\n    b[y]%% d\n    c((z))   %%  e\n"`                                                                              |
| packet        | [packet.md:465](./docs/packet.ja.md#comments)                                              | `"    %% before\npacket%% header\n0:\"Touch\"%%inline\n1:\"Apart\"   %% separated  \n    %%%\n"`                                                    |
| pie           | [pie.md:452](./docs/pie.ja.md#comments)                                                    | `"pie\n\"A\":1%% c"`                                                                                                                                |
| radar         | [radar.md:642](./docs/radar.ja.md#comments)                                                | `"radar-beta\naxis North%%touch\ncurve trial{4}   %% separated  \n"`                                                                                |
| railroad      | [railroad.md:1313](./docs/railroad.ja.md#コメント)                                         | `"%% leading note\nrailroad-ebnf-beta\n(* before rule *)\nr=\"a\" (* middle *) , /* other */ \"last\";%%tail"`                                      |
| railroad      | [railroad.md:1329](./docs/railroad.ja.md#コメント)                                         | `"railroad-beta\nleaf=terminal/* call */(/* before */\"x\"/* close */);\nlist=sequence(terminal(\"a\")/* comma */ ,/* next */terminal(\"b\"));\n"`  |
| railroad      | [railroad.md:1331](./docs/railroad.ja.md#コメント)                                         | `"railroad-beta\nleaf=terminal/* call */(/* before */\"x\"/* close */);\nlist=sequence(terminal(\"a\")/* comma */ ,/* next */terminal(\"b\"));\n"`  |
| railroad      | [railroad.md:1332](./docs/railroad.ja.md#コメント)                                         | `"railroad-beta\nleaf=terminal/* call */(/* before */\"x\"/* close */);\nlist=sequence(terminal(\"a\")/* comma */ ,/* next */terminal(\"b\"));\n"`  |
| requirement   | [requirement.md:1550](./docs/requirement.ja.md#コメント)                                   | `(built) "requirementDiagram   %c\nrequirement r {\n}\n"`                                                                                           |
| state         | [state.md:1371](./docs/state.ja.md#コメント)                                               | `"stateDiagram-v2\n%% a comment line\nA --> B %% after a transition\nA --> C%%touching\n# a hash comment\nstate D {\n        %% in a body\nE\n}\n"` |
| wardley       | [wardley.md:894](./docs/wardley.ja.md#コメント)                                            | `wardley-beta\ncomponent InlineSpace[0.3,0.6] \t%% tail`                                                                                            |
| wardley       | [wardley.md:894](./docs/wardley.ja.md#コメント)                                            | `"wardley-beta%% heading\ncomponent Inline[0.3,0.6]%% tail \t"`                                                                                     |

### 文や引数の横のコメントをどこに置くか

13 形が class、flowchart、journey、railroad、requirement、timeline、treemap、
treeview にある。

| 図種        | 規則の文書                                                        | 書かれた形                                                                                                                                         |
| ----------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| class       | [class.md:586](./docs/class.ja.md#トークンの間の空白)             | `"classDiagram\nclass A\nclass B\nclass C\nclick A call f(\n) \"t\"\nclick B call g(\n%% c\n)\nclick C call h( \n\n )\n"`                          |
| flowchart   | [flowchart.md:1941](./docs/flowchart.ja.md#複数行の文)            | `"flowchart LR\n  A -->\n%% between\nB\n"`                                                                                                         |
| journey     | [journey.md:898](./docs/journey.ja.md#コメント)                   | `"journey\ntitle T\n      # last"`                                                                                                                 |
| railroad    | [railroad.md:783](./docs/railroad.ja.md#長い行)                   | `"railroad-beta\nr=sequence(/* keep */ terminal(\"first terminal\"), terminal(\"second terminal\"));\n"`                                           |
| railroad    | [railroad.md:1323](./docs/railroad.ja.md#コメント)                | `"railroad-beta\nr=sequence/* constructor */( /* first */terminal(\"a\")/* before comma */ ,/* next */ terminal(\"b\") /* close */);\n"`           |
| railroad    | [railroad.md:1324](./docs/railroad.ja.md#コメント)                | `"railroad-beta\nleaf=terminal/* call */(/* before */\"x\"/* close */);\nlist=sequence(terminal(\"a\")/* comma */ ,/* next */terminal(\"b\"));\n"` |
| railroad    | [railroad.md:1326](./docs/railroad.ja.md#コメント)                | `"railroad-beta\nr=sequence(\n/* opening\n  inner column */\nterminal(\"a\"),\n\n%% between\n/* next */ terminal(\"b\")\n\n/* close */\n);\n"`     |
| railroad    | [railroad.md:1327](./docs/railroad.ja.md#コメント)                | `"railroad-beta\nr=sequence(terminal(\"a\"),optional%% nested\n(terminal(\"b\")));\n"`                                                             |
| railroad    | [railroad.md:1334](./docs/railroad.ja.md#コメント)                | `"railroad-beta\nr=terminal\n/* constructor */(\"a\"\n/* closer */);\n"`                                                                           |
| requirement | [requirement.md:1550](./docs/requirement.ja.md#コメント)          | `"requirementDiagram\nrequirement r {\nrisk: low %c\nverifyMethod: test#c\nid: \"1\" #c\ntext: \"t\"%c\n}\n"`                                      |
| timeline    | [timeline.md:941](./docs/timeline.ja.md#ヘッダーと方向)           | `"timeline TD # c\ntitle T\n"`                                                                                                                     |
| treemap     | [treemap.md:773](./docs/treemap.ja.md#title)                      | `"treemap\ntitle\n%% between\n\"AfterEmpty\":3"`                                                                                                   |
| treeview    | [treeview.md:1102](./docs/treeview.ja.md#statements-one-per-line) | `"treeView-beta\nroot\n├── \"a\"%%{x}%%\"b\"\n%% between\n└── c\n"`                                                                                |

### directive や隠れた形の横の空白をどう書くか

37 形が agentflow、compatibility、cynefin、er、eventmodeling、flowchart、info、
ishikawa、journey、kanban、mindmap、pie、quadrant、railroad、sankey、sequence、
state、timeline、treemap、treeview、usecase、venn、wardley にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| agentflow     | [agentflow.md:278](./docs/agentflow.ja.md#names-and-headings)                  | `"agentflow-beta TB\nflow F%% style:#x %%{init: {}}%% ;;  \nA\nend\n"`                                                        |
| compatibility | [compatibility.md:2734](./docs/compatibility.ja.md#1-行の説明ブロック)         | `"pie\naccDescr {a %%{init: {}}%%}\n\"A\": 1\n"`                                                                              |
| compatibility | [compatibility.md:7426](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"cynefin-beta\nclear%%{!}%%\n"`                                                                                              |
| cynefin       | [cynefin.md:240](./docs/cynefin.ja.md#arrow-spacing)                           | `"cynefin-beta\ncomplex---\nfrom-gap\n--- -->---\nto-gap\n--- clear---\ncolon-gap\n--- :---\nlabel-gap\n--- \"NativeLabel\""` |
| cynefin       | [cynefin.md:648](./docs/cynefin.ja.md#hidden-boundaries)                       | `"cynefin-beta:complex-->clear%%{!body-on-header}%%\n\nchaotic \"BodyOnHeader\""`                                             |
| cynefin       | [cynefin.md:649](./docs/cynefin.ja.md#hidden-boundaries)                       | `"cynefin-beta\ncomplex-->clear%%{!one}%% %%{!two}%% \nchaotic \"TwoSuffix\""`                                                |
| er            | [er.md:488](./docs/er.ja.md#属性の空白)                                        | `"erDiagram\nA {\nint a %%{init: {}}%% PK\nint%%{init: {}}%% b\nint c PK%%{init: {}}%%\n}\n"`                                 |
| er            | [er.md:2133](./docs/er.ja.md#ディレクティブ)                                   | `"erDiagram\nA   %%{init: {}}%%    \|\|--o{ B : x\nC  %%{init: {}}%%  D\n"`                                                   |
| eventmodeling | [eventmodeling.md:716](./docs/eventmodeling.ja.md#common-boundaries)           | `"eventmodeling tf 01 evt Alpha \t%%{init:{}}%%  accDescr: D"`                                                                |
| flowchart     | [flowchart.md:2731](./docs/flowchart.ja.md#ディレクティブ)                     | `"flowchart LR\n%%{init: {}}%%   A --> B\nC --> D   %%{init: {}}%%\n%%{init: {}}%%E --> F\nG --> H%%{init: {}}%%\n"`          |
| info          | [info.md:431](./docs/info.ja.md#global-directives)                             | `"info %%{wrap}%%title T"`                                                                                                    |
| ishikawa      | [ishikawa.md:468](./docs/ishikawa.ja.md#inline-directives)                     | `"ishikawa\nR\n    %%{init: {}}%%  A\n          B"`                                                                           |
| ishikawa      | [ishikawa.md:670](./docs/ishikawa.ja.md#physical-lines)                        | `"ishikawa\nR%%{init: {\n}}%%  X\n A"`                                                                                        |
| journey       | [journey.md:296](./docs/journey.ja.md#タスクのデータ)                          | `"journey\nA %%{init: {}}%% : 5\nB%%{init: {}}%% : 3\nC : 2\n"`                                                               |
| journey       | [journey.md:975](./docs/journey.ja.md#ディレクティブ)                          | `"journey accDescr {}%%{init: {}}%%A: 5\n"`                                                                                   |
| kanban        | [kanban.md:834](./docs/kanban.ja.md#ディレクティブ)                            | `"kanban\n S\n      %%{init: {}}%%  A\n"`                                                                                     |
| kanban        | [kanban.md:837](./docs/kanban.ja.md#ディレクティブ)                            | `"kanban\n S\n      %%{init: {}}%%  A\n"`                                                                                     |
| kanban        | [kanban.md:864](./docs/kanban.ja.md#ディレクティブ)                            | `"kanban %%{init: {}}%%  S[x]\n"`                                                                                             |
| mindmap       | [mindmap.md:729](./docs/mindmap.ja.md#ディレクティブ)                          | `"mindmap\n  root\n    a[%%{wrap}%%x]"`                                                                                       |
| pie           | [pie.md:492](./docs/pie.ja.md#directives-and-semicolons)                       | `"pie %%{wrap}%%\"A\":1"`                                                                                                     |
| quadrant      | [quadrant.md:1062](./docs/quadrant.ja.md#指令)                                 | `"quadrantChart\nx-axis L; %%{init: {}}%% quadrant-1 A\n"`                                                                    |
| railroad      | [railroad.md:1471](./docs/railroad.ja.md#共有-directive)                       | `"railroad-beta\na=terminal(\"RailBefore\");%%{wrap}%%b=terminal(\"RailAfter\");"`                                            |
| sankey        | [sankey.md:490](./docs/sankey.ja.md#指令)                                      | `"sankey\na,b,1 %%{init: {}}%%\nc,d,2%%{init: {}}%%\ne,f,3    %%{init: {}}%%\n"`                                              |
| sankey        | [sankey.md:492](./docs/sankey.ja.md#指令)                                      | `"sankey\n%%{init: {}}%%a,b,1\n"`                                                                                             |
| sequence      | [sequence.md:1010](./docs/sequence.ja.md#タイトル)                             | `"sequenceDiagram\ntitle %%{init: {}}%% T\ntitle%%{init: {}}%% U\ntitle:%%{init: {}}%% V\nA->>B: x\n"`                        |
| state         | [state.md:1287](./docs/state.ja.md#別名)                                       | `"stateDiagram-v2\nstate \"d\" as A : x  %%{init: {}}%%  \n"`                                                                 |
| timeline      | [timeline.md:1446](./docs/timeline.ja.md#指令)                                 | `"timeline accDescr {}%%{init: {}}%%A : e\n"`                                                                                 |
| treemap       | [treemap.md:749](./docs/treemap.ja.md#title)                                   | `"treemap\ntitle%%{init: {}}%%\n\"A\":1\n"`                                                                                   |
| treemap       | [treemap.md:1092](./docs/treemap.ja.md#directives)                             | `"treemap\n\"Top\"\n %%{wrap}%% \"Tip\":2"`                                                                                   |
| treeview      | [treeview.md:2224](./docs/treeview.ja.md#directives)                           | `"treeView-beta\nR\n %%{init: {}}%% C\n"`                                                                                     |
| usecase       | [usecase.md:793](./docs/usecase.ja.md#json-tables)                             | `"usecase-beta\njson A @ %%{x}%% {\"a\":1}\njson B @%%{x}%%{ \"b\": 2 }\n"`                                                   |
| usecase       | [usecase.md:1191](./docs/usecase.ja.md#directives)                             | `"usecase-beta\nTask\nstyle Task -- \t%%{init: {\n}}%%  color  :   red \t\n"`                                                 |
| venn          | [venn.md:642](./docs/venn.ja.md#style-properties)                              | `"venn-beta\nset A\nstyle A fill:rgb(1,%%{init: {\"x\": \")\"}}%%  2,3)\n"`                                                   |
| wardley       | [wardley.md:117](./docs/wardley.ja.md#部品間の空白)                            | `"wardley-beta\ncomponent%%{!gap}%%\nGapName[0.3,0.6]"`                                                                       |
| wardley       | [wardley.md:351](./docs/wardley.ja.md#label-offset)                            | `"wardley-beta\ncomponent SignHidden[0.3,0.6]label[-%%{!gap}%% 1,2]"`                                                         |
| wardley       | [wardley.md:739](./docs/wardley.ja.md#hidden-の境界)                           | `"wardley-beta\ncomponent TwoSuffix[0.3,0.6]%%{!one}%%\n%%{!two}%%\n\ncomponent AfterTwo[0.4,0.7]"`                           |
| wardley       | [wardley.md:851](./docs/wardley.ja.md#global-directive)                        | `"wardley-beta%%{wrap}%%size[8,9]"`                                                                                           |

### 文の横の directive や隠れた形をどこに置くか

49 形が architecture、block、class、compatibility、cynefin、er、eventmodeling、
flowchart、gitgraph、info、ishikawa、journey、mindmap、packet、quadrant、radar、
railroad、requirement、sequence、state、timeline、treeview、usecase、wardley、
xychart にある。

| 図種          | 規則の文書                                                             | 書かれた形                                                                                                                                                                                              |
| ------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| architecture  | [architecture.md:831](./docs/architecture.ja.md#global-directives)     | `architecture-beta%%{wrap}%% service boundary(cloud)`                                                                                                                                                   |
| block         | [block.md:1002](./docs/block.ja.md#指令)                               | `"block-beta\na %%{init: {}}%% b\n"`                                                                                                                                                                    |
| block         | [block.md:1026](./docs/block.ja.md#指令)                               | `block-beta\ncolumns 3 %%{init: {}}%% a\n`                                                                                                                                                              |
| class         | [class.md:99](./docs/class.ja.md#メンバーの本体)                       | `"classDiagram\nclass A {\n+x\n%%{init: {}}%% }\n"`                                                                                                                                                     |
| class         | [class.md:142](./docs/class.ja.md#メンバーの本体)                      | `"classDiagram\nclass A {}\nclass B {   }\nclass C:::c { }\nclass D {\n}\nclass E {\n\n}\nclass F { %%{init: {}}%% }\n"`                                                                                |
| class         | [class.md:143](./docs/class.ja.md#メンバーの本体)                      | `"classDiagram\nclass A {\n%%{init: {}}%%\n}\nclass B {%%{init: {}}%%\n}\n"`                                                                                                                            |
| compatibility | [compatibility.md:2733](./docs/compatibility.ja.md#1-行の説明ブロック) | `"pie\naccDescr {a%%{init: {}}%%b}\n\"A\": 1\n"`                                                                                                                                                        |
| cynefin       | [cynefin.md:803](./docs/cynefin.ja.md#global-directives)               | `"cynefin-beta\ncomplex \"OneGlobal\"%%{wrap}%%\"TwoGlobal\""`                                                                                                                                          |
| er            | [er.md:307](./docs/er.ja.md#属性ブロック)                              | `"erDiagram\nA { %%{init: {}}%% }\nB {%%{init: {}}%%}\n"`                                                                                                                                               |
| er            | [er.md:325](./docs/er.ja.md#属性ブロック)                              | `"erDiagram\nA {\nint a\n%%{init: {}}%% }\n"`                                                                                                                                                           |
| er            | [er.md:1543](./docs/er.ja.md#subgraph)                                 | `"erDiagram\nsubgraph S %%{init: {}}%%\n%%{init: {}}%%\n%% a comment line\nA\n%%{init: {}}%% end\nB\n"`                                                                                                 |
| er            | [er.md:1945](./docs/er.ja.md#アクセシビリティの文)                     | `"erDiagram\n%%{init: {}}%% A accTitle:\ndirection LR\n%%{init: {}}%% B { int id } accTitle:\ndirection LR\n"`                                                                                          |
| eventmodeling | [eventmodeling.md:844](./docs/eventmodeling.ja.md#hidden-forms)        | `"eventmodeling tf 01 evt Alpha ---\nx\n---\ntf 02 evt Beta"`                                                                                                                                           |
| eventmodeling | [eventmodeling.md:854](./docs/eventmodeling.ja.md#hidden-forms)        | `"eventmodeling accDescr {A\nB} %%{{native}}%%\ntf 01 evt A\n"`                                                                                                                                         |
| flowchart     | [flowchart.md:2695](./docs/flowchart.ja.md#ディレクティブ)             | `"flowchart LR %%{init: {}}%%\nA\n"`                                                                                                                                                                    |
| flowchart     | [flowchart.md:2744](./docs/flowchart.ja.md#ディレクティブ)             | `"flowchart LR\nA[style:#x] --> B ;%%{init: {}}%% --> C\nD[style:#x] --> E %%{init: {}}%% ; --> F\nG[style:#x] --> H  ;  %%{init: {}}%%  --> I\nJ[style:#x] --> K%%{wrap}%%;%%{init: {}}%%--> L\n"`     |
| flowchart     | [flowchart.md:2758](./docs/flowchart.ja.md#ディレクティブ)             | `flowchart LR\n  A --> B %%{init: {}}%%\n  C; %%{init: {}}%% D\n`                                                                                                                                       |
| flowchart     | [flowchart.md:2759](./docs/flowchart.ja.md#ディレクティブ)             | `flowchart LR\n  A --> B %%{init: {}}%%\n  C; %%{init: {}}%% D\n`                                                                                                                                       |
| gitgraph      | [gitgraph.md:599](./docs/gitgraph.ja.md#global-directives)             | `"gitGraph\ncommit id%%{wrap}%%:\"A\"\ncommit id:%%{wrap}%% \"B\"\n"`                                                                                                                                   |
| info          | [info.md:270](./docs/info.ja.md#hidden-yaml)                           | `"info ---\nx: ignored\n--- \t"`                                                                                                                                                                        |
| ishikawa      | [ishikawa.md:204](./docs/ishikawa.ja.md#root-indentation)              | `"ishikawa %%{init: {}}%%R\n  A"`                                                                                                                                                                       |
| ishikawa      | [ishikawa.md:353](./docs/ishikawa.ja.md#standalone-directives)         | `"%%{init: {}}%%ishikawa\nR"`                                                                                                                                                                           |
| ishikawa      | [ishikawa.md:357](./docs/ishikawa.ja.md#standalone-directives)         | `"ishikawa%%{init: {}}%% R\n  A"`                                                                                                                                                                       |
| ishikawa      | [ishikawa.md:386](./docs/ishikawa.ja.md#standalone-directives)         | `"ishikawa%%{a}%% %%{b}%% R\n   A"`                                                                                                                                                                     |
| ishikawa      | [ishikawa.md:392](./docs/ishikawa.ja.md#standalone-directives)         | `"ishikawa %%{init: {}}%%R\n  A"`                                                                                                                                                                       |
| journey       | [journey.md:136](./docs/journey.ja.md#1-行に-1-文)                     | `journey\naccDescr { d } %%{init: {}}%% A: 5\n`                                                                                                                                                         |
| journey       | [journey.md:358](./docs/journey.ja.md#タスクのデータ)                  | `"journey\nA %%{init: {}}%%: 5\nB:%%{init: {}}%% 5\nC: 5%%{init: {}}%%: Me\n"`                                                                                                                          |
| journey       | [journey.md:975](./docs/journey.ja.md#ディレクティブ)                  | `journey%%{wrap}%% title Boundary`                                                                                                                                                                      |
| journey       | [journey.md:980](./docs/journey.ja.md#ディレクティブ)                  | `"journey\nA %%{init: {}}%%: 5\nB:%%{init: {}}%% 5\nC: 5%%{init: {}}%%: Me\n"`                                                                                                                          |
| mindmap       | [mindmap.md:743](./docs/mindmap.ja.md#ディレクティブ)                  | `"mindmap\n  root\n    a((%%{init: {}}%%x))\n    ::icon(%%{init: {}}%%x)\n"`                                                                                                                            |
| packet        | [packet.md:602](./docs/packet.ja.md#hidden-directives)                 | `"packet\n0:\"Dmultiple\"%%{!one}%% %%{!two}%% \n1:\"Last\"\n"`                                                                                                                                         |
| quadrant      | [quadrant.md:1043](./docs/quadrant.ja.md#指令)                         | `"quadrantChart\nquadrant-1 %%{init: {}}%% A\nx-axis%%{init: {}}%%L\n"`                                                                                                                                 |
| radar         | [radar.md:21](./docs/radar.ja.md#header)                               | `"radar-beta:---\nx\n---\naxis North\ncurve sample{1.50}\n"`                                                                                                                                            |
| railroad      | [railroad.md:1480](./docs/railroad.ja.md#共有-directive)               | `"railroad-beta\nr=sequence%%{init: {}}%%(\nterminal%%{init: {}}%%(%%{init: {}}%%\"a\"%%{init: {}}%%)%%{init: {}}%%,\n%%{init: {}}%%nonterminal(\"b\")\n);\n"`                                          |
| railroad      | [railroad.md:1551](./docs/railroad.ja.md#hidden-form-の保持)           | `"railroad-beta\nr %%{!name}%%\n= %%{!definition}%%\nsequence %%{!open}%%\n( %%{!arg}%%\nterminal(\"owned\") %%{!after}%%\n, %%{!next}%%\noptional(terminal(\"tail\")) %%{!close}%%\n) %%{!term}%%\n;"` |
| requirement   | [requirement.md:841](./docs/requirement.ja.md#1-行に-1-文)             | `requirementDiagram\nrequirement r {\n} %%{init: {}}%% element e {\n}\n`                                                                                                                                |
| requirement   | [requirement.md:1182](./docs/requirement.ja.md#アクセシビリティの文)   | `"requirementDiagram\n%%{init: {}}%% accDescr { x } accTitle:\ndirection LR\n"`                                                                                                                         |
| sequence      | [sequence.md:1548](./docs/sequence.ja.md#ディレクティブ)               | `sequenceDiagram%%{wrap}%% participant A`                                                                                                                                                               |
| sequence      | [sequence.md:1549](./docs/sequence.ja.md#ディレクティブ)               | `sequenceDiagram%%{wrap}%% participant A`                                                                                                                                                               |
| state         | [state.md:192](./docs/state.ja.md#複合状態)                            | `"stateDiagram-v2\nstate X { %%{init: {}}%% }\nstate Y {\n%% c\n}\n"`                                                                                                                                   |
| state         | [state.md:1425](./docs/state.ja.md#ディレクティブ)                     | `stateDiagram-v2%%{wrap}%% A-->B`                                                                                                                                                                       |
| state         | [state.md:1426](./docs/state.ja.md#ディレクティブ)                     | `stateDiagram-v2%%{wrap}%% A-->B`                                                                                                                                                                       |
| timeline      | [timeline.md:148](./docs/timeline.ja.md#1-行-1-文)                     | `timeline\naccDescr { d } %%{init: {}}%% a : e\n`                                                                                                                                                       |
| timeline      | [timeline.md:1446](./docs/timeline.ja.md#指令)                         | `timeline\naccDescr { d }   %%{init: {}}%%   \naccDescr { e }   %%{init: {}}%%  a : e\n`                                                                                                                |
| timeline      | [timeline.md:1451](./docs/timeline.ja.md#指令)                         | `"timeline\na %%{init: {}}%%: e\nb:%%{init: {}}%% e\nc : e%%{init: {}}%%: f\n"`                                                                                                                         |
| treeview      | [treeview.md:1128](./docs/treeview.ja.md#statements-one-per-line)      | `"treeView-beta\n\"a\"%%{x}%%\"b\"\n"`                                                                                                                                                                  |
| usecase       | [usecase.md:1191](./docs/usecase.ja.md#directives)                     | `"usecase-beta  %%{init: {}}%%\nA"`                                                                                                                                                                     |
| wardley       | [wardley.md:851](./docs/wardley.ja.md#global-directive)                | `wardley-beta%%{wrap}%%size[8,9]`                                                                                                                                                                       |
| xychart       | [xychart.md:1061](./docs/xychart.ja.md#指令)                           | `"xychart\nline %%{init: {}}%% [1]\nx-axis%%{init: {}}%%[a]\n"`                                                                                                                                         |

### directive の本文の空白をそろえるか

4 形が compatibility、journey、timeline、venn にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                                                                        |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| compatibility | [compatibility.md:7155](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"railroad-beta\nr=terminal(\"sty%%{x:w\nle\");\n"`                                               |
| journey       | [journey.md:752](./docs/journey.ja.md#複数行の文)                              | `"journey\nsection S\naccTitle:\n%%{init: {}}%% T\naccDescr\n%% colon\n:\n%% text\nD\nA:5:Me\n"`  |
| timeline      | [timeline.md:1147](./docs/timeline.ja.md#複数行の文)                           | `"timeline\nsection S\naccTitle:\n%% title\nT\naccDescr\n%% colon\n:\n%%{init: {}}%% D\na : b\n"` |
| venn          | [venn.md:957](./docs/venn.ja.md#directives)                                    | `"venn-beta\nset A\n\n%%{!\n %%{x y text A t\n"`                                                  |

### frontmatter の YAML とその字下げをどう整えるか

6 形が architecture、cynefin、eventmodeling、flowchart、railroad、
treeview にある。

| 図種          | 規則の文書                                                           | 書かれた形                                                                                                   |
| ------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| architecture  | [architecture.md:1101](./docs/architecture.ja.md#frontmatter-yaml)   | `---\ntitle: \|\n  Network\nconfig:\n  architecture:\n    iconSize: 24\n---\narchitecture-beta\nservice a\n` |
| cynefin       | [cynefin.md:1090](./docs/cynefin.ja.md#frontmatter-yaml)             | `"  ---\n  title: 'IndentedYaml'\n  ---\ncynefin-beta\nclear \"IndentedBody\""`                              |
| eventmodeling | [eventmodeling.md:1279](./docs/eventmodeling.ja.md#frontmatter-yaml) | `---\ntitle: \|\n    Multi\n    Title\nconfig:\n    eventmodeling:\n        padding: 12\n---\neventmodeling` |
| flowchart     | [flowchart.md:3587](./docs/flowchart.ja.md#フロントマターの-yaml)    | `"  ---\n  title: \|\n      ---\n  ---\nflowchart LR\nA\n"`                                                  |
| railroad      | [railroad.md:2675](./docs/railroad.ja.md#frontmatter-の-yaml)        | `"---\nconfig:\n  railroad:\n    fontSize: 19\n---\nrailroad-beta\nr=terminal(\"zero yaml\");"`              |
| treeview      | [treeview.md:2706](./docs/treeview.ja.md#frontmatter-yaml)           | `---\ntitle: \|\n  First\n  Second\n---\ntreeView-beta\nR\n`                                                 |

## 決まりで直す形

### 規則 1：コメント行の末尾の空白を取り除くか

276 形が agentflow、architecture、block、c4、class、compatibility、cynefin、er、
eventmodeling、flowchart、gantt、gitgraph、info、ishikawa、journey、kanban、
mindmap、packet、pie、quadrant、radar、railroad、requirement、sankey、sequence、
state、timeline、treemap、treeview、usecase、venn、wardley、xychart にある。

| 図種          | 規則の文書                                                                                           | 書かれた形                                                                                                                                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| agentflow     | [agentflow.md:215](./docs/agentflow.ja.md#names-and-headings)                                        | `"agentflow-beta TB\nflow F   %%{init: {}}%% [T]\nA\nend"`                                                                                                                                                                                  |
| agentflow     | [agentflow.md:230](./docs/agentflow.ja.md#names-and-headings)                                        | `"agentflow-beta TB\nconnector I \"\" J"`                                                                                                                                                                                                   |
| agentflow     | [agentflow.md:535](./docs/agentflow.ja.md#single-space-gaps)                                         | `"agentflow-beta TB\nA\nstyle A  %%{init: {}}%%fill:red"`                                                                                                                                                                                   |
| agentflow     | [agentflow.md:691](./docs/agentflow.ja.md#labels)                                                    | `"agentflow-beta TB\nA[x  %% c\n]"`                                                                                                                                                                                                         |
| agentflow     | [agentflow.md:909](./docs/agentflow.ja.md#kept-lines)                                                | 保持する行をまたぐ値とコメント全体、セミコロンの境界の U+2028/U+2029                                                                                                                                                                        |
| agentflow     | [agentflow.md:964](./docs/agentflow.ja.md#comments)                                                  | `"agentflow-beta TB\nA   %% note  \nB"`                                                                                                                                                                                                     |
| agentflow     | [agentflow.md:964](./docs/agentflow.ja.md#comments)                                                  | ` %% pre\nagentflow-beta TB\n%% top\nA\nflow F\n%% inside\nB\n%% before end\nend\n%% tail`                                                                                                                                                  |
| agentflow     | [agentflow.md:986](./docs/agentflow.ja.md#comments)                                                  | `"%%{unclosed\nagentflow-beta TB\nA"`                                                                                                                                                                                                       |
| agentflow     | [agentflow.md:1418](./docs/agentflow.ja.md#trailing-whitespace)                                      | `"agentflow-beta TB\nA[\"x  \"]"`                                                                                                                                                                                                           |
| agentflow     | [agentflow.md:1730](./docs/agentflow.ja.md#final-newline)                                            | `"agentflow-beta TB\nA\nstyle A  "`                                                                                                                                                                                                         |
| architecture  | [architecture.md:396](./docs/architecture.ja.md#label-content)                                       | `"architecture-beta\ngroup g(cloud)[ %%{x}%% T ]\ngroup h(cloud)[ T %%{x}%% ]\ngroup i(cloud)[ a;b ]\nservice s(server)[ x; ] in g\nservice t(server)[ y ] in g\n"`                                                                         |
| architecture  | [architecture.md:414](./docs/architecture.ja.md#label-content)                                       | 空白だけの内容、空の文字列、エスケープ、HTML、実体参照、コメントや directive がある見出し                                                                                                                                                   |
| architecture  | [architecture.md:519](./docs/architecture.ja.md#arrow-labels)                                        | `"architecture-beta\nservice a\nservice b\na:R -[ %%{x}%% Label ]- L:b\n"`                                                                                                                                                                  |
| architecture  | [architecture.md:704](./docs/architecture.ja.md#description-blocks)                                  | `"architecture-beta\nservice multi \"A\n   B\n\nC\" [\"D\n E\"]\naccDescr {\n  F\n\n G\n}\n"`                                                                                                                                               |
| architecture  | [architecture.md:794](./docs/architecture.ja.md#comments)                                            | `"%% lead\narchitecture-beta\n%% alone\nservice a%%touch\nservice b   %% separated  \n"`                                                                                                                                                    |
| architecture  | [architecture.md:796](./docs/architecture.ja.md#comments)                                            | `"architecture-beta\nservice percent \"A%%B\" [C%%D]\naccDescr {E%%F}\ntitle Topic%% inline\n"`                                                                                                                                             |
| architecture  | [architecture.md:1073](./docs/architecture.ja.md#trailing-whitespace)                                | `"architecture-beta\nservice a \"A  \nB\"\n"`                                                                                                                                                                                               |
| architecture  | [architecture.md:1102](./docs/architecture.ja.md#frontmatter-yaml)                                   | 先頭の LF、コメント、有効な形と隠れた形の順序を含むヘッダー前の全体                                                                                                                                                                         |
| block         | [block.md:687](./docs/block.ja.md#スタイル)                                                          | `"block-beta\nA\nstyle A fill:#f00 %%{init: {}}%% , stroke:#333\n"`                                                                                                                                                                         |
| block         | [block.md:887](./docs/block.ja.md#複数行の文)                                                        | `"block-beta\nblock: G\u2028%% c\n A\nend\n"`                                                                                                                                                                                               |
| block         | [block.md:940](./docs/block.ja.md#コメント)                                                          | `"block-beta\n%%   spaced   text  \na\n"`                                                                                                                                                                                                   |
| block         | [block.md:940](./docs/block.ja.md#コメント)                                                          | `block-beta\n%% a\ncolumns 2\n      %% b\na b\n    %% c\n`                                                                                                                                                                                  |
| block         | [block.md:1082](./docs/block.ja.md#空の説明ブロック)                                                 | `"block-beta\nblock:G\naccDescr {\n%% c\n}\naccDescr {\n%%{init: {}}%%\n}\nA\nend\n"`                                                                                                                                                       |
| block         | [block.md:1082](./docs/block.ja.md#空の説明ブロック)                                                 | `block-beta\nblock:G\naccDescr {\n%% c\n}\naccDescr {\n%%{init: {}}%%\n}\nA\nend\n`                                                                                                                                                         |
| block         | [block.md:1234](./docs/block.ja.md#行区切り文字)                                                     | U+2028/U+2029 の後のコメントが結合する行の文                                                                                                                                                                                                |
| c4            | [c4.md:1243](./docs/c4.ja.md#名前付き属性)                                                           | `"C4Context\nPerson(a,\"style:#x\",$descr; = \"V\")\n"`                                                                                                                                                                                     |
| c4            | [c4.md:1492](./docs/c4.ja.md#title-と-accdescription)                                                | `"C4Context\ntitle %%{init: {}}%%  T  \nPerson(a,\"A\")\n"`                                                                                                                                                                                 |
| c4            | [c4.md:1596](./docs/c4.ja.md#アクセシビリティの行)                                                   | `"C4Context\naccTitle:\n   direction LR\nPerson(a,\"A\")\n"`                                                                                                                                                                                |
| c4            | [c4.md:1714](./docs/c4.ja.md#説明ブロック)                                                           | `"C4Context\naccDescr {opener value\n       %% trailing note\n     }"`                                                                                                                                                                      |
| c4            | [c4.md:1714](./docs/c4.ja.md#説明ブロック)                                                           | `C4Context\naccDescr {opener value\n%% trailing note\n     }`                                                                                                                                                                               |
| c4            | [c4.md:1751](./docs/c4.ja.md#説明ブロック)                                                           | `"C4Context\naccDescr {\ndirection LR\n}\nPerson(a,\"A\")\n"`                                                                                                                                                                               |
| c4            | [c4.md:1881](./docs/c4.ja.md#空の説明ブロック)                                                       | `"C4Context accDescr {}accDescr { }\naccDescr {}accDescr {}Person(a,\"A\")accDescr {}\n"`                                                                                                                                                   |
| c4            | [c4.md:1888](./docs/c4.ja.md#空の説明ブロック)                                                       | `"C4Context accDescr {\u2028%% note\n}\nPerson(a,\"A\")\n"`                                                                                                                                                                                 |
| c4            | [c4.md:2211](./docs/c4.ja.md#行規則とセミコロン)                                                     | `"C4Context\n Person(a,\"style:#x;\");   \n"`                                                                                                                                                                                               |
| c4            | [c4.md:2327](./docs/c4.ja.md#フロントマターの-yaml)                                                  | `"---\ntitle:   T\n---\nC4Context\nPerson(a,\"A\")\n"`                                                                                                                                                                                      |
| class         | [class.md:60](./docs/class.ja.md#字下げ)                                                             | U+2028/U+2029 の後のコメントで分かれた namespace やメンバー本体の開始部                                                                                                                                                                     |
| class         | [class.md:449](./docs/class.ja.md#トークンの間の空白)                                                | `"classDiagram\nclass A\nstyle A fill   %%{init: {}}%%  #f00\n"`                                                                                                                                                                            |
| class         | [class.md:500](./docs/class.ja.md#トークンの間の空白)                                                | `"classDiagram\nclass A\nstyle A fill:#f00 %%{x}%% ,color:white\n"`                                                                                                                                                                         |
| class         | [class.md:596](./docs/class.ja.md#トークンの間の空白)                                                | コメントや directive がある引数全体から閉じ `)` まで                                                                                                                                                                                        |
| class         | [class.md:977](./docs/class.ja.md#コメント)                                                          | `classDiagram\n%% a comment line\nclass A\nA --> B %% after a relation\nA --> C%%touching\nclass B {\n        %% in a body\n+x\n}\n`                                                                                                        |
| class         | [class.md:977](./docs/class.ja.md#コメント)                                                          | `"classDiagram\n  %%no space  \n%%    spaced   text   \nclass A\n"`                                                                                                                                                                         |
| class         | [class.md:1557](./docs/class.ja.md#複数行の文)                                                       | `"classDiagram\nnote \"a   b\"\n"`                                                                                                                                                                                                          |
| class         | [class.md:1557](./docs/class.ja.md#複数行の文)                                                       | `"classDiagram\ndirection\n%% c\nLR\n"`                                                                                                                                                                                                     |
| class         | [class.md:1569](./docs/class.ja.md#複数行の文)                                                       | U+2028/U+2029 の後のコメントがある文と後続行の字下げ                                                                                                                                                                                        |
| class         | [class.md:1720](./docs/class.ja.md#空の説明ブロック)                                                 | `"classDiagram\naccDescr {\n%% c\n} class A\n"`                                                                                                                                                                                             |
| compatibility | [compatibility.md:1191](./docs/compatibility.ja.md#サイト設定)                                       | `"flowchart TD\nA\nstyle A fill:red %%{init: {}}%%\n"`                                                                                                                                                                                      |
| compatibility | [compatibility.md:1518](./docs/compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)           | 複数行の文字列、コメント・directive・U+2028/U+2029 がある文字列                                                                                                                                                                             |
| compatibility | [compatibility.md:1664](./docs/compatibility.ja.md#サイト設定)                                       | `"flowchart TD\nA\nclick A call f(x,,y)\n"`                                                                                                                                                                                                 |
| compatibility | [compatibility.md:1718](./docs/compatibility.ja.md#同じに描かれる-mindmap-のテキスト)                | 引用符に影響される図形の文字列、複数行の文字列、コメントや directive がある行                                                                                                                                                               |
| compatibility | [compatibility.md:3419](./docs/compatibility.ja.md#テキストの引用符)                                 | ラベルの余白と引用符、空白だけのラベル、コメントや directive があるラベル                                                                                                                                                                   |
| compatibility | [compatibility.md:3948](./docs/compatibility.ja.md#コメントやディレクティブの前後の構造の継続行)     | コメントや directive、複数行のスタイル文字列、セミコロンに影響される行                                                                                                                                                                      |
| compatibility | [compatibility.md:4522](./docs/compatibility.ja.md#複数行の-sequence-の文)                           | `title` と字下げされた値の間にコメントがあるタイトル                                                                                                                                                                                        |
| compatibility | [compatibility.md:4556](./docs/compatibility.ja.md#class-のラベルとメンバーの行)                     | コメントや directive、無視される文字列、行区切り文字、セミコロンの保護があるメソッド                                                                                                                                                        |
| compatibility | [compatibility.md:4596](./docs/compatibility.ja.md#説明ブロックの字下げ)                             | 説明の残りの文字列、改行、末尾の空白、directive の内容                                                                                                                                                                                      |
| compatibility | [compatibility.md:4606](./docs/compatibility.ja.md#説明ブロックの字下げ)                             | `{` の後のコメントや directive、その前の隙間と末尾の空白                                                                                                                                                                                    |
| compatibility | [compatibility.md:4910](./docs/compatibility.ja.md#置かれた場所や空白で読みが決まる-er-の行)         | 二つの名前までの隙間にあるコメント、directive、空行                                                                                                                                                                                         |
| compatibility | [compatibility.md:5212](./docs/compatibility.ja.md#場所や空白で決まる-requirement-の行)              | コメントや directive、保持する `;` があり、前の文と同じ行にある文                                                                                                                                                                           |
| compatibility | [compatibility.md:5331](./docs/compatibility.ja.md#空白で決まる-timeline-の行)                       | キーワードと値の間にコメントや directive がある title や section と値の余白                                                                                                                                                                 |
| compatibility | [compatibility.md:5618](./docs/compatibility.ja.md#テキスト引用符字句解析器で決まる象限チャートの行) | コメントや directive、非 ASCII 空白、セミコロン、余分なコロンがあるスタイルの内側                                                                                                                                                           |
| compatibility | [compatibility.md:5716](./docs/compatibility.ja.md#u2028-か-u2029-の後のコメント行)                  | 結合するソース行全体とその文、隙間、後続行の桁位置                                                                                                                                                                                          |
| compatibility | [compatibility.md:5722](./docs/compatibility.ja.md#u2028-か-u2029-の後のコメント行)                  | U+2028/U+2029 の後のコメントで分かれた図のコメント                                                                                                                                                                                          |
| compatibility | [compatibility.md:5809](./docs/compatibility.ja.md#u2028-か-u2029-の後のコメント行)                  | U+2028/U+2029 がある directive を越えて結合するコメントの断片                                                                                                                                                                               |
| compatibility | [compatibility.md:5900](./docs/compatibility.ja.md#error-擬似図)                                     | frontmatter と前後のコメントや directive を含む `error` 擬似図の全体                                                                                                                                                                        |
| compatibility | [compatibility.md:5935](./docs/compatibility.ja.md#ほかに書かれたまま残すもの)                       | `"kanban\n S\n   A[x]@{ticket: X,}@{assigned: Ada}\n"`                                                                                                                                                                                      |
| compatibility | [compatibility.md:5945](./docs/compatibility.ja.md#kanban-の字下げ不透明な末尾保持行)                | `style` や `classDef` で保持する行の区間全体、空白、コメント、directive                                                                                                                                                                     |
| compatibility | [compatibility.md:6086](./docs/compatibility.ja.md#ほかに書かれたまま残すもの)                       | `"ishikawa\n\"  R  \"\n 007\n []\n ``\n call ()\n accDescr {}\n A@{x: [}\n ::icon(x)\n :::c"`                                                                                                                                               |
| compatibility | [compatibility.md:6096](./docs/compatibility.ja.md#ishikawa-の入れ子と-literal-の行)                 | 深さに数えるコメント末尾の Unicode 文字、取り込まれる後続部分、行の結合                                                                                                                                                                     |
| compatibility | [compatibility.md:6247](./docs/compatibility.ja.md#usecase-native-syntax-and-authored-values)        | 説明の内容と改行、本体行の字下げ、独立した閉じ波括弧                                                                                                                                                                                        |
| compatibility | [compatibility.md:6260](./docs/compatibility.ja.md#usecase-native-syntax-and-authored-values)        | 内側の文字列と、保護された共通コメント領域の値全体                                                                                                                                                                                          |
| compatibility | [compatibility.md:6275](./docs/compatibility.ja.md#usecase-native-syntax-and-authored-values)        | 共通コメント領域の結合、LS/PS を含む native comment、セミコロンで保護する区間                                                                                                                                                               |
| compatibility | [compatibility.md:6310](./docs/compatibility.ja.md#pie-hidden-boundaries-and-authored-values)        | 検出で読み飛ばす前置部分全体と、先頭の LF、コメント                                                                                                                                                                                         |
| compatibility | [compatibility.md:6368](./docs/compatibility.ja.md#gitgraph-の-hidden-境界と書かれた履歴)            | 全体のコメントや directive、保護する文のまとまり、ヘッダーと最初の文の接触                                                                                                                                                                  |
| compatibility | [compatibility.md:6382](./docs/compatibility.ja.md#gitgraph-の-hidden-境界と書かれた履歴)            | 説明ブロックの波括弧の接触、空のブロック、コメントや directive、本体の字下げ                                                                                                                                                                |
| compatibility | [compatibility.md:6443](./docs/compatibility.ja.md#info-の-hidden-境界と原文の文)                    | セミコロン、保護区間をまたぐ値とコメントや directive、ヘッダーと本体のまとまり                                                                                                                                                              |
| compatibility | [compatibility.md:6511](./docs/compatibility.ja.md#packet-の-hidden-境界と原綴の-block)              | 空のアクセシビリティや説明の形、コメントや directive、本体行の字下げ                                                                                                                                                                        |
| compatibility | [compatibility.md:6516](./docs/compatibility.ja.md#packet-の-hidden-境界と原綴の-block)              | セミコロン、保護区間をまたぐ値とコメントや directive、ヘッダーと本体のまとまり                                                                                                                                                              |
| compatibility | [compatibility.md:6710](./docs/compatibility.ja.md#treemap-の親子と作者の値)                         | 複数行の文のスタイル文字列と、セミコロンで保護する区間                                                                                                                                                                                      |
| compatibility | [compatibility.md:6767](./docs/compatibility.ja.md#treemap-の親子と作者の値)                         | 共通の値や説明の外側の空白、内側の文字列とコメントや directive                                                                                                                                                                              |
| compatibility | [compatibility.md:6901](./docs/compatibility.ja.md#ほかに書かれたまま残すもの)                       | `"treeView-beta\nroot\n  :::c\n"`                                                                                                                                                                                                           |
| compatibility | [compatibility.md:7024](./docs/compatibility.ja.md#treeview-modes-and-authored-values)               | 接頭辞、コメントや directive、行の境界、値の解釈で描き直せない木の本体全体                                                                                                                                                                  |
| compatibility | [compatibility.md:7089](./docs/compatibility.ja.md#railroad-の方言と書かれた値)                      | 呼び出しの隙間とコメントや directive の内容、内側の接触、書かれた改行                                                                                                                                                                       |
| compatibility | [compatibility.md:7140](./docs/compatibility.ja.md#railroad-の方言と書かれた値)                      | IR・EBNF・ABNF・PEG のコメントの形と内容                                                                                                                                                                                                    |
| compatibility | [compatibility.md:7148](./docs/compatibility.ja.md#railroad-の方言と書かれた値)                      | `style` や `classDef` がある railroad の行全体と、文や内側の隙間                                                                                                                                                                            |
| compatibility | [compatibility.md:7159](./docs/compatibility.ja.md#railroad-の方言と書かれた値)                      | U+2028/U+2029 の後のコメントで結合するすべてのソース行                                                                                                                                                                                      |
| compatibility | [compatibility.md:7161](./docs/compatibility.ja.md#railroad-の方言と書かれた値)                      | 最初の行の本体の字下げ、内容、後続行の桁位置                                                                                                                                                                                                |
| compatibility | [compatibility.md:7190](./docs/compatibility.ja.md#railroad-の方言と書かれた値)                      | 保持する行をまたぐ文全体と、分割できない値、コメント、directive                                                                                                                                                                             |
| compatibility | [compatibility.md:7194](./docs/compatibility.ja.md#railroad-の方言と書かれた値)                      | `style` や `classDef` が名前、文字列、コメントに含まれる整形しない行                                                                                                                                                                        |
| compatibility | [compatibility.md:7332](./docs/compatibility.ja.md#wardley-の原文と必須の改行)                       | セミコロンと `style` または `classDef` があるソース行全体                                                                                                                                                                                   |
| compatibility | [compatibility.md:7342](./docs/compatibility.ja.md#wardley-の原文と必須の改行)                       | 最初の行の本体の字下げ、内容、後続行の桁位置と改行                                                                                                                                                                                          |
| compatibility | [compatibility.md:7582](./docs/compatibility.ja.md#eventmodeling-terminals-and-source-boundaries)    | コメントの記号と内容、LS/PS を含む native line comment                                                                                                                                                                                      |
| cynefin       | [cynefin.md:523](./docs/cynefin.ja.md#description-blocks)                                            | `"cynefin-beta\naccDescr {\nA\n\nB  \n}"`                                                                                                                                                                                                   |
| cynefin       | [cynefin.md:844](./docs/cynefin.ja.md#comments)                                                      | `"cynefin-beta\n%% comment  \nclear \"A\""`                                                                                                                                                                                                 |
| cynefin       | [cynefin.md:912](./docs/cynefin.ja.md#trailing-whitespace)                                           | 値の継続行、コメント、directive や隠れた形の内側、保護する文字列                                                                                                                                                                            |
| er            | [er.md:484](./docs/er.ja.md#属性の空白)                                                              | 物理行を結合するコメント領域の元の配置                                                                                                                                                                                                      |
| er            | [er.md:682](./docs/er.ja.md#1-行に-1-文)                                                             | 二つ目の名前までの二つの隙間と、コメント、directive、空行                                                                                                                                                                                   |
| er            | [er.md:1837](./docs/er.ja.md#アクセシビリティの文)                                                   | `erDiagram\naccTitle:\nT\naccDescr:\n\n  D\n`                                                                                                                                                                                               |
| er            | [er.md:1837](./docs/er.ja.md#アクセシビリティの文)                                                   | `"erDiagram\naccTitle:\n%% a comment line\nT\n"`                                                                                                                                                                                            |
| er            | [er.md:1872](./docs/er.ja.md#アクセシビリティの文)                                                   | `erDiagram\naccDescr { %%{init: {}}%% }\naccDescr {\n%% a comment line\n}\n`                                                                                                                                                                |
| er            | [er.md:1872](./docs/er.ja.md#アクセシビリティの文)                                                   | `"erDiagram\naccDescr { %%{init: {}}%% }\naccDescr {\n%% a comment line\n}\n"`                                                                                                                                                              |
| er            | [er.md:2039](./docs/er.ja.md#コメント)                                                               | `erDiagram\nA {\n%% c1\nint a\n      %% c2\n}\nsubgraph S\n%% c3\nB\n%% c4\nend\n`                                                                                                                                                          |
| er            | [er.md:2039](./docs/er.ja.md#コメント)                                                               | `"erDiagram\n%%no space\n%% two  spaces\n%%\t tab\n%%%\n%% # not a comment mark\nA\n"`                                                                                                                                                      |
| er            | [er.md:2690](./docs/er.ja.md#複数行の文)                                                             | 結合する行を保持した形                                                                                                                                                                                                                      |
| er            | [er.md:2973](./docs/er.ja.md#行区切り文字)                                                           | U+2028/U+2029 の後のコメントで結合する entity・subgraph・class の見出しの範囲                                                                                                                                                               |
| eventmodeling | [eventmodeling.md:300](./docs/eventmodeling.ja.md#qualified-names)                                   | `"eventmodeling tf 01 evt eventmodeling.Alpha"`                                                                                                                                                                                             |
| flowchart     | [flowchart.md:990](./docs/flowchart.ja.md#トークンの間の空白)                                        | `"flowchart LR\nA-->B\nstyle A fill:#f00 %%{x}%% ,color:white\n"`                                                                                                                                                                           |
| flowchart     | [flowchart.md:1191](./docs/flowchart.ja.md#トークンの間の空白)                                       | `"flowchart TD\nA\nB\nC\nclick A call f(\n) \"t\"\nclick B call g(\n%% c\n)\nclick C call h( \n\n )\n"`                                                                                                                                     |
| flowchart     | [flowchart.md:1775](./docs/flowchart.ja.md#アクセシビリティの行)                                     | `flowchart LR\naccTitle:\n%%{init: {}}%%\nTitle after directive\nA[Continuation]`                                                                                                                                                           |
| flowchart     | [flowchart.md:1775](./docs/flowchart.ja.md#アクセシビリティの行)                                     | `"flowchart LR\naccTitle:\n%% actual comment\nComment-separated title\nA"`                                                                                                                                                                  |
| flowchart     | [flowchart.md:1775](./docs/flowchart.ja.md#アクセシビリティの行)                                     | `"flowchart LR\naccTitle:\n%% actual comment\nComment-separated title\nA"`                                                                                                                                                                  |
| flowchart     | [flowchart.md:1842](./docs/flowchart.ja.md#アクセシビリティの行)                                     | `"flowchart LR\nA\naccDescr {\n%% only a comment\n      }\n"`                                                                                                                                                                               |
| flowchart     | [flowchart.md:1945](./docs/flowchart.ja.md#複数行の文)                                               | 構成要素やコメント・directive の隙間に改行がある複数行の `click` 文                                                                                                                                                                         |
| flowchart     | [flowchart.md:1953](./docs/flowchart.ja.md#複数行の文)                                               | 文字列や呼び出しの引数の中の改行と、変更しない後続行の桁位置                                                                                                                                                                                |
| flowchart     | [flowchart.md:1982](./docs/flowchart.ja.md#複数行の文)                                               | U+2028/U+2029 の後のコメントで結合する図や subgraph の見出し                                                                                                                                                                                |
| flowchart     | [flowchart.md:1991](./docs/flowchart.ja.md#複数行の文)                                               | そのように行を結合するコメントがある文の範囲全体                                                                                                                                                                                            |
| flowchart     | [flowchart.md:2464](./docs/flowchart.ja.md#データブロック)                                           | `flowchart LR\nA@{\n label: Alpha\n %% inside\n}\n`                                                                                                                                                                                         |
| flowchart     | [flowchart.md:2464](./docs/flowchart.ja.md#データブロック)                                           | `"flowchart LR\nA@{\n label: Alpha\n %% inside\n}\n"`                                                                                                                                                                                       |
| flowchart     | [flowchart.md:2514](./docs/flowchart.ja.md#複数行の値)                                               | `"flowchart LR\nsubgraph S\naccDescr {\n  a\n%% n\n   b\n}\nend\n"`                                                                                                                                                                         |
| flowchart     | [flowchart.md:2628](./docs/flowchart.ja.md#コメント)                                                 | `"flowchart LR\n%% \nA --> B\n"`                                                                                                                                                                                                            |
| gantt         | [gantt.md:784](./docs/gantt.ja.md#タイトルとセクション)                                              | `gantt\ntitle\nT\nsection\nS\n`                                                                                                                                                                                                             |
| gantt         | [gantt.md:1276](./docs/gantt.ja.md#空の説明ブロック)                                                 | `gantt\naccDescr { %%{init: {}}%% }\naccDescr {\n%% c\n}\n`                                                                                                                                                                                 |
| gantt         | [gantt.md:1276](./docs/gantt.ja.md#空の説明ブロック)                                                 | `"gantt\naccDescr { %%{init: {}}%% }\naccDescr {\n%% c\n}\n"`                                                                                                                                                                               |
| gantt         | [gantt.md:1345](./docs/gantt.ja.md#複数行の文)                                                       | title・section・設定・タスクの、複数行にわたるコメントや directive の元の配置                                                                                                                                                               |
| gantt         | [gantt.md:1351](./docs/gantt.ja.md#複数行の文)                                                       | `"gantt\nexcludes ΑΒ\ufeffΣ\n"`                                                                                                                                                                                                             |
| gantt         | [gantt.md:1495](./docs/gantt.ja.md#トークンの間の空白)                                               | コメントや directive がある引数から `)` までと、閉じ記号の前の空白                                                                                                                                                                          |
| gantt         | [gantt.md:1531](./docs/gantt.ja.md#コメント)                                                         | `gantt\n      %% one\ntitle T\n\t%% two\nsection S\n%% three\n   a : 1d\n`                                                                                                                                                                  |
| gitgraph      | [gitgraph.md:489](./docs/gitgraph.ja.md#title-and-common-values)                                     | `"gitGraph\naccDescr {\n a  \n\n b\n}"`                                                                                                                                                                                                     |
| gitgraph      | [gitgraph.md:490](./docs/gitgraph.ja.md#title-and-common-values)                                     | `"gitGraph\naccDescr %%{wrap}%%\n{ a }\n"`                                                                                                                                                                                                  |
| gitgraph      | [gitgraph.md:498](./docs/gitgraph.ja.md#title-and-common-values)                                     | `"gitGraph\naccTitle:\ncommit id:\"x\"\naccDescr:\n\ncommit   id:\"y\"\n"`                                                                                                                                                                  |
| gitgraph      | [gitgraph.md:564](./docs/gitgraph.ja.md#comments)                                                    | `"%% before\ngitGraph %% header\ncommit%% glued\ncommit  %% apart\n    %% last\n"`                                                                                                                                                          |
| gitgraph      | [gitgraph.md:566](./docs/gitgraph.ja.md#comments)                                                    | `"gitGraph\ncommit id:\"A\"\n%% note\u2028swallowed\ncommit"`                                                                                                                                                                               |
| gitgraph      | [gitgraph.md:625](./docs/gitgraph.ja.md#hidden-yaml)                                                 | `"gitGraph commit id:---\nopaque\n---\n\"root\"\n"`                                                                                                                                                                                         |
| gitgraph      | [gitgraph.md:806](./docs/gitgraph.ja.md#trailing-whitespace)                                         | `"gitGraph\ncommit id:\"A  \nB\"\n"`                                                                                                                                                                                                        |
| gitgraph      | [gitgraph.md:859](./docs/gitgraph.ja.md#frontmatter-yaml)                                            | 保持するヘッダー前の全体と、先頭の LF、有効な形と隠れた形の順序                                                                                                                                                                             |
| info          | [info.md:147](./docs/info.ja.md#accessibility-lines)                                                 | `"info\naccTitle: A  B%% c"`                                                                                                                                                                                                                |
| info          | [info.md:195](./docs/info.ja.md#description-blocks)                                                  | `"info\naccDescr {\nx\n\ny  \n}"`                                                                                                                                                                                                           |
| info          | [info.md:397](./docs/info.ja.md#comments)                                                            | `"info\n%% c  "`                                                                                                                                                                                                                            |
| info          | [info.md:397](./docs/info.ja.md#comments)                                                            | `"info\n%% c\u2028title T"`                                                                                                                                                                                                                 |
| info          | [info.md:399](./docs/info.ja.md#comments)                                                            | `"info\n%%{x\n  y}%%\ntitle T"`                                                                                                                                                                                                             |
| info          | [info.md:583](./docs/info.ja.md#trailing-whitespace)                                                 | `"info\n%% c  "`                                                                                                                                                                                                                            |
| ishikawa      | [ishikawa.md:313](./docs/ishikawa.ja.md#comments)                                                    | `"ishikawa\nR\n%% note"`                                                                                                                                                                                                                    |
| ishikawa      | [ishikawa.md:513](./docs/ishikawa.ja.md#trailing-whitespace)                                         | `"ishikawa\n  R\n    A  %%{init: {}}%%\n    B  %%{init: {}}%%  \n    C  %%{init: {}}%%  %%{init: {}}%%\n    D  %%{init: {}}%%  %%{init: {}}%%  \n    E  %%{init: {}}%%%%{init: {}}%%  \n    F   G   %%{init: {}}%%  \n"`                    |
| ishikawa      | [ishikawa.md:513](./docs/ishikawa.ja.md#trailing-whitespace)                                         | `"ishikawa\nR  %%{init: {\n}}%%   X \t\n A:"`                                                                                                                                                                                               |
| ishikawa      | [ishikawa.md:620](./docs/ishikawa.ja.md#line-rule-and-kept-lines)                                    | `"ishikawa\nR\n      style A fill:#abc;"`                                                                                                                                                                                                   |
| ishikawa      | [ishikawa.md:668](./docs/ishikawa.ja.md#physical-lines)                                              | `"ishikawa\nR%%{init: {\n}}%%  X\n A"`                                                                                                                                                                                                      |
| ishikawa      | [ishikawa.md:797](./docs/ishikawa.ja.md#line-separators)                                             | `"ishikawa\nR%% c\u2028suffix\n A"`                                                                                                                                                                                                         |
| ishikawa      | [ishikawa.md:797](./docs/ishikawa.ja.md#line-separators)                                             | `"ishikawa\nR%% c\u2028suffix\n A"`                                                                                                                                                                                                         |
| journey       | [journey.md:351](./docs/journey.ja.md#タスクのデータ)                                                | タスクデータの空白の後にコメントやほかの文字が続く行全体                                                                                                                                                                                    |
| journey       | [journey.md:495](./docs/journey.ja.md#タイトルとセクション)                                          | `journey\ntitle\nT\nsection\nS\n`                                                                                                                                                                                                           |
| journey       | [journey.md:753](./docs/journey.ja.md#複数行の文)                                                    | `"journey\nsection S\naccTitle:\n%%{init: {}}%% T\naccDescr\n%% colon\n:\n%% text\nD\nA:5:Me\n"`                                                                                                                                            |
| journey       | [journey.md:761](./docs/journey.ja.md#複数行の文)                                                    | title や section の複数行のコメントや directive の元の配置と、値の余白                                                                                                                                                                      |
| journey       | [journey.md:889](./docs/journey.ja.md#コメント)                                                      | `journey\n# before the title\ntitle T\n# before a section\nsection S\n# before a task\nA: 5\n# before the next section\nsection U\nB: 1\n# at the end`                                                                                      |
| journey       | [journey.md:889](./docs/journey.ja.md#コメント)                                                      | `"journey\n#   spaced    text  \n%   x\ntitle T\n"`                                                                                                                                                                                         |
| kanban        | [kanban.md:678](./docs/kanban.ja.md#空行)                                                            | `"kanban\n S\n%%\n\n   A\n"`                                                                                                                                                                                                                |
| kanban        | [kanban.md:693](./docs/kanban.ja.md#空行)                                                            | `"kanban\n S\n%%\n\n\n"`                                                                                                                                                                                                                    |
| kanban        | [kanban.md:770](./docs/kanban.ja.md#コメント)                                                        | `kanban\n%% c1\n S\n       %% c2\n   A\n%% c3\n`                                                                                                                                                                                            |
| kanban        | [kanban.md:770](./docs/kanban.ja.md#コメント)                                                        | `"kanban\n%% c1\n S\n       %% c2\n   A\n%% c3\n"`                                                                                                                                                                                          |
| kanban        | [kanban.md:782](./docs/kanban.ja.md#コメント)                                                        | `"kanban\n S\n%%\n\n   A\n"`                                                                                                                                                                                                                |
| kanban        | [kanban.md:933](./docs/kanban.ja.md#行の規則と保つ行)                                                | `"kanban\n S\n   A[style:#x;] %% c;\n"`                                                                                                                                                                                                     |
| kanban        | [kanban.md:1067](./docs/kanban.ja.md#空白文字)                                                       | `%% c\u2029` の後の `A` を含む LF までのコメントと、その字下げ                                                                                                                                                                              |
| kanban        | [kanban.md:1095](./docs/kanban.ja.md#空白文字)                                                       | `(built) "kanban\n S[x]%% c\u2028%% note\n %%{x}%%A\n"`                                                                                                                                                                                     |
| kanban        | [kanban.md:1230](./docs/kanban.ja.md#複数行の値)                                                     | ``"kanban\n S\n   A[x\n y]\n   B[\"p\n q\"]\n   C[\"`r\n s`\"]\n ::icon(fa\n  fa-star)\n"``                                                                                                                                                 |
| mindmap       | [mindmap.md:653](./docs/mindmap.ja.md#コメント)                                                      | `"mindmap\n  root\n%%\n    a\n %%{ }%%\n    b\n"`                                                                                                                                                                                           |
| packet        | [packet.md:251](./docs/packet.ja.md#label-content)                                                   | 余白、エスケープ、HTML、実体参照、共通のコメントや directive を含むラベルの範囲全体                                                                                                                                                         |
| packet        | [packet.md:392](./docs/packet.ja.md#description-blocks)                                              | `"packet\naccDescr {\n%% removed comment\n}\n"`                                                                                                                                                                                             |
| packet        | [packet.md:394](./docs/packet.ja.md#description-blocks)                                              | `packet\naccDescr {\n first\n   second\n\n last\n        }\n`                                                                                                                                                                               |
| packet        | [packet.md:394](./docs/packet.ja.md#description-blocks)                                              | `"packet\naccDescr {\n first\n   second\n\n last\n        }\n"`                                                                                                                                                                             |
| packet        | [packet.md:396](./docs/packet.ja.md#description-blocks)                                              | `"packet\naccDescr {\n%% removed comment\n}\n"`                                                                                                                                                                                             |
| packet        | [packet.md:467](./docs/packet.ja.md#comments)                                                        | `"    %% before\npacket%% header\n0:\"Touch\"%%inline\n1:\"Apart\"   %% separated  \n    %%%\n"`                                                                                                                                            |
| packet        | [packet.md:469](./docs/packet.ja.md#comments)                                                        | 共通コメント領域の全体と、結合される継続行の桁位置                                                                                                                                                                                          |
| packet        | [packet.md:798](./docs/packet.ja.md#trailing-whitespace)                                             | `"packet\n0:\"Comment\" %% tail \t\n"`                                                                                                                                                                                                      |
| pie           | [pie.md:287](./docs/pie.ja.md#description-blocks)                                                    | `"pie\naccDescr {\n  first\n    second\n        }\n\"Data\":2"`                                                                                                                                                                             |
| pie           | [pie.md:287](./docs/pie.ja.md#description-blocks)                                                    | `"pie\naccDescr {\nx\n\ny  \n}"`                                                                                                                                                                                                            |
| pie           | [pie.md:289](./docs/pie.ja.md#description-blocks)                                                    | `"pie\naccDescr {%% c\nD}"`                                                                                                                                                                                                                 |
| pie           | [pie.md:334](./docs/pie.ja.md#hidden-yaml)                                                           | 不正・空・入れ子のような不透明な内容、内側のコメントや directive、複数の形                                                                                                                                                                  |
| pie           | [pie.md:455](./docs/pie.ja.md#comments)                                                              | `"pie\n%% c  "`                                                                                                                                                                                                                             |
| pie           | [pie.md:459](./docs/pie.ja.md#comments)                                                              | 共通コメント領域に取り込まれるソース全体と、継続行の桁位置                                                                                                                                                                                  |
| pie           | [pie.md:606](./docs/pie.ja.md#trailing-whitespace)                                                   | `"pie\n\"a\n b\":1"`                                                                                                                                                                                                                        |
| quadrant      | [quadrant.md:478](./docs/quadrant.ja.md#スタイル)                                                    | `"quadrantChart\nA: [0.3, 0.6] radius :  10: keep  suffix,color:#AbC: ignored\nclassDef c stroke-width :  2px:\n"`                                                                                                                          |
| quadrant      | [quadrant.md:834](./docs/quadrant.ja.md#複数行の文)                                                  | `"quadrantChart\nclassDef c color: %%{init: {\n \"x\": 1\n}}%%#f00\n"`                                                                                                                                                                      |
| quadrant      | [quadrant.md:853](./docs/quadrant.ja.md#複数行の文)                                                  | 行を結合するコメント領域をまたいで続く `classDef` の名前                                                                                                                                                                                    |
| quadrant      | [quadrant.md:968](./docs/quadrant.ja.md#コメント)                                                    | `"quadrantChart\ntitle T\n     %% last\n"`                                                                                                                                                                                                  |
| radar         | [radar.md:539](./docs/radar.ja.md#description-blocks)                                                | `"radar-beta\naccDescr {\nFirst\n    Second\n        }\n"`                                                                                                                                                                                  |
| radar         | [radar.md:539](./docs/radar.ja.md#description-blocks)                                                | `"radar-beta\naccDescr {\n%% only comment\n}\n"`                                                                                                                                                                                            |
| radar         | [radar.md:541](./docs/radar.ja.md#description-blocks)                                                | `"radar-beta\naccDescr {\n%%{wrap}%%\n}\n"`                                                                                                                                                                                                 |
| radar         | [radar.md:643](./docs/radar.ja.md#comments)                                                          | `"radar-beta\naxis North%%touch\ncurve trial{4}   %% separated  \n"`                                                                                                                                                                        |
| radar         | [radar.md:644](./docs/radar.ja.md#comments)                                                          | 値に属するパーセント記号の文字列と、共通コメント領域全体                                                                                                                                                                                    |
| radar         | [radar.md:982](./docs/radar.ja.md#trailing-whitespace)                                               | `"radar-beta\naxis North %% note  \t\n"`                                                                                                                                                                                                    |
| railroad      | [railroad.md:785](./docs/railroad.ja.md#長い行)                                                      | `"railroad-beta\nr=sequence(terminal(\"first\"), %%{init: {}}%% terminal(\"second\"));\n"`                                                                                                                                                  |
| railroad      | [railroad.md:1223](./docs/railroad.ja.md#説明ブロック)                                               | `"railroad-beta\naccDescr\n{\n   first\n\n  continuation\n}\nr=terminal(\"description\");"`                                                                                                                                                 |
| railroad      | [railroad.md:1223](./docs/railroad.ja.md#説明ブロック)                                               | `"railroad-beta\naccDescr\n{\n   first\n\n  continuation\n}\nr=terminal(\"description\");"`                                                                                                                                                 |
| railroad      | [railroad.md:1247](./docs/railroad.ja.md#説明ブロック)                                               | `"railroad-beta\naccDescr {%%{wrap}%%}\naccDescr {\n%% removed block\n}\nr=terminal(\"trivia block\");"`                                                                                                                                    |
| railroad      | [railroad.md:1315](./docs/railroad.ja.md#コメント)                                                   | `"railroad-beta\nr=/*first\n second*/terminal(\"comment\");"`                                                                                                                                                                               |
| railroad      | [railroad.md:1335](./docs/railroad.ja.md#コメント)                                                   | `"railroad-beta\nr=terminal\n/* constructor */(\"a\"\n/* closer */);\n"`                                                                                                                                                                    |
| railroad      | [railroad.md:1860](./docs/railroad.ja.md#セミコロン)                                                 | `"railroad-abnf-beta\n r=\"first\" ; content; protected\n \"last\";\n"`                                                                                                                                                                     |
| railroad      | [railroad.md:1868](./docs/railroad.ja.md#セミコロン)                                                 | `"railroad-beta\n r=terminal( \"classDef\" );"`                                                                                                                                                                                             |
| railroad      | [railroad.md:1869](./docs/railroad.ja.md#セミコロン)                                                 | 行のすべての文、コメント、native の隠れた形、内側の空白                                                                                                                                                                                     |
| railroad      | [railroad.md:1880](./docs/railroad.ja.md#セミコロン)                                                 | `"railroad-beta\nr=terminal(\"style\");\u2028%% c\ns=terminal(\"x\");"`                                                                                                                                                                     |
| railroad      | [railroad.md:1882](./docs/railroad.ja.md#セミコロン)                                                 | `"railroad-beta\nr=terminal(\"style\");\u2028%% c\ns=terminal(\"x\");"`                                                                                                                                                                     |
| railroad      | [railroad.md:1911](./docs/railroad.ja.md#セミコロン)                                                 | `"railroad-beta\n/*x\nstyle*/r=terminal(\":\"\n)/*#*/;"`                                                                                                                                                                                    |
| railroad      | [railroad.md:1920](./docs/railroad.ja.md#セミコロン)                                                 | `"railroad-peg-beta\n r<-( \"style\" );"`                                                                                                                                                                                                   |
| railroad      | [railroad.md:2605](./docs/railroad.ja.md#空行)                                                       | `"railroad-abnf-beta\n r=\"first\" ; content; protected\n \"last\";\n"`                                                                                                                                                                     |
| requirement   | [requirement.md:451](./docs/requirement.ja.md#関係文の空白)                                          | 無視する `;` を決める改行、末尾の `;`、行を結合するコメントの配置                                                                                                                                                                           |
| requirement   | [requirement.md:595](./docs/requirement.ja.md#スタイルとクラス)                                      | `"requirementDiagram\nrequirement r {\nid: 1\ntext: t\nrisk: low\nverifymethod: test\n}\nSTYLE r fill:#f00,color:red;;\nCLASSDEF c fill:#f00,color:red;;\nSTYLE r fill:red %%{init:\n{}}%% stroke:#f00,color:red;;\nCLASSDEF d fill:red\n"` |
| requirement   | [requirement.md:856](./docs/requirement.ja.md#1-行に-1-文)                                           | 最初の文から二つ目の文の終わりまでの行全体                                                                                                                                                                                                  |
| requirement   | [requirement.md:1051](./docs/requirement.ja.md#空の説明ブロック)                                     | `requirementDiagram\nrequirement r {\naccDescr {\n%%{init: {}}%%\n}\nid: 1\n}\n`                                                                                                                                                            |
| requirement   | [requirement.md:1051](./docs/requirement.ja.md#空の説明ブロック)                                     | `"requirementDiagram\naccDescr { %%{init: {}}%% }\naccDescr {\n%% c\n}\n"`                                                                                                                                                                  |
| requirement   | [requirement.md:1128](./docs/requirement.ja.md#アクセシビリティの文)                                 | `requirementDiagram\naccTitle:\nT\naccDescr:\n\n D\naccTitle\n: U\n`                                                                                                                                                                        |
| requirement   | [requirement.md:1128](./docs/requirement.ja.md#アクセシビリティの文)                                 | `"requirementDiagram\naccTitle:\n%% c\nT\n"`                                                                                                                                                                                                |
| requirement   | [requirement.md:1538](./docs/requirement.ja.md#コメント)                                             | `requirementDiagram\n%% c1\nrequirement r {\n      %% c2\nid: 1\n%% c3\n}\n   %% c4\nelement e {\n}\n`                                                                                                                                      |
| requirement   | [requirement.md:1889](./docs/requirement.ja.md#行区切り文字)                                         | U+2028/U+2029 と行を結合するコメントの前の文字列の引用符                                                                                                                                                                                    |
| sankey        | [sankey.md:447](./docs/sankey.ja.md#コメント)                                                        | `"sankey\n%%   spaced    text  \na,b,1\n"`                                                                                                                                                                                                  |
| sankey        | [sankey.md:589](./docs/sankey.ja.md#空白文字)                                                        | `"sankey\na,b,1\n%% c\u00a0"`                                                                                                                                                                                                               |
| sequence      | [sequence.md:1084](./docs/sequence.ja.md#タイトル)                                                   | 途中にコメントがあるタイトル全体と、値の字下げ                                                                                                                                                                                              |
| sequence      | [sequence.md:1117](./docs/sequence.ja.md#コメント)                                                   | `sequenceDiagram\n%% a comment line\n# a hash comment\nA->>B: x # after a text\nautonumber 5%% touching\nloop x\n    %% inside\nA->>B: y\nend\n`                                                                                            |
| sequence      | [sequence.md:1117](./docs/sequence.ja.md#コメント)                                                   | `"sequenceDiagram\n%%   a   b   \n  # c   d  \nA->>B: x\n"`                                                                                                                                                                                 |
| sequence      | [sequence.md:1188](./docs/sequence.ja.md#コメント)                                                   | `"sequenceDiagram\n%% style:#x;  \nA->>B: x\n"`                                                                                                                                                                                             |
| sequence      | [sequence.md:1451](./docs/sequence.ja.md#行区切り)                                                   | ヘッダーや文、コメント、後続の文字列と、変更しない隙間や桁位置                                                                                                                                                                              |
| sequence      | [sequence.md:1504](./docs/sequence.ja.md#行区切り)                                                   | 図のコメント内のセミコロンと、整形する行の残りの部分                                                                                                                                                                                        |
| sequence      | [sequence.md:1677](./docs/sequence.ja.md#複数行の文)                                                 | キーワードと字下げされた値の間にコメントや directive があるタイトル全体                                                                                                                                                                     |
| sequence      | [sequence.md:1678](./docs/sequence.ja.md#複数行の文)                                                 | `"sequenceDiagram\nA->>B: x\u2028%% c\nC->>D: y\n"`                                                                                                                                                                                         |
| sequence      | [sequence.md:1710](./docs/sequence.ja.md#複数行の値)                                                 | `"sequenceDiagram\naccDescr {\n%% c\n}\n"`                                                                                                                                                                                                  |
| sequence      | [sequence.md:1857](./docs/sequence.ja.md#書かれたまま残すもの)                                       | セミコロンがある行や、行を結合するコメント領域で保護する文                                                                                                                                                                                  |
| state         | [state.md:599](./docs/state.ja.md#トークンの間の空白)                                                | `"stateDiagram-v2\nstate A\nclassDef c fill:#f00 %%{x}%% , color:white\n"`                                                                                                                                                                  |
| state         | [state.md:1365](./docs/state.ja.md#コメント)                                                         | `stateDiagram-v2\n%% a comment line\nA --> B %% after a transition\nA --> C%%touching\n# a hash comment\nstate D {\n        %% in a body\nE\n}\n`                                                                                           |
| state         | [state.md:1365](./docs/state.ja.md#コメント)                                                         | `"stateDiagram-v2\nA\n%%no space\n#no space\n%%   many   spaces   \n  # hash   \nB\n"`                                                                                                                                                      |
| state         | [state.md:1596](./docs/state.ja.md#複数行の値)                                                       | `"stateDiagram-v2\naccDescr { %%{init: {}}%% }\naccDescr {\n%% empty description comment\n}\nA"`                                                                                                                                            |
| state         | [state.md:1806](./docs/state.ja.md#複数行の文)                                                       | 隙間の最初の行の末尾と、保護する文や行を結合する文の全体                                                                                                                                                                                    |
| state         | [state.md:1948](./docs/state.ja.md#行区切り文字)                                                     | `"stateDiagram-v2\nstate A {\nB\u2028\n}\n"`                                                                                                                                                                                                |
| state         | [state.md:2036](./docs/state.ja.md#書かれたまま残すもの)                                             | セミコロンがある行や、行を結合するコメント領域で保護する文                                                                                                                                                                                  |
| timeline      | [timeline.md:678](./docs/timeline.ja.md#title-と-section)                                            | `timeline\ntitle\nT\nsection\nS\n`                                                                                                                                                                                                          |
| timeline      | [timeline.md:1148](./docs/timeline.ja.md#複数行の文)                                                 | `"timeline\nsection S\naccTitle:\n%% title\nT\naccDescr\n%% colon\n:\n%%{init: {}}%% D\na : b\n"`                                                                                                                                           |
| timeline      | [timeline.md:1153](./docs/timeline.ja.md#複数行の文)                                                 | title・section・イベント継続行の複数行のコメントや directive と、値の余白                                                                                                                                                                   |
| timeline      | [timeline.md:1344](./docs/timeline.ja.md#コメント)                                                   | `timeline\n# before the title\ntitle T\n# before a section\nsection S\n# before a period\na : e\n# before the next section\nsection U\nb : f\n# at the end`                                                                                 |
| timeline      | [timeline.md:1344](./docs/timeline.ja.md#コメント)                                                   | `"timeline\n#   spaced    text  \n%   x\ntitle T\n"`                                                                                                                                                                                        |
| timeline      | [timeline.md:1605](./docs/timeline.ja.md#行区切り文字)                                               | `}` の後も含む、U+2028/U+2029 の後のコメントが結合する行全体                                                                                                                                                                                |
| treemap       | [treemap.md:600](./docs/treemap.ja.md#semicolons)                                                    | 行を結合するコメントの前のセミコロン、U+2028/U+2029、その行全体                                                                                                                                                                             |
| treemap       | [treemap.md:755](./docs/treemap.ja.md#title)                                                         | 次の行を結合するコメントの前に U+2028/U+2029 があるタイトル行                                                                                                                                                                               |
| treemap       | [treemap.md:883](./docs/treemap.ja.md#description-blocks)                                            | `"treemap\naccDescr  {\n  first\n\n    second\n}\n\"AfterDescription\":3"`                                                                                                                                                                  |
| treemap       | [treemap.md:883](./docs/treemap.ja.md#description-blocks)                                            | `"treemap\naccDescr  {\n  first\n\n    second\n}\n\"AfterDescription\":3"`                                                                                                                                                                  |
| treemap       | [treemap.md:970](./docs/treemap.ja.md#component-newlines)                                            | `"treemap\n\"Selector\":2%% gap\n:::zz"`                                                                                                                                                                                                    |
| treemap       | [treemap.md:1048](./docs/treemap.ja.md#comments)                                                     | `"treemap\n\"Tail\":2%% note  \n"`                                                                                                                                                                                                          |
| treemap       | [treemap.md:1151](./docs/treemap.ja.md#prefix)                                                       | `"%%{%%{wrap}%%wrap}%%\ntreemap\n\"SecondScan\":2"`                                                                                                                                                                                         |
| treemap       | [treemap.md:1209](./docs/treemap.ja.md#trailing-whitespace)                                          | `"treemap\n\"Line  \n continuation\t\":2"`                                                                                                                                                                                                  |
| treeview      | [treeview.md:276](./docs/treeview.ja.md#branch-prefixes)                                             | `"treeView-beta\nroot\n├── a\n│ %%{init: {}}%%  └── b\n"`                                                                                                                                                                                   |
| treeview      | [treeview.md:1184](./docs/treeview.ja.md#statements-one-per-line)                                    | スペースやタブ以外の空白の後にコメントが続くときの、同じ行のノードと本体全体                                                                                                                                                                |
| treeview      | [treeview.md:1287](./docs/treeview.ja.md#annotation-lines)                                           | 結合で枝、値のタブ、罫線モードが変わるときに保持する本体全体                                                                                                                                                                                |
| treeview      | [treeview.md:1724](./docs/treeview.ja.md#title)                                                      | 次の行を結合するコメントの前に U+2028/U+2029 があるタイトル行                                                                                                                                                                               |
| treeview      | [treeview.md:1894](./docs/treeview.ja.md#description-blocks)                                         | `treeView-beta\naccDescr {\n  first\n\n    second\n}\nR\n`                                                                                                                                                                                  |
| treeview      | [treeview.md:1894](./docs/treeview.ja.md#description-blocks)                                         | `"treeView-beta\naccDescr {%%{init: {}}%%}\nR\n"`                                                                                                                                                                                           |
| treeview      | [treeview.md:2105](./docs/treeview.ja.md#comments)                                                   | `"treeView-beta\n\"R\" %% c\n"`                                                                                                                                                                                                             |
| treeview      | [treeview.md:2112](./docs/treeview.ja.md#comments)                                                   | `"treeView-beta\nR %% literal\n"`                                                                                                                                                                                                           |
| treeview      | [treeview.md:2436](./docs/treeview.ja.md#blank-lines)                                                | `"treeView-beta\n\"first\n\n last\"\n"`                                                                                                                                                                                                     |
| treeview      | [treeview.md:2582](./docs/treeview.ja.md#trailing-whitespace)                                        | `"treeView-beta\nR ##   \n"`                                                                                                                                                                                                                |
| usecase       | [usecase.md:207](./docs/usecase.ja.md#labels)                                                        | 行区切り文字と、次の行を結合するコメントの前にある引用符付きの文字列                                                                                                                                                                        |
| usecase       | [usecase.md:1023](./docs/usecase.ja.md#direction-and-accessibility)                                  | `"usecase-beta\naccTitle: first  last\n"`                                                                                                                                                                                                   |
| usecase       | [usecase.md:1071](./docs/usecase.ja.md#direction-and-accessibility)                                  | `"usecase-beta\naccDescr {a\u2028%% c\n b}\n"`                                                                                                                                                                                              |
| usecase       | [usecase.md:1147](./docs/usecase.ja.md#comments)                                                     | `  %% before\nusecase-beta\n%% top\nsystemBoundary Box\nA\n%% before end\nend\n%% tail   `                                                                                                                                                  |
| usecase       | [usecase.md:1147](./docs/usecase.ja.md#comments)                                                     | `"%% before\nusecase-beta\n%% top\nsystemBoundary Box\nA\n%% before end\nend\n%% tail"`                                                                                                                                                     |
| usecase       | [usecase.md:1157](./docs/usecase.ja.md#comments)                                                     | 共通コメント領域の全体、取り込まれる後続部分、行の結合、後続行の桁位置                                                                                                                                                                      |
| usecase       | [usecase.md:1275](./docs/usecase.ja.md#trailing-whitespace)                                          | ``"usecase-beta\nA(\"`first  \nlast  `\")\naccTitle: title  \n%% comment  "``                                                                                                                                                               |
| usecase       | [usecase.md:1378](./docs/usecase.ja.md#final-newline)                                                | ``"usecase-beta\nA(\"`x  `\")"``                                                                                                                                                                                                            |
| venn          | [venn.md:31](./docs/venn.ja.md#venn-の整形規則)                                                      | 最後のセミコロンまでの保護する前置部分と、またがる値、コメント、directive の全体                                                                                                                                                            |
| venn          | [venn.md:275](./docs/venn.ja.md#comments)                                                            | `"venn-beta\nset \"A%%x\"[L%%y]\ntitle T%%z"`                                                                                                                                                                                               |
| venn          | [venn.md:526](./docs/venn.ja.md#quotes)                                                              | 空白だけのラベルと、`%%`・directive・コメントがあるラベル                                                                                                                                                                                   |
| venn          | [venn.md:663](./docs/venn.ja.md#style-properties)                                                    | `"venn-beta\nset A\nstyle A fill:rgb(1,\n%% ) x  y\n  2,3)\n"`                                                                                                                                                                              |
| venn          | [venn.md:800](./docs/venn.ja.md#line-rule-and-kept-lines)                                            | `"venn-beta\nset A[style:#x;y]%% c\u2028tail;"`                                                                                                                                                                                             |
| venn          | [venn.md:812](./docs/venn.ja.md#line-rule-and-kept-lines)                                            | それぞれの入力の解釈で保持するコメント全体                                                                                                                                                                                                  |
| venn          | [venn.md:1035](./docs/venn.ja.md#trailing-whitespace)                                                | `"venn-beta\nset \" A \"[ L ]\nstyle A fill:\" red \"\ntitle T   "`                                                                                                                                                                         |
| wardley       | [wardley.md:657](./docs/wardley.ja.md#アクセシビリティ)                                              | `"wardley-beta\naccDescr {\n  first\n\n    second\n      }"`                                                                                                                                                                                |
| wardley       | [wardley.md:895](./docs/wardley.ja.md#コメント)                                                      | `wardley-beta\ncomponent Pc[0.4,0.5]\npipeline Pc {\n%% child note\ncomponent Cc[0.6]%% child tail\n}`                                                                                                                                      |
| wardley       | [wardley.md:895](./docs/wardley.ja.md#コメント)                                                      | `"wardley-beta%% heading\ncomponent Inline[0.3,0.6]%% tail \t"`                                                                                                                                                                             |
| wardley       | [wardley.md:952](./docs/wardley.ja.md#行末の空白)                                                    | リンクラベルの末尾、値・コメント・directive・隠れた形の内容、保護する区間                                                                                                                                                                   |
| wardley       | [wardley.md:981](./docs/wardley.ja.md#セミコロン)                                                    | `"wardley-beta\nAlpha  -> Beta; style:#tone;"`                                                                                                                                                                                              |
| wardley       | [wardley.md:986](./docs/wardley.ja.md#セミコロン)                                                    | `"wardley-beta\nAlpha  -> Beta; style:#tone;"`                                                                                                                                                                                              |
| wardley       | [wardley.md:986](./docs/wardley.ja.md#セミコロン)                                                    | `"wardley-beta\nAlpha->Beta;; extra"`                                                                                                                                                                                                       |
| xychart       | [xychart.md:987](./docs/xychart.ja.md#コメント)                                                      | `"xychart\ntitle T\n     %% last\n"`                                                                                                                                                                                                        |

### 規則 1：構造上の隙間の U+2028 と U+2029 をそろえるか

3 形が class、state にある。

| 図種  | 規則の文書                                            | 書かれた形                                         |
| ----- | ----------------------------------------------------- | -------------------------------------------------- |
| class | [class.md:407](./docs/class.ja.md#トークンの間の空白) | `"classDiagram\nclassDef c1,\u2028 c2 fill:red\n"` |
| class | [class.md:786](./docs/class.ja.md#ラベル)             | `"classDiagram\nclass A[\"x\"\u2028]\n"`           |
| state | [state.md:681](./docs/state.ja.md#トークンの間の空白) | `"stateDiagram-v2\nclass A,\u2028 B c\n"`          |

### 規則 1：文の中のどの物理行の改行をつなぐか

1 形が compatibility にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                            |
| ------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| compatibility | [compatibility.md:6660](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"radar-beta\ncurve trial{4,\n%% entry note\n5\n}\n"` |

### 規則 1：directive や隠れた形の横の空白をどう書くか

1 形が pie にある。

| 図種 | 規則の文書                                         | 書かれた形               |
| ---- | -------------------------------------------------- | ------------------------ |
| pie  | [pie.md:240](./docs/pie.ja.md#accessibility-lines) | `"pie\n\"A\":%%{}%%\n1"` |

### 規則 1：構造上の部分の間の通常の隙間をどう書くか

2 形が wardley にある。

| 図種    | 規則の文書                                        | 書かれた形                                       |
| ------- | ------------------------------------------------- | ------------------------------------------------ |
| wardley | [wardley.md:41](./docs/wardley.ja.md#字下げ)      | `"wardley-beta\nAlpha  -> Beta; style:#tone;\n"` |
| wardley | [wardley.md:977](./docs/wardley.ja.md#セミコロン) | `"wardley-beta\nAlpha  -> Beta; style:#tone;"`   |

### 規則 2：構造上の部分の間の隙間をどう書くか

4 形が agentflow、er、state にある。

| 図種      | 規則の文書                                                   | 書かれた形                                                                                                                    |
| --------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| agentflow | [agentflow.md:1451](./docs/agentflow.ja.md#line-terminators) | `"agentflow-beta TB\nA\nclass\tA\tc"`                                                                                         |
| agentflow | [agentflow.md:1797](./docs/agentflow.ja.md#click-statements) | `"agentflow-beta TB\nA\nclick A \"/u\"\t_blank"`                                                                              |
| er        | [er.md:2862](./docs/er.ja.md#複数行の文)                     | `"erDiagram\nA\u2028%% c\nBar B  {\nint x\n}\n"`                                                                              |
| state     | [state.md:523](./docs/state.ja.md#トークンの間の空白)        | `"stateDiagram-v2\nstate A :::c\nstate \"x\" as B ::: c\nstate \"y\" as D:::c\nstate C ::: c {\n  E\n}\nstate F   :::   c\n"` |

### 規則 2：本体の最初の項目を開始記号と同じ行に置くか

1 形が er にある。

| 図種 | 規則の文書                                | 書かれた形                                                                                                                                                          |
| ---- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| er   | [er.md:254](./docs/er.ja.md#属性ブロック) | `"erDiagram\nA[\"x;y\"] {   int id\n}\nB[\"x;y\"] {\t\tint id\n}\nC[\"x;y\"] {int id\n}\nD[\"x;y\"] {   \nint id\n}\nE[\"x;y\"] { int id }\nF[\"x;y\"] {int id}\n"` |

### 規則 2：閉じ波括弧の後の U+2028 と U+2029 を取り除くか

1 形が state にある。

| 図種  | 規則の文書                                       | 書かれた形                                   |
| ----- | ------------------------------------------------ | -------------------------------------------- |
| state | [state.md:1931](./docs/state.ja.md#行区切り文字) | `"stateDiagram-v2\nstate A {\nB\n}\u2028\n"` |

### 規則 2：値の先頭の余白をそろえるか

2 形が agentflow、compatibility にある。

| 図種          | 規則の文書                                                                     | 書かれた形                                  |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------- |
| agentflow     | [agentflow.md:1417](./docs/agentflow.ja.md#trailing-whitespace)                | `"agentflow-beta TB\nA\nstyle A  fill:red"` |
| compatibility | [compatibility.md:6143](./docs/compatibility.ja.md#ほかに書かれたまま残すもの) | `"agentflow-beta TB\nstyle A  fill:red\n"`  |

### 規則 2：空の本体の内側の空白をどう書くか

1 形が er にある。

| 図種 | 規則の文書                               | 書かれた形                           |
| ---- | ---------------------------------------- | ------------------------------------ |
| er   | [er.md:2823](./docs/er.ja.md#複数行の文) | `"erDiagram\nA\u2028%% c\nBar {}\n"` |

### 規則 3：どの名前とラベルを引用符で囲むか

2 形が c4、compatibility にある。

| 図種          | 規則の文書                                                           | 書かれた形                                                                                                                  |
| ------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| c4            | [c4.md:936](./docs/c4.ja.md#quotes)                                  | `"C4Context\nPerson(\"b\", B, %%{init: {}}%% D,)\nPerson(\"c\", C; c,)\nPerson(\"d\", \"D\")\nPerson(\"a\", A,) %% note\n"` |
| compatibility | [compatibility.md:3637](./docs/compatibility.ja.md#テキストの引用符) | `"%%{init: {\"themeCSS\":\"white-space:pre\"}}%%\nquadrantChart\nquadrant-2 \"c\td\"\n"`                                    |

### 規則 3：カーディナリティの単語を記号で書くか

2 形が compatibility、er にある。

| 図種          | 規則の文書                                                      | 書かれた形                                                                                         |
| ------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| compatibility | [compatibility.md:2555](./docs/compatibility.ja.md#er-図の関係) | `"erDiagram\nA only one %%{init: {}}%% to zero or more B : x\n"`                                   |
| er            | [er.md:1244](./docs/er.ja.md#関係の空白)                        | `"erDiagram\nA only one %%{init: {}}%% to zero or more B : x\nC only one to zero or more D : y\n"` |

### 規則 3：同じ値の数値の書き方をそろえるか

2 形が quadrant、treemap にある。

| 図種     | 規則の文書                                        | 書かれた形                                                                                                                                   |
| -------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| quadrant | [quadrant.md:471](./docs/quadrant.ja.md#スタイル) | `"quadrantChart\nA: [0.3, 0.6] radius :  0010,color:#AbC,stroke-color : #A1b2C3,stroke-width:002px\nclassDef c radius:0005,color :  #0f0\n"` |
| treemap  | [treemap.md:211](./docs/treemap.ja.md#separators) | `"treemap\n\"First\",12,,\"Second\":3"`                                                                                                      |

## まだ書いていない理由

この節の形には理由があるが、Claude はそれを図種の規則に書いていない。
1 つは、書かれたまま残している形で、別の形を走らせると、
どの種類の例外も認めない形で Db が変わるか、図が変わるか、拒否されるものである。
もう 1 つは、整形ツールが直して印字する形で、Claude が会話の中で理由を挙げ、
選んだものである（理由が「読みやすい」だけでもよい）。
それぞれの理由は、fixture とともに図種の規則に書き、その形はこの一覧から外す。
いまこの節に載っている形はない。

[kept]: ./docs/compatibility.ja.md#対象にする版の-mermaidjs-のために残す形
