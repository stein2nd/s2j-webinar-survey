<?php
/**
 * S2J Webinar Survey
 *
 * @package S2J_Webinar_Survey
 * @author Koutarou ISHIKAWA
 * @license GPL-3.0-or-later
 *
 * Plugin Name: ウェビナーアンケート設問ジェネレータ
 * Plugin URI: https://github.com/stein2nd/s2j-webinar-survey
 * Description: GatherPress イベント編集でウェビナー後アンケートの設問を書き、助言を見るためのプラグインです。
 * Version: 0.0.1
 * Author: Koutarou ISHIKAWA
 * Author URI: https://stein2nd.wordpress.com
 * License: GPL v3 or later
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: s2j-webinar-survey
 * Domain Path: /languages
 * Requires at least: 6.3
 * Requires PHP: 8.1
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'S2J_WEBINAR_SURVEY_VERSION', '0.0.1' );
define( 'S2J_WEBINAR_SURVEY_PLUGIN_FILE', __FILE__ );
define( 'S2J_WEBINAR_SURVEY_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'S2J_WEBINAR_SURVEY_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'S2J_WEBINAR_SURVEY_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

$autoload = S2J_WEBINAR_SURVEY_PLUGIN_DIR . 'vendor/autoload.php';
if ( ! file_exists( $autoload ) ) {
	add_action(
		'admin_notices',
		static function (): void {
			echo '<div class="notice notice-error"><p>';
			echo esc_html__( 'S2J Webinar Survey: run composer install in the plugin directory.', 's2j-webinar-survey' );
			echo '</p></div>';
		}
	);
	return;
}

require_once $autoload;

define( 'S2J_WEBINAR_SURVEY_REST_NAMESPACE', S2J\WebinarSurvey\Constants::REST_NAMESPACE );

require_once S2J_WEBINAR_SURVEY_PLUGIN_DIR . 'includes/Plugin.php';

S2J\WebinarSurvey\Plugin::init();
