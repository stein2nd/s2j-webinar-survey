<!--
目的：「実装状況サマリー」の明文化
-->

# S2J Webinar Survey - 実装状況

本ページは、現状の実装状況を機能単位で一覧します。
索引は [specs.md](./specs.md) です。計算規則の正本は Survey Service の `docs/` です。

最終更新: 2026-10-10

## 仕様書 (参照元)

* [specs.md](./specs.md) — 索引
* [plugin_spec.md](./plugin_spec.md) — 統合見取り図
* [admin_ui_spec.md](./admin_ui_spec.md) / [draft_ui_spec.md](./draft_ui_spec.md) / [persistence_spec.md](./persistence_spec.md)
* [governance/documentation_governance.md](./governance/documentation_governance.md) — ドキュメント運用
* [archive/README.md](./archive/README.md) — 完了イニシアチブ (まだなし)

## 機能一覧

| 機能名 | 実装済み/未実装 | 実装％ | 完了条件 |
| --- | --- | --- | --- |
| 仕様 (`docs/`) | 確定 | — | `docs_mod/` から移行済み。変更案は `docs_mod/` |
| Composer require (`s2j/webinar-survey-service`) | 未実装 | 0 | Packagist 名のみ。`VCS`/`path` なし |
| サイト設定 (`s2j_webinar_survey_max_questions`、1〜15、デフォルト6) | 未実装 | 0 | [admin_ui_spec.md](./admin_ui_spec.md) / [data_dictionary.md](./data_dictionary.md) |
| イベントパネル (設問 CRUD ・5種) | 未実装 | 0 | GatherPress 編集画面。フォーク非改変 |
| 大事な指針の表示 | 未実装 | 0 | パネル冒頭のみ |
| 明示の投稿保存時 `evaluate` + メタ文書 | 未実装 | 0 | `object` + `show_in_rest` + `edit_post` 相当 auth。`save_post` で正規化上書き (成功時のみ。クライアント `status` 不信頼)。除外と許可は [persistence_spec.md](./persistence_spec.md)。成功後パネル同期必須 |
| 表示専用 `evaluate` (開く／再読込・採用直後) | 未実装 | 0 | 入力はパネル文書。上限は開き直しで反映 (2発火+保存)。`POST …/v1/evaluate` (初版出力はコード列のみ)。搬送は PHP 経由 |
| 不足・助言のメッセージ表示 | 未実装 | 0 | コードを画面に出さず、適切なメッセージ文を i18n 経由で出す |
| 下書きボタン + コネクタ1回 | 未実装 | 0 | `POST …/v1/draft` 1リクエスト (`build`→コネクタ→`parse`)。契約は [draft_ui_spec.md](./draft_ui_spec.md) |
| コネクタ欠如時の案内 | 未実装 | 0 | ボタン非表示 |
| アンインストール処理 | 未実装 | 0 | メタと option 削除。Zoom 非接触 |
| S2J Webinar による `ready` 読取 | 相手側 | — | 本プラグインはメタを置くまで |

## 補足

* Zoom 添付の実装は S2J Webinar の後続である。
* 初版に公開フロントのアンケート画面は含めない。
