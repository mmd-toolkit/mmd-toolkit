# 図の対応状況

mmd-toolkitは、**Mermaid 12.0.0の全図種**に対応します。
パーサー、フォーマッター、リンターは、共通の構文定義に基づいて動作します。

## 各ツールでできること

すべての図種に同じツールを利用できます。

| ツール                                     | 用途                                                               |
| ------------------------------------------ | ------------------------------------------------------------------ |
| [パーサー](../parser/index.ja.md)          | 図のテキストを解析し、ASTを返す。                                  |
| [フォーマッター](../formatter/index.ja.md) | Prettierでインデント、空白、改行を整える。                         |
| [リンター](../linter/index.ja.md)          | ESLintで構文エラーと、有効なルールが検出した書き間違いを報告する。 |

lintルールは、それぞれ特定の書き間違いを検出します。
各ルールの対象と診断例は、[ルール一覧][rules]から確認できます。

## 互換性の範囲

互換性の基準はmermaid.js **12.0.0**です。
対象は、このバージョンの図のテキストの構文です。
図の描画とレイアウトはMermaidが担当します。

- [互換性](./index.ja.md): 各ツールの保証と検証する範囲。
- [既知の差異][divergences]: 構文の受理や読み取りに関する差異。
- [フォーマッターの互換性][formatter]: 整形の保証と例外。

[rules]: ../../../eslint-plugin-mmd/docs/rules/index.ja.md
[divergences]: ../../../spec/docs/known-divergences.ja.md
[formatter]: ../../../prettier-plugin-mmd/docs/compatibility.ja.md
