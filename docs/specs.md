# S2J Webinar Survey - 仕様書の起点

本プロジェクトの仕様は、下記のドキュメントに分散して定義します。
各ドキュメントへの導線のみを提供し、詳細は個別ファイルに委譲します。

統合見取り図は [plugin_spec.md](./plugin_spec.md) です。構成は [S2J Alliance Manager の docs/](https://github.com/stein2nd/s2j-alliance-manager/blob/main/docs/specs.md) と [S2J Webinar Survey Service の docs/](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/specs.md) に倣い、本プラグインに必要な層だけを置いています。変更案は `docs_mod/` に置きます。

## 共通仕様

* [SPECS.md (共通仕様)](https://github.com/stein2nd/wp-plugin-spec/blob/main/docs/SPECS.md)

## 計算の正本 (Composer ライブラリ)

設問文書の検査・助言・下書き分解の規則は、本プラグインには置きません。

* 索引: [s2j-webinar-survey-service / docs/specs.md](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/specs.md)
* 統合見取り図: [service_spec.md](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/service_spec.md)
* 公開 API: [php_api_spec.md](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/interfaces/php_api_spec.md)
* 使用方法: [usage_spec.md](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/interfaces/usage_spec.md)

## 読み方ガイド

### 推奨読み順 (初読)

1. **[concept.md](./concept.md)** — なぜ存在するか
2. **[overview.md](./overview.md)** — 責務と非対応
3. **[principles.md](./principles.md)** — SoT、境界、evaluate / 状態
4. **[architecture.md](./architecture.md)** — レイヤとフォルダー
5. **[data_dictionary.md](./data_dictionary.md)** — メタ、option
6. **[admin_ui_spec.md](./admin_ui_spec.md)** — サイト設定とイベントパネル
7. **[draft_ui_spec.md](./draft_ui_spec.md)** — 下書きボタンとコネクタ
8. **[persistence_spec.md](./persistence_spec.md)** — 保存と Webinar への受け渡し

### 役割別

#### 実装者 (本プラグイン)

1. [architecture.md](./architecture.md)
2. [data_dictionary.md](./data_dictionary.md)
3. [admin_ui_spec.md](./admin_ui_spec.md)
4. [draft_ui_spec.md](./draft_ui_spec.md)
5. [persistence_spec.md](./persistence_spec.md)
6. [status.md](./status.md)
7. [governance/documentation_governance.md](./governance/documentation_governance.md)

#### サービス側の実装者

1. [サービス docs/specs.md](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/specs.md)
2. 本プラグインの境界だけ [plugin_spec.md](./plugin_spec.md) の「サービスとの境界」

## ドキュメント一覧

### Why

| ドキュメント | 内容 |
| --- | --- |
| [概要](./overview.md) | 基本情報、責務、非対応 |
| [コンセプト](./concept.md) | 背景、ユースケース、処理フロー |
| [アーキテクチャー](./architecture.md) | レイヤ、フォルダー、依存 |
| [設計原則](./principles.md) | FOP (Functional Object-Oriented Programming)、境界、SoT |
| [統合見取り図](./plugin_spec.md) | 要約。細部は分割仕様 |

### What (データと画面)

| ドキュメント | 内容 |
| --- | --- |
| [データ辞書](./data_dictionary.md) | メタキー、option、文書形への参照 |
| [管理 UI](./admin_ui_spec.md) | サイト設定、イベントパネル、助言のメッセージ表示 |
| [下書き UI](./draft_ui_spec.md) | ボタン、コネクタ、採用フロー |
| [永続化と受け渡し](./persistence_spec.md) | 保存、アンインストール、S2J Webinar |

### 運用

| ドキュメント | 内容 |
| --- | --- |
| [実装状況](./status.md) | 機能単位の進捗 |
| [ドキュメンテーション・ガバナンス](./governance/documentation_governance.md) | SoT、用語、lint、`docs_mod` → `docs`、archive |
| [archive 索引](./archive/README.md) | 完了イニシアチブの凍結一覧 |

## Source of Truth

| 対象 | 正本 |
| --- | --- |
| 検査・助言・下書き分解の規則 | Survey Service の `docs/core/` |
| 公開 PHP API (Composer) | Survey Service の `docs/interfaces/php_api_spec.md` |
| メタキー、option、パネル文言 | 本 `docs/` |
| ユーザー向け最短手順 | ルート `README.md` |

食い違う場合は、計算規則はサービス側を直し、本キットの境界記述を追随させます。

## 補足

* 本プラグインはアダプタです。GatherPress フォーク本体は改変しない。
* Zoom への添付と設問型写像は [S2J Webinar](https://github.com/stein2nd/s2j-webinar) / [s2j-webinar-service](https://github.com/stein2nd/s2j-webinar-service) の仕事である。
