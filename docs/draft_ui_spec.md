# S2J Webinar Survey - 下書き候補 UI 仕様

## 設計意図 (ゴール)

ボタン1回につきコネクタに1回だけ送り、人が採用するまで **下書き候補** をパネル文書にもメタ文書にも書かないようにします。採用後はパネル文書に足し、メタ文書は次の明示の投稿保存まで触りません。文書の `status: draft` とは別です。kind は常に `survey` / `prompt` / `choices` (英単語) です。

## 前提

* 依頼文の組立と返却文の分解は、Survey Service である。正本は [draft_spec.md](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/core/draft_spec.md) と [php_api_spec.md](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/interfaces/php_api_spec.md) です。
* 本プラグインは、API キーとプロバイダ選択を持たない。`wp_ai_client_prompt()` とサイトのコネクタを使う。
* 搬送は **UI → 本プラグイン PHP (REST 等) → Service** である。`build_draft_prompt` / `parse_draft_response` をクライアントから直接呼ばない。`wp_ai_client_prompt` は PHP (または PHP が用意した WP API) 側で実行する。

## コネクタ欠如時

**UI 判定 (`hasDraftConnector`):** `function_exists( 'wp_ai_client_prompt' )` のみ。テキスト生成プロバイダがサイトに設定済みかは見ない ([admin_ui_spec.md](./admin_ui_spec.md) の localize)。

| 置き場 | `hasDraftConnector` が false | true だがテキスト生成コネクタ未設定 |
| --- | --- | --- |
| **Draft** タブ (`survey`) | survey 下書き UI を出さず **設定 > コネクタ** 案内 | ボタンは出る。REST が 503 等 + ユーザー向けメッセージ (例: `No connector supports text generation.` → JA「テキスト生成に対応しているコネクタはありません。」) |
| **Questions** タブ (`prompt` / `choices`) | 設問別下書きボタン非表示 | ボタンは出る。失敗は REST 応答を設問行下に表示 |

* 検査 (`evaluate`) とイベント保存は、いずれもそのまま動く。
* 防衛: 下書き REST は `AiTextGeneration::is_available()` でコネクタ実体を確認し、不可なら適切な `WP_Error` を返す (メタは書かない)。
* 初版の製品判断 (**2026-10-19** 手動確認): Draft タブだけ `hasDraftConnector` で隠し、Questions の per-field 下書きは API 存在時に表示して REST で案内する。

## ボタン

| 製品意図 (ja) | UI msgid 目安 | 種類 | 置き場 | 備考 |
| --- | --- | --- | --- | --- |
| 設問の下書きを提案 | Suggest question drafts | `survey` | Modal **Draft** タブ | 上限到達時は非表示 + 説明 |
| この設問文の下書き | Draft this prompt | `prompt` | **Questions** — 展開中1件 | `focus_index` 必須 |
| この選択肢の下書き | Draft choices | `choices` | 同上 (`single` / `multiple` のみ) | 採用 **Use this draft**。他答え方ではボタン非表示 (サーバー検証は残す) |

### 呼び出し手順 (サーバー内)

UI は下書き REST を1回呼ぶ。PHP 側で下記を順に実行する (クライアントから Service / コネクタを直接呼ばない)。

クライアントが送ってよいもの: `event_id`、`kind`、イベント題名、パネル文書 (またはその断片)、答え方、運営者が書いた `purpose`、既存の設問文、`focus_index`。

渡してはいけないもの: 登壇者メール、申込者情報。`max_questions` はクライアントから送らない (送ってきても無視する)。

`event_id` は REST 権限チェック用である。Service の `$context` には載せない。PHP は権限確認後に落とし、Service には題名・パネル文書断片・`kind`・`focus_index`・答え方・`purpose` などと、サイト option から注入した `max_questions` (`int`。読み出し規則は [persistence_spec.md](./persistence_spec.md) と同じ) だけを渡す。

