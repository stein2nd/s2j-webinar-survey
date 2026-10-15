<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey\Tests\Unit;

use PHPUnit\Framework\TestCase;
use S2J\WebinarSurvey\MetaRegistrar;

final class MetaRegistrarTest extends TestCase {

	public function test_sanitize_strips_status(): void {
		$input = array(
			'questions' => array(),
			'status'    => 'ready',
		);

		$out = MetaRegistrar::sanitize_panel_document( $input );

		self::assertArrayNotHasKey( 'status', $out );
		self::assertArrayHasKey( 'questions', $out );
	}

	public function test_sanitize_non_array_returns_empty(): void {
		self::assertSame( array(), MetaRegistrar::sanitize_panel_document( 'x' ) );
	}
}
