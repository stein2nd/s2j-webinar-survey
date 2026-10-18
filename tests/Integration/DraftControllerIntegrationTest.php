<?php
/**
 * REST draft route (WordPress test suite).
 *
 * @package S2J_Webinar_Survey
 */

declare(strict_types=1);

/**
 * @group integration
 */
final class DraftControllerIntegrationTest extends WP_UnitTestCase {

	private WP_REST_Server $server;

	protected function setUp(): void {
		parent::setUp();

		global $wp_rest_server;
		$this->server       = $wp_rest_server = new WP_REST_Server();
		do_action( 'rest_api_init' );
	}

	public function test_draft_route_registered(): void {
		$routes = $this->server->get_routes();
		$this->assertArrayHasKey( '/s2j-webinar-survey/v1/draft', $routes );
	}
}
