# S2J Webinar Survey - 実装状況

最終更新: 2026-10-19

索引は [specs.md](./specs.md) です。計算規則の正本は [Survey Service の `docs/`](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/specs.md) です。

## 仕様書 (参照元)

* [specs.md](./specs.md) — 索引
* [plugin_spec.md](./plugin_spec.md) — 統合見取り図
* [admin_ui_spec.md](./admin_ui_spec.md) / [draft_ui_spec.md](./draft_ui_spec.md) / [persistence_spec.md](./persistence_spec.md) / [data_dictionary.md](./data_dictionary.md)
* [governance/documentation_governance.md](./governance/documentation_governance.md) — ドキュメント運用
* [archive/README.md](./archive/README.md) — 完了イニシアチブ (まだなし)
* [test-results.md](./test-results.md) — 段階1–3・外部結合の記録
* [cross_plugin_remaining_matrix.md](./cross_plugin_remaining_matrix.md) — Webinar / Source QR / Survey の未完了 `[ ]` 分類 (Local / Webinar 待ち / HTTPS+Zoom)

## 機能一覧

**完了条件列:** 100% 到達用チェックリスト。`[x]` = 満たし済み、`[ ]` = 未。正本 spec は各§の見出しリンク。

**実装％** は、各§の **プラグイン検証可能** 項 (`[x]` / その全数) のみ。Zoom ステージング等は [§外部結合ゲート](#status-external) に分離する。

| 機能名 | 実装済み/未実装 | 実装％ | 完了条件 (100%) |
| --- | --- | --- | --- |
| 仕様 (`docs/`) | 確定 | — | [§仕様分割](#status-spec-docs) |
| Composer + Survey Service | 実装済み | 100 | [§Composer](#status-composer) (3/3) |
| サイト設定 (設問上限) | 実装済み | 100 | [§設定](#status-settings) (3/3) |
| イベントパネル (設問 CRUD) | 実装済み | 100 | [§管理 UI](#status-admin-ui) (8/8) |
| 評価 + メタ文書 (`evaluate`) | 実装済み | 100 | [§永続化](#status-persistence) (6/6) |
| 下書き + コネクタ (`draft`) | 実装済み | 100 | [§下書き UI](#status-draft) (4/4) |
| S2J Webinar `ready` 読取 | 相手側 | — | Webinar [§Survey 引き渡し](https://github.com/stein2nd/s2j-webinar/blob/main/docs/status.md#status-survey) |
| 配布・テスト、CI | 実装済み | 100 | [§品質・スモーク](#status-quality) (6/6) |

## 100% 完了条件チェックリスト

各§は **プラグイン実装 → Test (PHPUnit / smoke)** の順。**段階3b** は wp-env ではなく **`npm run test:unit:php:local`** (MySQL + WP テスト lib) を正本とする。Zoom / 手動は [§外部結合ゲート](#status-external)。

### 仕様分割 {#status-spec-docs}

* [x] 正本が `docs/`、変更案は `docs_mod/` ([governance/documentation_governance.md](./governance/documentation_governance.md))
* [x] CI: `docs-lint` ([`.github/workflows/docs-lint.yml`](../.github/workflows/docs-lint.yml))

### Composer {#status-composer}

* [x] `composer.json` — Packagist 名のみで `s2j/webinar-survey-service`
* [x] `vendor/autoload.php` ブートストラップ
* [x] Test: Service 橋渡し smoke (段階1: `tests/smoke-local.sh` — `ServiceBridge::evaluate` + REST ルート)

### 設定 {#status-settings}

正本: [admin_ui_spec.md](./admin_ui_spec.md) / [data_dictionary.md](./data_dictionary.md)

* [x] option `s2j_webinar_survey_max_questions` (1〜15、デフォルト6)
* [x] 設定 UI (管理画面)
* [x] Test: option 保存 ([`MaxQuestionsIntegrationTest.php`](../tests/Integration/MaxQuestionsIntegrationTest.php))

### 管理 UI {#status-admin-ui}

正本: [admin_ui_spec.md](./admin_ui_spec.md)

#### プラグイン実装

* [x] Document Settings — 状態バッジ + **Open…** + **Modal** (Questions / Advice / Draft)
* [x] 設問 CRUD: 5種、選択肢、レーティング境界、並べ替え
* [x] 大事な指針 — Questions タブ内 (i18n 英文 msgid)
* [x] 不足・助言 — Advice タブ、コード→ i18n (`evaluationMessages`)。未登録コードはフォールバック
* [x] コネクタ — Draft タブは `hasDraftConnector` 欠如時 Connectors 案内。Questions の per-field 下書きは REST 失敗メッセージ (初版維持)
* [x] 表示専用 `evaluate` — モーダル表示時、Advice **Refresh**、下書き採用直後
* [x] Gutenberg — `useEntityProp` + 投稿 **Update** 後メタ再取得でパネル同期・未保存警告
* [x] Gutenberg — `postId` / `postType` 確定後のみ `useEntityProp` (初回描画のガード)
* [x] Gutenberg ビルド — Vite IIFE で JSX を `wp.element` に委譲 (`S2JWebinarSurveyJSXRuntime`)。`@wordpress/components` との React 二重化を回避
* [x] エディター i18n — `wp_set_script_translations` + `languages/*-{md5}.json` (`npm run build:production` → `makejson`)
* [x] モーダル **Update** — `core/editor` `savePost` (画面上部 Update と同等)
* [x] 初版 — 公開フロントアンケート画面 **なし** ([overview](./overview.md) 非目標)

#### Test

* [x] 手動 (Local): GatherPress — 設定上限保存、Open… → Modal、質問 CRUD、**選択肢を下書き** (テキスト生成コネクタ未設定時のエラー)、**JA UI** ([test-results.md](./test-results.md) 2026-10-18 / **2026-10-19**)
* [x] Smoke: REST 到達 (`tests/smoke-local.sh` — evaluate + draft ルート、`ServiceBridge::evaluate`)
* [x] Test: メタ REST 往復 — Local Integration ([`PanelMetaRestIntegrationTest.php`](../tests/Integration/PanelMetaRestIntegrationTest.php)；wp-env 不要)

### 永続化 {#status-persistence}

正本: [persistence_spec.md](./persistence_spec.md)

* [x] `register_post_meta` — `object` + `show_in_rest` + `edit_post` auth
* [x] 明示保存時 `evaluate` + メタ文書 (クライアント `status` 不信頼)
* [x] `save_post` 正規化 (成功時のみ)
* [x] `POST …/v1/evaluate` — 表示専用、コード列出力
* [x] エディター保存後 — クライアントがコア REST でメタ再取得しパネル文書を正規化結果に同期
* [x] 除外経路 — autosave / Quick Edit 等 ([persistence_spec.md](./persistence_spec.md))
* [x] Test: 純 PHPUnit (`tests/Unit/*`)
* [x] Test: ローカル統合 (`tests/Integration/` — evaluate / draft / meta / option / uninstall)

### 下書き UI {#status-draft}

正本: [draft_ui_spec.md](./draft_ui_spec.md)

* [x] `POST …/v1/draft` — build → `AiTextGeneration` / コネクタ → parse (1リクエスト、`candidates`)
* [x] UI — survey (Draft タブ)、prompt / choices (Questions タブ)、採用→パネル文書のみ
* [x] Test: draft ルート登録 (統合)
* [x] Test: コネクタモック — filter `s2j_webinar_survey_draft_ai_text` + [`DraftControllerMockIntegrationTest.php`](../tests/Integration/DraftControllerMockIntegrationTest.php) (メタ非更新)

### 品質・スモーク {#status-quality}

**Local 自動 (wp-env 非採用):** `npm run test:quality:local` (= unit-only → `lint:php` → MySQL 統合) または個別に `test:unit:php:unit-only` / `lint:php` / `phpcs:wpcs` / `test:unit:php:local`。

* [x] 段階3a: `npm run test:unit:php:unit-only` + CI PHPUnit ([`.github/workflows/phpunit.yml`](../.github/workflows/phpunit.yml))
* [x] 段階1: `tests/smoke-local.sh` / `npm run test:smoke:local`
* [x] 段階2: `studio/smoke-test-blueprint.json`
* [x] 段階3b — `npm run test:unit:php:local` green (**2026-10-19** — unit **6** + integration **9**)
* [x] `npm run lint:php` — `prelint:php` で Composer dev 依存、PHPStan + PHPCS (+ `npm run phpcs:wpcs` ルート PHP)
* [x] CI: dist-zip / phpunit / **docs-lint** ([`.github/workflows/docs-lint.yml`](../.github/workflows/docs-lint.yml))
* [x] [test-results.md](./test-results.md) — S2J Webinar と同型の3段階表
* [x] 手動 — Gutenberg 翻訳 (`ja` Jed JSON、Local 目視: 2026-10-18)

### アンインストール {#status-uninstall}

* [x] メタ + option 削除
* [x] Zoom 非接触 — [`UninstallBehaviorIntegrationTest.php`](../tests/Integration/UninstallBehaviorIntegrationTest.php) (`uninstall.php` の DB 操作のみ)

## 外部結合ゲート {#status-external}

**100% 分母外。** Pass は [test-results.md](./test-results.md) に記録 (整備後)。

**Local 可 / 要 HTTPS:** [S2J Webinar test-results](https://github.com/stein2nd/s2j-webinar/blob/main/docs/test-results.md) と同型。

| # | 内容 | Local 可 / 要 HTTPS |
| --- | --- | --- |
| E1 | 前提 — Webinar OAuth (Survey 単体 UI のみ) | **Local 可** (Modal CRUD + evaluate) |
| E2 | コネクタ API — 実 LLM / 外部 draft | **項目依存** (REST 実装済み。実呼び出しは Local 可) |
| E3 | Survey `ready` → Webinar `attach_survey` | **要 HTTPS** (E1・実 sync 後 — Webinar E4) |
| E4 | Zoom 上アンケート添付 | **要 HTTPS** (Webinar 後続) |

## 補足

* 3プラグイン横断の未完了分類: [cross_plugin_remaining_matrix.md](./cross_plugin_remaining_matrix.md) (Webinar / Source QR に同期コピーあり)。
* **実装％** はプラグイン検証可能項のみ。
* Zoom 添付の実装は S2J Webinar 側 sync 後続 ([plugin_spec.md](./plugin_spec.md))。
* UX 参照: [S2J ウェビナー・ソース追跡 QR](https://github.com/stein2nd/s2j-webinar-source-qr/blob/main/docs/overview.md) (別 Fill、Open… + Modal パターン)。

## 実装ロードマップ (到達順)

1. **Composer + Service** — 済
2. **メタ + evaluate** — 済 (クライアント同期含む)
3. **管理 UI** — 済 (Gutenberg i18n、Local 手動・自動 smoke / Integration)
4. **draft + コネクタ** — 済 (REST + UI、AI モック Integration)
5. **配布、CI** — 済 (docs-lint / phpunit / dist-zip)
6. **品質 (段階1–3)** — 済 (wp-env なし、Local MySQL 3b)
7. **外部結合 (E3 – E4)** — 未
