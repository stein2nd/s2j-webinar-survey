import apiFetch from '@wordpress/api-fetch';
import type { SurveyDocument } from '@/domain/document';
import { documentForEvaluate } from '@/domain/document';
import { getSurveyEditorConfig } from '@/gutenberg/config';

export type EvaluateResult = {
	deficiencies: string[];
	advice: string[];
};

export async function fetchDisplayEvaluate(
	postId: number,
	document: SurveyDocument,
): Promise<EvaluateResult> {
	const config = getSurveyEditorConfig();
	return apiFetch<EvaluateResult>({
		path: `/${config.restNamespace}/evaluate`,
		method: 'POST',
		data: {
			event_id: postId,
			document: documentForEvaluate(document),
		},
	});
}
