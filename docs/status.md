# S2J Webinar Survey - 実装状況

最終更新: 2026-10-14

索引は [specs.md](./specs.md) です。計算規則の正本は [Survey Service の `docs/`](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/specs.md) です。

## 仕様書 (参照元)

* [specs.md](./specs.md) — 索引
* [plugin_spec.md](./plugin_spec.md) — 統合見取り図
* [admin_ui_spec.md](./admin_ui_spec.md) / [draft_ui_spec.md](./draft_ui_spec.md) / [persistence_spec.md](./persistence_spec.md) / [data_dictionary.md](./data_dictionary.md)
* [governance/documentation_governance.md](./governance/documentation_governance.md) — ドキュメント運用
* [archive/README.md](./archive/README.md) — 完了イニシアチブ (まだなし)
* [test-results.md](./test-results.md) — 段階1–3・外部結合の記録 (未整備時は本ファイル §品質を参照)

## 機能一覧

**完了条件列:** 100% 到達用チェックリスト。`[x]` = 満たし済み、`[ ]` = 未。正本 spec は各§の見出しリンク。

**実装％** は、各§の **プラグイン検証可能** 項 (`[x]` / その全数) のみ。Zoom ステージング等は [§外部結合ゲート](#status-external) に分離する。

| 機能名 | 実装済み/未実装 | 実装％ | 完了条件 (100%) |
| --- | --- | --- | --- |
| 仕様 (`docs/`) | 確定 | — | [§仕様分割](#status-spec-docs) |
| Composer + Survey Service | 未実装 | 0 | [§Composer](#status-composer) (0/3) |
| サイト設定 (設問上限) | 未実装 | 0 | [§設定](#status-settings) (0/3) |
| イベントパネル (設問 CRUD) | 未実装 | 0 | [§管理 UI](#status-admin-ui) (0/8) |
| 評価 + メタ文書 (`evaluate`) | 未実装 | 0 | [§永続化](#status-persistence) (0/6) |
| 下書き + コネクタ (`draft`) | 未実装 | 0 | [§下書き UI](#status-draft) (0/4) |
| S2J Webinar `ready` 読取 | 相手側 | — | Webinar [§Survey 引き渡し](https://github.com/stein2nd/s2j-webinar/blob/main/docs/status.md#status-survey) |
| 配布・テスト、CI | 未着手 | 0 | [§品質・スモーク](#status-quality) (0/8) |

## 100% 完了条件チェックリスト

各§は **プラグイン実装 → Test (PHPUnit / smoke) → Test (wp-env)** の順。Zoom / 手動は [§外部結合ゲート](#status-external)。

### 仕様分割 {#status-spec-docs}

* [x] 正本が `docs/`、変更案は `docs_mod/` ([governance/documentation_governance.md](./governance/documentation_governance.md))
* [ ] CI: `docs-lint` (Workflow 追加時)

### Composer {#status-composer}

* [ ] `composer.json` — Packagist 名のみで `s2j/webinar-survey-service`
* [ ] `vendor/autoload.php` ブートストラップ
* [ ] Test: Service 橋渡し smoke

### 設定 {#status-settings}

正本: [admin_ui_spec.md](./admin_ui_spec.md) / [data_dictionary.md](./data_dictionary.md)

* [ ] option `s2j_webinar_survey_max_questions` (1〜15、デフォルト6)
* [ ] 設定 UI (管理画面)
* [ ] Test: option 保存

### 管理 UI {#status-admin-ui}

正本: [admin_ui_spec.md](./admin_ui_spec.md)

#### プラグイン実装

* [ ] GatherPress イベント Fill — 設問 CRUD、5種
* [ ] 大事な指針 — パネル冒頭のみ
* [ ] 不足・助言 — コード非表示、i18n メッセージ
* [ ] コネクタ欠如時 — 下書きボタン非表示
* [ ] 表示専用 `evaluate` — 開く / 再読込
* [ ] Gutenberg — メタ REST 双方向
* [ ] 初版 — 公開フロントアンケート画面 **なし** ([overview](./overview.md) 非目標)

#### Test

* [ ] Smoke: REST / Fill 到達
* [ ] wp-env — メタ REST 往復

### 永続化 {#status-persistence}

正本: [persistence_spec.md](./persistence_spec.md)

* [ ] `register_post_meta` — `object` + `show_in_rest` + `edit_post` auth
* [ ] 明示保存時 `evaluate` + メタ文書 (クライアント `status` 不信頼)
* [ ] `save_post` 正規化 (成功時のみ)
* [ ] `POST …/v1/evaluate` — 表示専用、コード列出力
* [ ] 除外経路 — autosave / Quick Edit 等 ([persistence_spec.md](./persistence_spec.md))
* [ ] Test: 純 PHPUnit + wp-env

### 下書き UI {#status-draft}

正本: [draft_ui_spec.md](./draft_ui_spec.md)

* [ ] `POST …/v1/draft` — build → コネクタ → parse (1リクエスト)
* [ ] 成功後パネル同期必須
* [ ] Test: draft 契約
* [ ] Test: コネクタモック

### 品質・スモーク {#status-quality}

* [ ] 段階3a: `composer test` + CI PHPUnit
* [ ] 段階1: `tests/smoke-local.sh`
* [ ] 段階2: `studio/smoke-test-blueprint.json`
* [ ] `.wp-env.json` + wp-env PHPUnit
* [ ] CI: js-lint / docs-lint / dist-zip / phpunit
* [ ] [test-results.md](./test-results.md) — S2J Webinar と同型の3段階表
* [ ] 段階3b — wp-env green
* [ ] 手動 — Gutenberg 翻訳 (任意)

### アンインストール {#status-uninstall}

* [ ] メタ + option 削除
* [ ] Zoom 非接触

## 外部結合ゲート {#status-external}

**100% 分母外。** Pass は [test-results.md](./test-results.md) に記録 (整備後)。

**Local 可 / 要 HTTPS:** [S2J Webinar test-results](https://github.com/stein2nd/s2j-webinar/blob/main/docs/test-results.md) と同型。

| # | 内容 | Local 可 / 要 HTTPS |
| --- | --- | --- |
| E1 | 前提 — Webinar OAuth (Survey 単体 UI のみ) | **Local 可** (Survey パネル骨格) |
| E2 | コネクタ API — 実 LLM / 外部 draft | **項目依存** (モック Local 可) |
| E3 | Survey `ready` → Webinar `attach_survey` | **要 HTTPS** (E1・実 sync 後 — Webinar E4) |
| E4 | Zoom 上アンケート添付 | **要 HTTPS** (Webinar 後続) |

## 補足

* **実装％** はプラグイン検証可能項のみ。
* Zoom 添付の実装は S2J Webinar 側 sync 後続 ([plugin_spec.md](./plugin_spec.md))。
* UX 参照: [S2J ウェビナー・ソース追跡 QR](https://github.com/stein2nd/s2j-webinar-source-qr/blob/main/docs/overview.md) (別 Fill、別メタ)。

## 実装ロードマップ (到達順)

1. **Composer + Service** → **メタ + evaluate** → **管理 UI** → **draft + コネクタ** → **配布、CI** → **品質 (段階1–3)** → **外部結合 (E3 – E4)**
