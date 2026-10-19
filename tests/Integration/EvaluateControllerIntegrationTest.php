<?php
/**
 * REST evaluate route (WordPress test suite).
 *
 * @package S2J_Webinar_Survey
 */

declare(strict_types=1);

/**
 * @group integration
 */
final class EvaluateControllerIntegrationTest extends WP_UnitTestCase {

	private WP_REST_Server $server;

	protected function setUp(): void {
		parent::setUp();

		global $wp_rest_server;
		$this->server       = $wp_rest_server = new WP_REST_Server();
		do_action( 'rest_api_init' );
	}

	public function test_evaluate_route_requires_authenticated_editor(): void {
		wp_set_current_user( 0 );

		$request = new WP_REST_Request(
			'POST',
			'/s2j-webinar-survey/v1/evaluate'
		);
		$request->set_body_params(
			array(
				'event_id' => 1,
				'document' => array(),
			)
		);

		$response = $this->server->dispatch( $request );

		$this->assertContains( $response->get_status(), array( 401, 403 ), 'Unauthenticated or unauthorized' );
	}

	public function test_evaluate_route_registered(): void {
		$routes = $this->server->get_routes();
		$this->assertArrayHasKey( '/s2j-webinar-survey/v1/evaluate', $routes );
	}

	public function test_evaluate_returns_codes_for_editor(): void {
		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin_id );

		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'post',
				'post_status' => 'draft',
			)
		);

		$request = new WP_REST_Request( 'POST', '/s2j-webinar-survey/v1/evaluate' );
		$request->set_body_params(
			array(
				'event_id' => $post_id,
				'document' => array(
					'internal_name' => '',
					'questions'     => array(),
				),
			)
		);

		$response = $this->server->dispatch( $request );
		self::assertSame( 200, $response->get_status() );

		$data = $response->get_data();
		self::assertIsArray( $data['deficiencies'] ?? null );
		self::assertIsArray( $data['advice'] ?? null );
		self::assertContains( 'internal_name_empty', $data['deficiencies'] );
	}
}
