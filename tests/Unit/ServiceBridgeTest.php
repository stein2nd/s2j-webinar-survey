<?php

declare(strict_types=1);

namespace S2J\WebinarSurvey\Tests\Unit;

use PHPUnit\Framework\TestCase;
use S2J\WebinarSurvey\ServiceBridge;

final class ServiceBridgeTest extends TestCase {

	public function test_service_is_available(): void {
		self::assertTrue( ServiceBridge::is_available() );
	}

	public function test_evaluate_codes_only_returns_lists(): void {
		$result = ServiceBridge::evaluate_codes_only( array(), 6 );

		self::assertIsArray( $result['deficiencies'] );
		self::assertIsArray( $result['advice'] );
		self::assertArrayNotHasKey( 'document', $result );
	}
}
