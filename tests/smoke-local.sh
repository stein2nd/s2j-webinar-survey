#!/usr/bin/env bash
#
# Stage-1 smoke test for Local (or any WP-CLI site). Run from Local Site Shell
# when possible so DB credentials match. Optional: export WP_PATH to WordPress root.
#
set -euo pipefail

PLUGIN_SLUG="s2j-webinar-survey"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
GUTENBERG_JS="${PLUGIN_ROOT}/dist/js/s2j-webinar-survey-gutenberg.js"

WP_ARGS=()
if [[ -n "${WP_PATH:-}" ]]; then
	WP_ARGS+=(--path="${WP_PATH}")
fi

if ! command -v wp >/dev/null 2>&1; then
	echo "FAIL: wp (WP-CLI) not found. Use Local → Site Shell." >&2
	exit 1
fi

if ! wp "${WP_ARGS[@]}" core is-installed >/dev/null 2>&1; then
	echo "FAIL: WordPress not reachable. Set WP_PATH to the site public directory." >&2
	exit 1
fi

if ! wp "${WP_ARGS[@]}" plugin is-installed "${PLUGIN_SLUG}" >/dev/null 2>&1; then
	echo "FAIL: Plugin ${PLUGIN_SLUG} is not installed under wp-content/plugins." >&2
	exit 1
fi

wp "${WP_ARGS[@]}" plugin activate "${PLUGIN_SLUG}" >/dev/null 2>&1 || true

if ! wp "${WP_ARGS[@]}" plugin is-active "${PLUGIN_SLUG}" >/dev/null 2>&1; then
	echo "FAIL: Plugin could not be activated (check vendor/ and PHP version)." >&2
	exit 1
fi

if [[ ! -f "${GUTENBERG_JS}" ]]; then
	echo "WARN: ${GUTENBERG_JS} missing. Run npm run build:production for editor assets." >&2
fi

wp "${WP_ARGS[@]}" eval "
if ( ! defined( 'S2J_WEBINAR_SURVEY_REST_NAMESPACE' ) ) {
	exit( 1 );
}
if ( ! function_exists( 'S2J\\\\WebinarSurveyService\\\\evaluate' ) ) {
	exit( 2 );
}
do_action( 'rest_api_init' );
\$route = '/s2j-webinar-survey/v1/evaluate';
\$routes = rest_get_server()->get_routes();
if ( ! isset( \$routes[ \$route ] ) ) {
	exit( 3 );
}
echo 'ok';
"

echo "PASS: ${PLUGIN_SLUG} active; Service evaluate and REST route present."
