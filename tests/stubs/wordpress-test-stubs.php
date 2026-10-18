<?php
/**
 * IDE / static-analysis stubs for the WordPress PHPUnit test suite.
 *
 * Not loaded by tests/bootstrap.php. Real classes come from the WP test library at runtime.
 *
 * @package S2J_Webinar_Survey
 */

require_once __DIR__ . '/phpunit-framework-stub.php';

if ( class_exists( 'WP_UnitTestCase', false ) ) {
	return;
}

/**
 * WordPress core PHPUnit base test case (stub).
 *
 * Assert helpers are declared here so Intelephense resolves `$this->assert*()` on
 * integration tests without indexing vendor/phpunit.
 */
abstract class WP_UnitTestCase extends \PHPUnit\Framework\TestCase {

	/**
	 * @var WP_UnitTest_Factory
	 */
	protected $factory;

	protected function setUp(): void {
		parent::setUp();
	}

	protected function tearDown(): void {
		parent::tearDown();
	}

	/**
	 * @param array<mixed>|\ArrayAccess<int|string, mixed> $array
	 */
	protected function assertArrayHasKey(
		int|string $key,
		$array,
		string $message = ''
	): void {
		unset( $key, $array, $message );
	}

	protected function assertContains(
		mixed $needle,
		iterable $haystack,
		string $message = ''
	): void {
		unset( $needle, $haystack, $message );
	}
}

/**
 * WordPress test factory (stub).
 */
class WP_UnitTest_Factory {
}

/**
 * REST API server (stub).
 */
class WP_REST_Server {

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function dispatch( WP_REST_Request $request ) {
		unset( $request );
		return new WP_REST_Response();
	}

	/**
	 * @return array<string, mixed>
	 */
	public function get_routes() {
		return array();
	}
}

/**
 * REST API request (stub).
 */
class WP_REST_Request {

	/**
	 * @param string $method HTTP method.
	 * @param string $route  Route path.
	 */
	public function __construct( string $method = 'GET', string $route = '' ) {
		unset( $method, $route );
	}

	/**
	 * @param array<string, mixed> $params Body parameters.
	 */
	public function set_body_params( array $params ): void {
		unset( $params );
	}
}

/**
 * REST API response (stub).
 */
class WP_REST_Response {

	public function get_status(): int {
		return 200;
	}

	/**
	 * @return array<string, mixed>
	 */
	public function get_data(): array {
		return array();
	}
}
