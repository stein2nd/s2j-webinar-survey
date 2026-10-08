# S2J Webinar Survey - プラグイン仕様 (統合見取り図)

確定仕様の統合見取り図として `docs/` に置きます。細部の正本は分割仕様 ([specs.md](./specs.md) の一覧) です。計算の正本は [Survey Service の docs/](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/specs.md) です。記録日は2026-10-06、分割は2026-10-08、`docs/` への移行は2026-10-08です。

## 概要

本プラグインは、GatherPress のイベント編集画面で、ウェビナー後アンケートの設問を書き、回答の負担と企画上の目的について助言を見るためのものです。管理画面のプラグイン名は「ウェビナーアンケート設問ジェネレータ」です。

スラッグは `s2j-webinar-survey` です。ライセンスは GPL-3.0-or-later です。テキストドメインは `s2j-webinar-survey` です。

両立したいのは、下記の2つです。

* 参加者が応えたくなる設問である。順番、総数、文章について助言し、回答を躊躇するものを減らす。
* 運営者が、アンケート (設問と企画上の目的) を次回以降のウェビナー企画に活かす。

設問の下書きは、ボタンを押した場合に、サイトのコネクタに1回頼むことができます。人が採用するまで候補はパネル文書にもメタ文書にも入りません。企画上の目的は、運営者が書きます。Zoom には送りません。

## 位置付け

