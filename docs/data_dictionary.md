<!--
目的：「メタキー、option、文書形への参照」の明文化
-->

# S2J Webinar Survey - データ辞書

本ドキュメントは、本プラグインが永続化する **キーと意味** を定義します。
設問文書のフィールド意味・不足・助言コードの正本は、Survey Service です。

本プラグイン内の作業コピーと保存済みの呼び分けは、下記のとおりです (詳細は [persistence_spec.md](./persistence_spec.md))。

| 用語 | 意味 |
| --- | --- |
| パネル文書 | 編集中の作業コピー (未保存可) |
| メタ文書 | `_s2j_webinar_survey` に保存された正規化済み文書 (`status` 含む) |
| 下書き候補 | 下書き UI の一時データ (どちらにも未確定)。文書の `status: draft` ではない。DraftKind は `survey` / `prompt` / `choices` |

## 非対象

* Zoom API のフィールド名 (webinar-service)
* 不足・助言の判定条件 (サービス `docs/core/`)

## イベントメタ

| キー | 型 | 説明 |
| --- | --- | --- |
| `_s2j_webinar_survey` | object (保護メタ) | そのイベントのメタ文書。`status` を含む。1イベントにつき1つ。`register_post_meta`: `type` = `object` (相当)、`show_in_rest`、`auth_callback` は `edit_post` 相当。REST 入力はサービス文書同型 (`status` なし可)。クライアントの `status` は信頼せず、`save_post` で `evaluate` 戻り上書き。プロパティ schema 詳細は実装でよい (意味は Service 正本)。詳細は [persistence_spec.md](./persistence_spec.md) |

### メタ文書が持つ形

形はサービス文書と同じです。詳細は [document_spec.md](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/core/document_spec.md) と [data_contract_spec.md](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/contracts/data_contract_spec.md) です。

* `internal_name`
* `questions[]` (`prompt`、`answer_kind`、`required`、`identifies_respondent`、`purpose`、`choices`、`score_min`、`score_max`、`label_low`、`label_high`)
* `status` (`draft` \| `ready`) — パネル用語の「状態」(保存済みのみ。コードのまま表示)。日本語で「下書き」と呼ばない。**明示の投稿保存時**の `evaluate` 戻りでのみメタ文書に書く。表示専用 `evaluate` では書き戻さない。メタ未作成時は「状態」バッジを出さない (または「未保存」)

### メタ文書に持たないもの

* 助言・不足コードの列 (パネル表示時はパネル文書への揮発の `evaluate` で再計算。メタ非永続)
* 下書き候補 (人が採用するまで揮発。採用後はパネル文書に。メタ文書は次の明示の投稿保存まで触らない)

## サイト option

Settings API の group / name は、本キーとそろえる。

| キー | 型 | 説明 |
| --- | --- | --- |
| `s2j_webinar_survey_max_questions` | int | 設問総数の上限。受け付け1〜15。Service に渡す直前は必ず `int` (文字列のまま渡さない)。未設定・空・`(int)` 後に範囲外は6。詳細は [persistence_spec.md](./persistence_spec.md) |

## answer_kind (パネル表示)

Zoom の `short_answer` 等は、本辞書に登録しません。

**自由記述**は `short` または `long` の総称である。パネルの呼び名は「短い回答」「長い回答」である。助言表などで「自由記述」と書く場合も、この総称を指す。

**選択式**は `single` または `multiple` の総称である。パネルの呼び名は「単一選択」「複数選択」である。

| 文書値 | パネルの呼び名 |
| --- | --- |
| `single` | 単一選択 |
| `multiple` | 複数選択 |
| `short` | 短い回答 |
| `long` | 長い回答 |
| `rating` | レーティング・スケール |

## 不足・助言コード

一覧と条件の正本は、サービスです。

本プラグインは、コードから適切なメッセージ文を表示するだけです (国際化関数を経由。[admin_ui_spec.md](./admin_ui_spec.md))。

* 不足: [validation_spec.md](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/core/validation_spec.md)
* 助言: [advice_spec.md](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/core/advice_spec.md)

## 一貫性ルール

* コード名は snake_case のまま扱い、画面に生コードを出さない。
* `status` はサービス結果を正とし、手編集で `ready` にしない。
