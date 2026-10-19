<?php
/**
 * Panel meta round-trip via core REST (Local MySQL integration; wp-env 不要).
 *
 * @package S2J_Webinar_Survey
 */

declare(strict_types=1);

use S2J\WebinarSurvey\Constants;
use S2J\WebinarSurvey\MetaRegistrar;

/**
 * @group integration
 */
final class PanelMetaRestIntegrationTest extends WP_UnitTestCase {

	private WP_REST_Server $server;

	protected function setUp(): void {
		parent::setUp();

		register_post_meta(
			'post',
			Constants::META_KEY,
			array(
				'type'              => 'object',
				'single'            => true,
				'show_in_rest'      => array(
					'schema' => array(
						'type'                 => 'object',
						'additionalProperties' => true,
					),
				),
				'auth_callback'     => array( MetaRegistrar::class, 'can_edit_post_meta' ),
				'sanitize_callback' => array( MetaRegistrar::class, 'sanitize_panel_document' ),
				'default'           => array(),
			)
		);

		global $wp_rest_server;
		$this->server       = $wp_rest_server = new WP_REST_Server();
		do_action( 'rest_api_init' );
	}

	public function test_panel_meta_round_trips_via_rest(): void {
		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin_id );

		$post_id = self::factory()->post->create(
			array(
				'post_status' => 'draft',
				'post_title'  => 'Meta REST test event',
			)
		);
		if ( is_wp_error( $post_id ) ) {
			self::fail( 'Could not create test event: ' . $post_id->get_error_message() );
		}

		$payload = array(
			'internal_name' => 'Smoke survey',
			'questions'     => array(
				array(
					'prompt'       => 'Q1',
					'answer_kind'  => 'single',
					'choices'      => array( 'A', 'B' ),
					'required'     => false,
				),
			),
		);

		$update = new WP_REST_Request( 'PUT', '/wp/v2/posts/' . $post_id );
		$update->set_body_params(
			array(
				'meta' => array(
					Constants::META_KEY => $payload,
				),
			)
		);

		$update_response = rest_get_server()->dispatch( $update );
		if ( 200 !== $update_response->get_status() ) {
			$data    = $update_response->get_data();
			$message = is_wp_error( $data )
				? $data->get_error_message()
				: wp_json_encode( $data );
			self::fail(
				'Meta update failed with HTTP ' . $update_response->get_status() . ': ' . $message
			);
		}

		$stored = get_post_meta( $post_id, Constants::META_KEY, true );
		self::assertIsArray( $stored );
		self::assertSame( 'Smoke survey', $stored['internal_name'] ?? '' );

		$get = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$get->set_param( 'context', 'edit' );

		$data = rest_get_server()->dispatch( $get )->get_data();
		self::assertSame( 'Smoke survey', $data['meta'][ Constants::META_KEY ]['internal_name'] ?? '' );
	}
}
