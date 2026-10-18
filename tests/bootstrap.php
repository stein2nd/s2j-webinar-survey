<?php
/**
 * PHPUnit bootstrap for local WordPress test suite (no wp-env).
 *
 * @package S2J_Webinar_Survey
 */

declare(strict_types=1);

define( 'TESTS_PLUGIN_DIR', dirname( __DIR__ ) );
define( 'TESTS_PLUGIN_FILE', TESTS_PLUGIN_DIR . '/s2j-webinar-survey.php' );

$polyfills = TESTS_PLUGIN_DIR . '/vendor/yoast/phpunit-polyfills/phpunitpolyfills-autoload.php';
if ( file_exists( $polyfills ) ) {
	require_once $polyfills;
}

$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $_tests_dir ) {
	$_tests_dir = TESTS_PLUGIN_DIR . '/tests/.wordpress-tests-lib';
}

if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
	echo 'Could not find ' . $_tests_dir . '/includes/functions.php.' . PHP_EOL;
	echo 'Copy .env.tests.example to .env.tests, then run npm run test:unit:php:local' . PHP_EOL;
	echo 'Or: bash bin/install-wp-tests.sh <db> <user> <pass> [host]' . PHP_EOL;
	exit( 1 );
}

require_once $_tests_dir . '/includes/functions.php';
require_once __DIR__ . '/stubs/wordpress-test-functions.php';

/**
 * Optional GatherPress (see .env.tests WP_TESTS_GATHERPRESS_*).
 */
function _s2j_webinar_survey_tests_maybe_load_gatherpress(): void {
	$gp_dir = getenv( 'WP_TESTS_GATHERPRESS_DIR' );
	if ( is_string( $gp_dir ) && $gp_dir !== '' ) {
		$gp_file = rtrim( $gp_dir, '/' ) . '/gatherpress.php';
		if ( is_readable( $gp_file ) ) {
			require $gp_file;
		}
	}

	$alpha_dir = getenv( 'WP_TESTS_GATHERPRESS_ALPHA_DIR' );
	if ( is_string( $alpha_dir ) && $alpha_dir !== '' ) {
		$alpha_file = rtrim( $alpha_dir, '/' ) . '/gatherpress-alpha.php';
		if ( is_readable( $alpha_file ) ) {
			require $alpha_file;
		}
	}
}

/**
 * Load dependencies then the plugin under test.
 */
function _s2j_webinar_survey_tests_load_plugin(): void {
	_s2j_webinar_survey_tests_maybe_load_gatherpress();
	require TESTS_PLUGIN_FILE;
}

tests_add_filter( 'muplugins_loaded', '_s2j_webinar_survey_tests_load_plugin' );

require $_tests_dir . '/includes/bootstrap.php';
