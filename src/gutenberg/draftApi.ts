import apiFetch from '@wordpress/api-fetch';
import type { SurveyDocument } from '@/domain/document';
import { documentForEvaluate } from '@/domain/document';
import { getSurveyEditorConfig } from '@/gutenberg/config';

export type DraftKind = 'survey' | 'prompt' | 'choices';

export type DraftCandidate = Record<string, unknown>;

export async function requestDraft(params: {
	postId: number;
	kind: DraftKind;
	document: SurveyDocument;
	eventTitle: string;
	focusIndex?: number;
}): Promise<DraftCandidate[]> {
	const config = getSurveyEditorConfig();
	const body: Record<string, unknown> = {
		event_id: params.postId,
		kind: params.kind,
		document: documentForEvaluate(params.document),
		event_title: params.eventTitle,
	};
	if (params.focusIndex !== undefined) {
		body.focus_index = params.focusIndex;
	}

	const response = await apiFetch<{ candidates?: DraftCandidate[] }>({
		path: `/${config.restNamespace}/draft`,
		method: 'POST',
		data: body,
	});

	return Array.isArray(response?.candidates) ? response.candidates : [];
}
