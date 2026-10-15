<?php
/**
 * Uninstall: remove site option. Event meta is removed in a follow-up sweep if needed.
 *
 * @package S2J_Webinar_Survey
 */

declare(strict_types=1);

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 's2j_webinar_survey_max_questions' );

global $wpdb;

// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.SlowDBQuery.slow_db_query_meta_key
$wpdb->delete(
	$wpdb->postmeta,
	array( 'meta_key' => '_s2j_webinar_survey' ),
	array( '%s' )
);
// phpcs:enable
