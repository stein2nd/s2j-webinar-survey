<?php
/**
 * Uninstall removes option + meta only (Zoom 非接触).
 *
 * @package S2J_Webinar_Survey
 */

declare(strict_types=1);

use S2J\WebinarSurvey\Constants;

/**
 * @group integration
 */
final class UninstallBehaviorIntegrationTest extends WP_UnitTestCase {

	public function test_uninstall_php_removes_option_and_survey_meta(): void {
		update_option( Constants::OPTION_MAX_QUESTIONS, 9 );

		$post_id = self::factory()->post->create();
		update_post_meta(
			$post_id,
			Constants::META_KEY,
			array(
				'internal_name' => 'To remove',
				'questions'     => array(),
			)
		);

		if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
			define( 'WP_UNINSTALL_PLUGIN', true );
		}

		require dirname( __DIR__, 2 ) . '/uninstall.php';

		self::assertFalse( get_option( Constants::OPTION_MAX_QUESTIONS, false ) );
		self::assertSame( '', get_post_meta( $post_id, Constants::META_KEY, true ) );
	}
}
