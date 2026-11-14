# Langium の図種を読む（tests-diagram-type）

以下の節の番号は、[SKILL.ja.md](../SKILL.ja.md) の節の番号である。

Langium の図種では、その図種自身の文法と service から次の事項を導く。
terminal の順序、境界、変換、公開を図種ごとに導き直す。
共通規則を import しただけでは、その図種での使われ方は決まらない。

1. `entry` 規則から import と規則呼出しをたどる。
   書かれた文法と生成文法を読む。
   token builder と value converter を注入する service module も確かめる。
   hidden を含め、到達可能な terminal だけを結果の順序で列挙する。
   import 先に宣言があるだけでは到達しない。
   terminal の構成規則も、独立した字句単位になるとは限らない。
   clone に生成ファイルがなければ、
   インストールされた pin の bundle の source map を読み、
   生成 module・文法と書かれた service の配線を照合する。
2. keyword のパターンも読む。
   独自の境界を持つもの、既定の順序を使うもの、
   明示的な `longer_alt` の選択肢を持つものを列挙する。
   [共有の token builder](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/common/tokenBuilder.ts#L7-L31)
   は指定された keyword だけに、空白・EOF・percent ペアの先読み境界を加える。
   一般的な最長一致ではなく、最初に合う規則を取る。
   keyword 境界と明示的な選択肢も単位を決める。
   接着した接尾辞、keyword の接頭辞、keyword に接した記号、
   参照・数・文字列・共通の複合 terminal との優先順位を probe する。
   検出には、それ自身の境界がある。
3. hidden terminal が字句規則として消費するテキストを調べる。
   全体の除去とは区別する。
   import した
   [YAML・DIRECTIVE terminal](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/common/common.langium#L25-L34)
   は直後の LF を消費し、ほかの空白境界は先読みだけする。
   各単位の隙間と各文の EOL・EOF を probe する。
   唯一の LF が消えると次の文は拒否されるが、
   共通の付加 LF が消えた場合は EOF で EOL を満たせる。
   先頭の frontmatter、共通の directive 除去、本文の hidden terminal を分ける。
   閉じを選ぶ前に、選択肢の優先順位を導く。
   本文のある選択肢が、隣接する空の閉じより先に選ばれる場合がある。
   保持する接頭部と、通過した裸行の trivia について、
   検出から parser への受渡しを、その図種で独立に probe する。
4. 実際の terminal 規則名から、注入された converter と fallback をたどる。
   恒等・文字列・整数・double の変換は、到達するものだけを調べる。
   [共通の converter](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/common/valueConverter.ts#L26-L70)
   は、行とブロックの共通の値で空白の読みが異なる。
   たとえば pie の
   [独自分岐](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/pie/valueConverter.ts#L6-L16)
   は PIE_SECTION_LABEL を名指すが、
   [文法](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/pie/pie.langium#L1-L20)
   は STRING を呼び、既定の escape 変換に進む。
   到達する単位について、両方の引用符、未知の escape、精度、overflow、
   underflow を集める。
   前の図種の単位に到達しない所は、拒否の対照を置き、理由を記す。
5. 回復した AST だけでなく公開の受理の門を読む。
   [公開 parse wrapper](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/parse.ts#L134-L150)
   は字句・構文エラーが 1 つでもあれば拒否する。
   次に、その図種の AST から Db への公開をたどる。
   保存する値、条件付き・省略する代入、値を代入しない文法の literal、
   adapter が捨てる文を区別する。
   再代入の順序、最後の空値、重複の扱い、公開後の意味上の拒否を記録する。
   何も公開せず、要約が空になる図種もある。
   先頭・回復した文の内部・正しい接頭辞の後のエラーを、
   到達可能な Db の拒否それぞれとは別に調べる。
6. parse を await する spec を記録できるよう、
   collector の parse stub は非同期にする。
   `Promise.resolve(record(text))` で呼出しを記録する。
   Langium を実行せず、受理を模倣しない。
   共有の recorder で spec を実行し、
   各記録位置が実際の parse 呼出しであることを確かめる。
   stub のために最後の入力の後でだけ本体が失敗するテストは、
   入力の欠落がないと証明してから、
   [collecting-fixtures.ja.md](collecting-fixtures.ja.md) の手順 3
   の既存の明示的な許可を使える。
   normalizer、固定 fixture、安定した生成は 2 節と 3 節に従う。
   AST の定義後は SKILL [tests-tree-checks](../../tests-tree-checks/SKILL.ja.md)
   の手順で Db builder と checker を実装する。
