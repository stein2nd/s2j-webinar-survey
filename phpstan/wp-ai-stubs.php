<?php

declare(strict_types=1);

/**
 * WordPress AI Client API (optional in core) — PHPStan bootstrap stubs only.
 *
 * @package S2J_Webinar_Survey
 */

class WP_AI_Prompt_Builder_Stub {

	public function using_temperature( float $temperature ): self {
		unset( $temperature );
		return $this;
	}

	public function is_supported_for_text_generation(): bool {
		return true;
	}

	/**
	 * @return mixed Connector text result, WP_Error, or other.
	 */
	public function generate_text_result() {
		return new stdClass();
	}
}

/**
 * @param string $prompt Prompt text.
 */
function wp_ai_client_prompt( string $prompt ): WP_AI_Prompt_Builder_Stub {
	unset( $prompt );
	return new WP_AI_Prompt_Builder_Stub();
}

function wp_supports_ai(): bool {
	return true;
}
