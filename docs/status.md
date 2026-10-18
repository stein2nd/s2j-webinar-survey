# S2J Webinar Survey - 実装状況

最終更新: 2026-10-18

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
| Composer + Survey Service | 一部 | 67 | [§Composer](#status-composer) (2/3) |
| サイト設定 (設問上限) | 一部 | 67 | [§設定](#status-settings) (2/3) |
| イベントパネル (設問 CRUD) | 一部 | 100 | [§管理 UI](#status-admin-ui) (8/8) |
| 評価 + メタ文書 (`evaluate`) | 一部 | 83 | [§永続化](#status-persistence) (5/6) |
| 下書き + コネクタ (`draft`) | 一部 | 75 | [§下書き UI](#status-draft) (3/4) |
| S2J Webinar `ready` 読取 | 相手側 | — | Webinar [§Survey 引き渡し](https://github.com/stein2nd/s2j-webinar/blob/main/docs/status.md#status-survey) |
| 配布・テスト、CI | 一部 | 75 | [§品質・スモーク](#status-quality) (6/8) |

## 100% 完了条件チェックリスト

各§は **プラグイン実装 → Test (PHPUnit / smoke) → Test (wp-env)** の順。Zoom / 手動は [§外部結合ゲート](#status-external)。

### 仕様分割 {#status-spec-docs}

* [x] 正本が `docs/`、変更案は `docs_mod/` ([governance/documentation_governance.md](./governance/documentation_governance.md))
* [ ] CI: `docs-lint` (Workflow 追加時)

### Composer {#status-composer}

* [x] `composer.json` — Packagist 名のみで `s2j/webinar-survey-service`
* [x] `vendor/autoload.php` ブートストラップ
* [ ] Test: Service 橋渡し smoke (段階1 WP-CLI)

### 設定 {#status-settings}

正本: [admin_ui_spec.md](./admin_ui_spec.md) / [data_dictionary.md](./data_dictionary.md)

* [x] option `s2j_webinar_survey_max_questions` (1〜15、デフォルト6)
* [x] 設定 UI (管理画面)
* [ ] Test: option 保存

### 管理 UI {#status-admin-ui}

正本: [admin_ui_spec.md](./admin_ui_spec.md)

#### プラグイン実装

* [x] Document Settings — 状態バッジ + **Open…** + **Modal** (Questions / Advice / Draft)
* [x] 設問 CRUD — 5種、選択肢、レーティング境界、並べ替え
* [x] 大事な指針 — Questions タブ内 (i18n 英文 msgid)
* [x] 不足・助言 — Advice タブ、コード→i18n (`evaluationMessages`)。未登録コードはフォールバック
* [x] コネクタ欠如時 — 下書きボタン非表示 + **Settings → Connectors** 案内 (`options-connectors.php`)
* [x] 表示専用 `evaluate` — モーダル表示時、Advice **Refresh**、下書き採用直後
* [x] Gutenberg — `useEntityProp` + 投稿 **Update** 後メタ再取得でパネル同期・未保存警告
* [x] Gutenberg — `postId` / `postType` 確定後のみ `useEntityProp` (初回描画のガード)
* [x] Gutenberg ビルド — Vite IIFE で JSX を `wp.element` に委譲 (`S2JWebinarSurveyJSXRuntime`)。`@wordpress/components` との React 二重化を回避
* [x] エディター i18n — `wp_set_script_translations` + `languages/*-{md5}.json` (`npm run build:production` → `makejson`)
* [x] モーダル **Update** — `core/editor` `savePost` (画面上部 Update と同等)
* [x] 初版 — 公開フロントアンケート画面 **なし** ([overview](./overview.md) 非目標)

#### Test

* [x] 手動 (Local): GatherPress イベント編集 — Document Settings パネル・Modal・**JA 翻訳表示** ([test-results.md](./test-results.md) 2026-10-18)
* [ ] Smoke: REST / Fill 到達 (`tests/smoke-local.sh` / WP-CLI)
* [ ] wp-env — メタ REST 往復

### 永続化 {#status-persistence}

正本: [persistence_spec.md](./persistence_spec.md)

* [x] `register_post_meta` — `object` + `show_in_rest` + `edit_post` auth
* [x] 明示保存時 `evaluate` + メタ文書 (クライアント `status` 不信頼)
* [x] `save_post` 正規化 (成功時のみ)
* [x] `POST …/v1/evaluate` — 表示専用、コード列出力
* [x] エディター保存後 — クライアントがコア REST でメタ再取得しパネル文書を正規化結果に同期
* [x] 除外経路 — autosave / Quick Edit 等 ([persistence_spec.md](./persistence_spec.md))
* [x] Test: 純 PHPUnit (`tests/Unit/*`)
* [x] Test: ローカル統合 (`tests/Integration/` — evaluate + draft ルート)
* [ ] Test: wp-env 統合 (任意)

### 下書き UI {#status-draft}

正本: [draft_ui_spec.md](./draft_ui_spec.md)

* [x] `POST …/v1/draft` — build → `AiTextGeneration` / コネクタ → parse (1リクエスト、`candidates`)
* [x] UI — survey (Draft タブ)、prompt / choices (Questions タブ)、採用→パネル文書のみ
* [x] Test: draft ルート登録 (統合)
* [ ] Test: コネクタモック / E2E 採用フロー

### 品質・スモーク {#status-quality}

* [x] 段階3a: `npm run test:unit:php:unit-only` + CI PHPUnit
* [x] 段階1: `tests/smoke-local.sh`
* [x] 段階2: `studio/smoke-test-blueprint.json`
* [x] ローカル統合: `npm run test:unit:php:local` (MySQL + svn、`bin/install-wp-tests.sh`)
* [x] `npm run lint:php` — `prelint:php` で Composer dev 依存、PHPStan + PHPCS
* [ ] `.wp-env.json` + wp-env PHPUnit (任意・未採用)
* [x] CI: dist-zip / phpunit (js-lint / docs-lint は Workflow 追加時)
* [x] [test-results.md](./test-results.md) — S2J Webinar と同型の3段階表
* [ ] 段階3b — wp-env green
* [x] 手動 — Gutenberg 翻訳 (`ja` Jed JSON、Local 目視 2026-10-18)

### アンインストール {#status-uninstall}

* [x] メタ + option 削除
* [ ] Zoom 非接触

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

* 3 プラグイン横断の未完了分類: [cross_plugin_remaining_matrix.md](./cross_plugin_remaining_matrix.md) (Webinar / Source QR に同期コピーあり)。
* **実装％** はプラグイン検証可能項のみ。
* Zoom 添付の実装は S2J Webinar 側 sync 後続 ([plugin_spec.md](./plugin_spec.md))。
* UX 参照: [S2J ウェビナー・ソース追跡 QR](https://github.com/stein2nd/s2j-webinar-source-qr/blob/main/docs/overview.md) (別 Fill、Open… + Modal パターン)。

## 実装ロードマップ (到達順)

1. **Composer + Service** — 済
2. **メタ + evaluate** — 済 (クライアント同期含む)
3. **管理 UI** — 初版 UI 済 (Gutenberg i18n 配線・Local 目視済。REST 自動スモーク・wp-env は残)
4. **draft + コネクタ** — REST + UI 済 (実 LLM・モックテストは残)
5. **配布、CI** — 一部済
6. **品質 (段階1–3)** — ローカル PHPUnit 済、wp-env 任意は未
7. **外部結合 (E3 – E4)** — 未
