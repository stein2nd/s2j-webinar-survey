/** Message from apiFetch / thrown values (catch must use `unknown`). */
export function apiErrorMessage(err: unknown, fallback: string): string {
	if (err instanceof Error && err.message !== '') {
		return err.message;
	}
	if (
		typeof err === 'object' &&
		err !== null &&
		'message' in err &&
		typeof (err as { message: unknown }).message === 'string'
	) {
		return (err as { message: string }).message;
	}
	return fallback;
}
