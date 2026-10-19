<?php
/**
 * Site option max_questions (Settings API sanitize path).
 *
 * @package S2J_Webinar_Survey
 */

declare(strict_types=1);

use S2J\WebinarSurvey\Constants;
use S2J\WebinarSurvey\MaxQuestions;

/**
 * @group integration
 */
final class MaxQuestionsIntegrationTest extends WP_UnitTestCase {

	public function test_update_option_uses_sanitize_and_reads_back(): void {
		delete_option( Constants::OPTION_MAX_QUESTIONS );

		$sanitized = MaxQuestions::sanitize_setting( 10 );
		update_option( Constants::OPTION_MAX_QUESTIONS, $sanitized );

		self::assertSame( 10, MaxQuestions::for_service() );
	}

	public function test_out_of_range_sanitize_keeps_stored_value(): void {
		update_option( Constants::OPTION_MAX_QUESTIONS, 8 );

		$sanitized = MaxQuestions::sanitize_setting( 99 );
		update_option( Constants::OPTION_MAX_QUESTIONS, $sanitized );

		self::assertSame( 8, MaxQuestions::for_service() );
	}
}
