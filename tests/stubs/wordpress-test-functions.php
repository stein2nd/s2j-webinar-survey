<?php
/**
 * IDE / static-analysis stubs for WordPress test bootstrap helpers.
 *
 * @package S2J_Webinar_Survey
 */

if ( ! function_exists( 'tests_add_filter' ) ) {
	/**
	 * @param string   $tag             Hook name.
	 * @param callable $function_to_add Callback.
	 * @param int      $priority        Priority.
	 * @param int      $accepted_args   Accepted argument count.
	 */
	function tests_add_filter( $tag, $function_to_add, $priority = 10, $accepted_args = 1 ) {
		unset( $tag, $function_to_add, $priority, $accepted_args );
	}
}
