# 整形オプション

プラグインは[Prettier標準のオプション][prettier-options]を使います。
独自のオプションはありません。
次のオプションを[Prettierの設定](./configuration.ja.md)に指定します。

## 図の整形に反映されるPrettierオプション

- [`tabWidth`][tab-width]: 図をスペースでインデントするときの幅。
- [`useTabs`][tabs]: 図のインデントにタブを使うかどうか。
- [`endOfLine`][end-of-line]: 整形結果の改行コード。

## インデント

たとえば、次のMermaidの入力は、

```mmd
flowchart LR
subgraph S
A --> B
end
```

スペースによるインデントと`tabWidth: 4`を選ぶと、
1段あたりスペース4個のインデントになります。

```mmd
flowchart LR
    subgraph S
        A --> B
    end
```

`useTabs: true`を指定すると、
図のインデント1段につきタブ1文字を使います。

## 行の長さ

`printWidth`は、図の行を折り返しません。
MarkdownやYAML frontmatterの整形では、
Prettierが`printWidth`を使う場合があります。

## オンラインで試す

Playgroundで[スペース4個の例][spaces-example]か[タブの例][tabs-example]を開き、
**Formatted**タブを選びます。
**Indent**で`tabWidth`を、**Use tabs**で`useTabs`を変更できます。
値を変更すると、整形結果が更新されます。
Playgroundの整形結果は、常にLFの改行コードになります。

[prettier-options]: https://prettier.io/docs/options
[tab-width]: https://prettier.io/docs/options#tab-width
[tabs]: https://prettier.io/docs/options#tabs
[end-of-line]: https://prettier.io/docs/options#end-of-line
[spaces-example]: https://mmd-toolkit.github.io/mmd-toolkit/playground/#v1=H4sIAAAAAAAAE6tWKs4vLUpOVbJSSsvJL0_OSCwqUfAJiskrLk1KL0osyFAIjslzVNDVtVNwislLzUuJyVPSUSpJTArPTCnJULIy0VEqLU4NSUwqVrJKS8wpTq0FAMg1m-5SAAAA
[tabs-example]: https://mmd-toolkit.github.io/mmd-toolkit/playground/#v1=H4sIAAAAAAAAE6tWKs4vLUpOVbJSSsvJL0_OSCwqUfAJiskrLk1KL0osyFAIjslzVNDVtVNwislLzUuJyVPSUSpJTArPTCnJULIy0VEqLU4NSUwqVrIqKSpNrQUAtB2x3lEAAAA
