# S2J Webinar Survey - 概要

本ドキュメントは、本プラグインの **基本情報および前提理解** を目的とします。

## はじめに

本プラグインは、GatherPress のイベント編集画面でウェビナー後アンケートの設問を書き、回答の負担と企画上の目的について助言を見るための WordPress プラグインです。プラグイン一覧の表示名は **S2J Webinar Survey** です。

両立したいのは、下記の2つです。

* 参加者が応えたくなる設問である (順番、総数、躊躇しやすい必須の自由記述など)。
* 運営者が、アンケート (設問と企画上の目的) を次回以降のウェビナー企画に活かす。

計算 (検査・助言コード・下書きの依頼文と分解) は [S2J Webinar Survey Service](https://github.com/stein2nd/s2j-webinar-survey-service) です。Zoom への添付は [S2J Webinar](https://github.com/stein2nd/s2j-webinar) です。

**導入:** 運用上は **S2J Webinar を先に有効化** し、GatherPress 上で本プラグインを使います (手順は [README.md §Installation](../README.md#installation))。Webinar が無効のとき、イベント編集の Document Settings には案内 Notice のみ表示し、設問 Modal は出しません ([admin_ui_spec.md §S2J Webinar 前提](./admin_ui_spec.md#s2j-webinar-前提-初版))。

## 基本情報

| 項目 | 値 |
| --- | --- |
| 名称 | S2J Webinar Survey |
| プラグイン一覧名 | S2J Webinar Survey |
| スラッグ | `s2j-webinar-survey` |
| テキストドメイン | `s2j-webinar-survey` |
| ライセンス | GPL-3.0-or-later |
| PHP | **v8.3以上** (WordPress 必須要件に合わせる) |
| Composer 依存 | `s2j/webinar-survey-service` (Packagist の名前のみ) |

## 提供機能

* Document Settings の **S2J Webinar Survey** — (S2J Webinar 有効時) 状態バッジ + **Open…** → Modal (Questions / Advice / Draft)。Webinar 未整備時は Notice のみ
* モーダル **Update** または画面上部の投稿 **Update** でイベントとアンケートメタを保存 (`save_post` でサーバー `evaluate`)
* イベント編集からの明示の投稿「更新」で `evaluate` し、成功時は常にメタ文書を上書き (失敗時は書かない)。成功後はパネル文書をメタ文書に同期。除外と許可は [persistence_spec.md](./persistence_spec.md)。再表示は表示専用 (開く／再読込・採用直後。上限は開き直しで反映。搬送は PHP 経由)。正本は [admin_ui_spec.md](./admin_ui_spec.md) / [persistence_spec.md](./persistence_spec.md)
* サイト設定による設問総数の上限 (1〜15、未設定時は6)
* ボタン押下時のみ、コネクタ経由の下書き提案と人手による採用
* `ready` のメタ文書をイベントに置き、S2J Webinar が読めるようにする

## 責務

* GatherPress イベント編集へのパネル追加 (フォーク非改変)
* サイト設定・イベントメタ・表示文・コネクタ呼び出し
* サービス公開 API (`evaluate` / `build_draft_prompt` / `parse_draft_response`) の呼び出し

## 非対応スコープ (Out of Scope)

* 検査・助言規則の本体 (サービス)
* モデル HTTP、API キー、プロバイダ選択 (WordPress コネクタ)
* Zoom への作成・更新・削除、設問型写像 (S2J Webinar / webinar-service)
* 回答・回答率の取り込み、過去設問の台帳
* 公開ページへのアンケート表示 (回答者画面は Zoom)
* 誘導・二重問いの自動判定 (初版。周知はパネル冒頭の指針)
* WordPress.org への掲載

## 関連ドキュメント

* 背景: [concept.md](./concept.md)
* 統合見取り図: [plugin_spec.md](./plugin_spec.md)
* 索引: [specs.md](./specs.md)
* 検証: [test-results.md](./test-results.md) (段階1–3。wp-env 非採用、MySQL 統合 3b)
