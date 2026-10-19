<?php
/**
 * Draft REST with mocked AI text (no wp-env / no live connector).
 *
 * @package S2J_Webinar_Survey
 */

declare(strict_types=1);

/**
 * @group integration
 */
final class DraftControllerMockIntegrationTest extends WP_UnitTestCase {

	private WP_REST_Server $server;

	protected function setUp(): void {
		parent::setUp();

		global $wp_rest_server;
		$this->server       = $wp_rest_server = new WP_REST_Server();
		do_action( 'rest_api_init' );
	}

	protected function tearDown(): void {
		remove_all_filters( 's2j_webinar_survey_draft_ai_text' );
		parent::tearDown();
	}

	public function test_draft_choices_returns_candidates_when_ai_text_is_filtered(): void {
		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin_id );

		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'post',
				'post_status' => 'draft',
			)
		);

		add_filter(
			's2j_webinar_survey_draft_ai_text',
			static function (): string {
				return "- はい\n- いいえ\n- どちらでも";
			}
		);

		$request = new WP_REST_Request( 'POST', '/s2j-webinar-survey/v1/draft' );
		$request->set_body_params(
			array(
				'event_id' => $post_id,
				'kind'     => 'choices',
				'document' => array(
					'internal_name' => 'Draft mock',
					'questions'     => array(
						array(
							'prompt'      => 'Q?',
							'answer_kind' => 'single',
							'choices'     => array( 'YES', 'NO' ),
						),
					),
				),
				'focus_index' => 0,
			)
		);

		$response = $this->server->dispatch( $request );
		self::assertSame( 200, $response->get_status(), (string) wp_json_encode( $response->get_data() ) );

		$data = $response->get_data();
		self::assertIsArray( $data['candidates'] ?? null );
		self::assertNotEmpty( $data['candidates'] );
		self::assertSame(
			array( 'はい', 'いいえ', 'どちらでも' ),
			$data['candidates'][0]['choices'] ?? null
		);

		self::assertSame( '', get_post_meta( $post_id, '_s2j_webinar_survey', true ) );
	}
}
