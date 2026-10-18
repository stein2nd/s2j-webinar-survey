<?php
/**
 * Minimal PHPUnit stubs for IDE / Intelephense (not loaded at test runtime).
 *
 * @package S2J_Webinar_Survey
 */

namespace PHPUnit\Framework;

if ( class_exists( TestCase::class, false ) ) {
	return;
}

abstract class TestCase {

	protected function setUp(): void {
	}

	protected function tearDown(): void {
	}

	/**
	 * @param array<mixed>|\ArrayAccess<int|string, mixed> $array
	 */
	protected function assertArrayHasKey(
		int|string $key,
		$array,
		string $message = ''
	): void {
		unset( $key, $array, $message );
	}

	protected function assertContains(
		mixed $needle,
		iterable $haystack,
		string $message = ''
	): void {
		unset( $needle, $haystack, $message );
	}

	public static function assertTrue(
		mixed $condition,
		string $message = ''
	): void {
		unset( $condition, $message );
	}

	public static function assertIsArray(
		mixed $actual,
		string $message = ''
	): void {
		unset( $actual, $message );
	}

	/**
	 * @param array<mixed> $array
	 */
	public static function assertArrayNotHasKey(
		int|string $key,
		array $array,
		string $message = ''
	): void {
		unset( $key, $array, $message );
	}
}