| 層 | 名称 | 役割 |
| --- | --- | --- |
| イベント UI | [stein2nd/gatherpress](https://github.com/stein2nd/gatherpress) | イベントの編集画面。本プラグインのコードはフォークに置かない |
| 呼び出し側 | **本プラグイン** | 設問の編集、イベントへの保存、不足と助言のメッセージ表示、コネクタ経由の下書き |
| 計算 | [s2j-webinar-survey-service](https://github.com/stein2nd/s2j-webinar-survey-service) | 検査、助言コード、下書きの依頼文と分解。WordPress を知らない |
| 添付 | [S2J Webinar](https://github.com/stein2nd/s2j-webinar) | `ready` の文書を、作成直後にアンケートとして付ける。設問の規則は持たない |

## 目的

初版で、運営者がイベント編集画面から、下記を終えることです。

* その回のアンケートに、Zoom の一覧用の内部名と、順序のある設問を書く。
* 単一選択・複数選択・レーティング・スケールを先に、短い回答・長い回答を後にまとめる助言を見る (`open_before_closed`)。
* 必須の自由記述 (`short` / `long`) がある場合は、躊躇しやすい旨の助言を見る (`required_open`)。
* 回答者を特定する問いが最後ではない場合は、その旨の助言を見る (`identity_not_last`)。
* 各設問に、次回の企画で何を決めるかを書ける。空なら、その旨の助言を見る (`purpose_missing`)。
* 不足がないメタ文書を、そのイベントに保存する。
* 必要なら、設問の下書きをボタンで頼み、直してから採用する。

## 非目標 (初版)

* 保存時や、画面を開いた際や、cron で、モデル (`wp_ai_client_prompt` / コネクタ) を呼ぶこと。表示専用の `evaluate` は対象外 (原則4)。
* 人が採用する前の下書きを、パネル文書またはメタ文書に書くこと。
* 企画上の目的を、モデルに書かせること。
* Zoom への送信、アンケートの添付、回答と回答率の取り込み。
* 回答から次回のテーマを自動で提案すること。
* 過去の設問の流用、設問だけの台帳。
* セッション中の投票、登録フォームの質問、セッション中の Q&A。
* 公開ページにアンケートを出すこと。回答者の画面は Zoom です。
* WordPress.org への掲載。

## サービスとの境界

本プラグインは、パネル文書と設問総数の上限をサービスに渡します。返った `status` は明示の投稿保存時だけメタ文書へ書きます。画面の「状態」表示はメタ文書の保存済み `status` のみです。不足・助言コードは適切なメッセージ文に使います (表示専用 `evaluate` を含む)。

| 本プラグイン | サービス |
| --- | --- |
| パネル文書を渡す。上限の本数も渡す | 検査し、`draft` または `ready` とコードを返す |
| コードから適切なメッセージ文を表示する (i18n 経由) | 表示文を返さない |
| 正規化済みのメタ文書と `status` をイベントに書く | 保存しない |
| ボタンを押した場合、依頼文をコネクタに1回送る | 依頼文を組み立て、返却文を候補に分ける |
| 人が採用した文だけをパネル文書に足す | 候補を文書に書き込まない |
| Zoom に送らない | Zoom のフィールドを持たない |

初版で渡す上限は、サイト設定の値です。未設定の場合の初期値は6です。イベントごとに別の上限は持ちません。

詳細: [admin_ui_spec.md](./admin_ui_spec.md)、[draft_ui_spec.md](./draft_ui_spec.md)、[persistence_spec.md](./persistence_spec.md)。

## サイト設定・画面・下書き・保存

要約のみです。正本は分割仕様です。

* サイト設定: [admin_ui_spec.md](./admin_ui_spec.md)
* イベントパネルと大事な指針: 同
* 下書きボタンとコネクタ: [draft_ui_spec.md](./draft_ui_spec.md)
* メタ `_s2j_webinar_survey` と Webinar 受け渡し: [persistence_spec.md](./persistence_spec.md)
* キー一覧: [data_dictionary.md](./data_dictionary.md)

## 設計方針

[kis-wordpress エコシステム仕様](https://github.com/stein2nd/kis-wordpress/blob/main/docs_mod/specs.md) および [wp-plugin-spec](https://github.com/stein2nd/wp-plugin-spec) に従います。設問の判断はサービス側の純関数です。本プラグインはアダプタです。詳細は [principles.md](./principles.md) です。

Composer で `s2j/webinar-survey-service` を require します。参照は [S2J Slug Generater](https://github.com/stein2nd/s2j-slug-generater) が `s2j/similarity-service` を Packagist の名前だけで require するのと同じです。`repositories` に `VCS` も `path` も書きません。

プラグイン無効化の場合は、メタとサイト設定を残します。プラグインをアンインストールの場合は、イベントに書いた `_s2j_webinar_survey` とサイト設定を消します。Zoom 上のアンケートは、変更しません。

## 関連リポジトリ

| 名称 | 種別 | 役割 |
| --- | --- | --- |
| **本プラグイン** | WP プラグイン | 編集、保存、不足と助言のメッセージ表示、コネクタ経由の下書き |
| [s2j-webinar-survey-service](https://github.com/stein2nd/s2j-webinar-survey-service) | Composer | 検査、助言コード、下書きの依頼文と分解 |
| [s2j-webinar](https://github.com/stein2nd/s2j-webinar) | WP プラグイン | `ready` の文書を Zoom に付ける |
| [s2j-webinar-service](https://github.com/stein2nd/s2j-webinar-service) | Composer | 添付リクエスト。設問の規則は持たない |
| [stein2nd/gatherpress](https://github.com/stein2nd/gatherpress) | WP プラグイン (フォーク) | イベントの編集画面 |
| [kis-wordpress](https://github.com/stein2nd/kis-wordpress) | モノレポ | サイト専用プラグイン群。本機能は kis-core に抱え込まない |
| [kis2026_base](https://github.com/stein2nd/kis2026_base) | テーマ | 見た目。本機能の画面は持たない |

## 実装順

1. プラグインの骨格と、サイト設定、イベント編集画面のパネル。明示の投稿保存時はメタ文書更新付きで `evaluate`。除外は [persistence_spec.md](./persistence_spec.md) (autosave・リビジョン・Quick Edit・一括編集・WP-CLI / REST)。表示時は表示専用の `evaluate`。
2. 不足と助言を、コードから適切なメッセージ文にしてパネルに出す (国際化関数を経由。msgid は英語基本)。
3. 下書きのボタンを足す。押した場合だけコネクタに1回送り、人が採用した文だけをパネル文書に足す。
4. S2J Webinar が `ready` のメタを添付に使う。本プラグインから Zoom には送らない。

## 採用した方針 (要約)

* プラグイン名は、「ウェビナーアンケート設問ジェネレータ」。サイト設定メニューとパネル見出しは、どちらも「アンケート設問」(同一文言でよい)。
* 設問は、イベント編集画面で書く。1イベントにつき1つ。メタ文書は、`_s2j_webinar_survey`。
* 答え方は、5つ。画像・スキップ・マッチング・ランク・空欄記入は、初版のパネルに出さない。
* 下書きは、ボタンで1回頼む。採用まで候補はパネル文書にもメタ文書にも入らない。企画上の目的は、運営者が書く。
* API キーは、持たない。`wp_ai_client_prompt()` とコネクタを使う。
* 助言があっても保存できる。不足がある場合だけ `draft`。`too_many` は助言のみ (不足ではない)。S2J Webinar は `ready` だけを読む。
* 保存は GatherPress イベント編集からの明示の投稿「更新」に限定する (初版。除外は [persistence_spec.md](./persistence_spec.md): autosave・リビジョン・Quick Edit・一括編集・WP-CLI / REST)。`evaluate` の正はサーバー。成功時は常にメタ文書を上書き (失敗時は書かない。`draft` / `ready` どちらも書く)。画面の「状態」はメタ文書のみ。
* 表示専用 `evaluate`: 入力はいまのパネル文書。発火は開く／再読込 (その時点の上限) と下書き採用直後のみ。サイト設定変更だけでは開いたままの画面は自動更新しない。キー入力のたびには走らせない。メタ文書用は次の明示の投稿保存。保存成功後はパネル文書をメタ文書に同期する。
* `evaluate` / 下書きとも搬送は UI → 本プラグイン PHP → Service。表示専用 REST は `…/v1/evaluate` (初版出力はコード列のみ)、下書き REST は `…/v1/draft` (1リクエスト)。正本は [persistence_spec.md](./persistence_spec.md) / [draft_ui_spec.md](./draft_ui_spec.md)。
* パネル文書は `_s2j_webinar_survey` を `register_post_meta` (`object` / `show_in_rest` / `edit_post` 相当の auth) で載せ、保存は `save_post` でサーバーが正規化上書きする。クライアントの `status` は信頼しない。カスタム REST だけの別経路保存は初版しない。
* メタ未作成時は「保存済み」バッジを出さない (または「未保存」)。
* パネル冒頭に「大事な指針」(製品文案。実装は i18n、msgid は英語)。初版では誘導・二重問いを自動判定しない。
* 設問総数の上限はサイト設定 `s2j_webinar_survey_max_questions` (1〜15、未設定時6)。イベント編集には出さない。
* Zoom には送らない。添付と写像・見出し/説明のデフォルト値は S2J Webinar / webinar-service の後続である。
* アンインストールで当該メタとサイト設定を消し、Zoom のアンケートは変更しない。

## 改訂履歴

| 日付 | 内容 |
| --- | --- |
| 2026-10-06 | 初版ドラフト。イベント編集画面での設問、検査と助言、Zoom への添付は S2J Webinar、と記録 |
| 2026-10-06 | 下書きはボタンでコネクタに1回頼む。人が採用するまで文書に入らない、と記録 |
| 2026-10-07 | 設問総数の上限はサイト設定。誘導・二重問いの指針。答え方5つ。Zoom type 確定、と記録 |
| 2026-10-08 | Alliance / Survey Service に倣い `docs_mod/` を分割。サービス正本リンクを `docs/` に更新、と記録 |
| 2026-10-08 | 保存時/表示専用 `evaluate`、見出し・説明は相手責務、目的文を助言コードに対応、と記録 |
| 2026-10-08 | 状態はメタのみ、i18n 用語固定、採用直後は表示専用 evaluate、と記録 |
| 2026-10-08 | 境界の状態用語を整理。表示専用トリガー3種。初回未保存のバッジ、と記録 |
| 2026-10-08 | 確定仕様として `docs_mod/` から `docs/` へ移行。`docs_mod/` は変更案用に残す、と記録 |
| 2026-10-09 | 表示専用 evaluate はパネル入力、保存は投稿保存、`too_many` は助言のみ、option キー確定、用語統一、と記録 |
| 2026-10-09 | autosave 除外、サーバー正規化でメタ上書き、パネル文書／メタ文書の用語固定、と記録 |
| 2026-10-09 | 保存トリガーをイベント編集の明示更新に限定 (Quick Edit 等除外)。表記の最終そろえ、と記録 |
| 2026-10-09 | 除外リストを persistence 正本へ寄せ。表示専用は3発火+保存のみ、搬送は PHP 経由、と記録 |
| 2026-10-09 | 上限は開き直しで反映、下書きも PHP 経由、evaluate REST 最小契約、保存後パネル同期必須、と記録 |
| 2026-10-09 | 表示専用発火を開き直し＋採用直後の2つに整理 (上限変更は開き直しに含める)。下書き REST 最小契約 (1リクエスト)、と記録 |
| 2026-10-09 | REST に event_id 必須・max_questions はサーバー注入、成功の定義、コネクタ欠如はボタン非表示を正、と記録 |
| 2026-10-09 | REST パスを正本化、evaluate 初版出力はコード列のみ、パネルは show_in_rest + save_post、と記録 |
| 2026-10-09 | メタ登録は object / show_in_rest / edit_post 相当 auth。クライアント status 不信頼。プロパティ schema は実装委ね、と記録 |