1. `build_draft_prompt( $kind, $context )` → `{ prompt_text, requested_count }`
2. `prompt_text` が空、または `requested_count` が0ならコネクタに送らず、下書き候補なしで返す (`survey` の上限到達など)
3. コネクタ呼び出し前に filter **`s2j_webinar_survey_draft_ai_text`** — `apply_filters( …, null, $prompt_text, $kind, $parse_context )`。コールバックは `( $filtered, string $prompt_text, string $kind, array $parse_context )` → `null` | 応答文字列 | `WP_Error`。文字列なら `wp_ai_client_prompt` を省略 (PHPUnit / Local 統合のモック用。本番は未登録のまま)。
4. 上記が null のとき `wp_ai_client_prompt( … )` を1回 (`AiTextGeneration::generate`)
5. `parse_draft_response( $kind, $response, $context )` に、同じ `requested_count` と必要なら `document` / `focus_index` を渡す
6. 下書き候補をレスポンスで UI に返す。パネル文書にもメタ文書にも書かない

### 下書き REST 最小契約

初版は **1リクエストにまとめる** (`build` → コネクタ → `parse`)。形は下記を正本とする。パスを変える場合は別イニシアチブと改訂履歴で行う。

| 項目 | 契約 |
| --- | --- |
| パス | `POST /wp-json/s2j-webinar-survey/v1/draft` |
| 権限 | `current_user_can( 'edit_post', $event_id )` 相当 (対象イベントを編集できること) |
| 入力 | **`event_id` (投稿 ID) 必須**、`kind` (`survey` / `prompt` / `choices`)、上記のクライアント送付分。`max_questions` はサーバーがサイト option から読む (`int` 化。クライアント任意上書きは初版しない) |
| 出力 | JSON キー **`candidates`**: 下書き候補の配列 (kind に応じた形)。送らなかった場合は空配列。**メタは書かない** |
| コネクタ欠如 | **初版の正はボタン非表示** (案内は上記)。呼ばれた場合は防衛的に適切な失敗メッセージ |
| 失敗 | 権限不足、不正入力、Service 例外はログし、ユーザー向けは簡潔な失敗メッセージ。コネクタ失敗は再試行を促す。パネル文書は変えない |
| テスト用 filter | **`s2j_webinar_survey_draft_ai_text`** — 上記手順3。実 LLM なしで `candidates` まで通す ([`DraftControllerMockIntegrationTest.php`](../tests/Integration/DraftControllerMockIntegrationTest.php)) |

## 下書き候補の見せ方と採用

### kind `survey`

* Draft タブに一覧で出す。
* **Add this question** で1件ずつパネル文書末尾にコピーする。
* 使わなかった下書き候補は捨てる (メタ文書にも残さない)。
* コピー後も運営者は文を直せる。

### kind `prompt` / `choices`

* その欄の横に出す。
* 「この下書きを使う」でパネル文書の欄にコピーする。
* `prompt` の `answer_kind` 等の引き継ぎはサービス内。プラグインはマージし直さない。
* `choices` は開いている設問の選択肢にプラグインがマージする。

### 共通

* 採用した下書き候補の `purpose` は空のまま。運営者が書く。
* 採用直後は、採用反映後のパネル文書で表示専用の `evaluate` を一度走らせ、不足・助言メッセージを更新する (メタ文書は書かない)。
* メタ文書用の `evaluate` (正規化 + `status` の書き込み) は、次の明示の投稿保存で行う。下書き候補のままではメタ文書上 `ready` にならない。

## エラー表示 (方針)

* サービスが `InvalidArgumentException` を投げた場合は、プログラマー誤り寄りとしてログし、ユーザーには簡潔な失敗メッセージを出す。
* コネクタ失敗は、再試行を促す適切なメッセージ文を出す (国際化関数を経由)。パネル文書は変えない。

## PHP 実装 (初版)

| 要素 | 場所 |
| --- | --- |
| REST | `includes/Rest/DraftController.php` |
| テスト用 filter | 同上 (`s2j_webinar_survey_draft_ai_text`) |
| コネクタ 1 回 | `includes/AiTextGeneration.php` (`wp_ai_client_prompt`) |
| Service 橋 | `includes/ServiceBridge.php` (`build_draft_prompt` / `parse_draft_response`) |
| クライアント | `src/gutenberg/draftApi.ts`、Questions / Draft タブ |

## 検証

* モック (filter): [test-results.md §3b](./test-results.md#第3段階-phpunit) — `npm run test:unit:php:local`
* 実コネクタ / 採用 UI: 段階1手動 ([test-results.md §最新結果](./test-results.md#最新結果))

## 関連

* サービス使用方法: [usage_spec.md](https://github.com/stein2nd/s2j-webinar-survey-service/blob/main/docs/interfaces/usage_spec.md)
* パネル本体: [admin_ui_spec.md](./admin_ui_spec.md)
