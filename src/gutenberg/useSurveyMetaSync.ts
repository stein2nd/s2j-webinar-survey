import apiFetch from '@wordpress/api-fetch';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import {
	normalizeDocument,
	panelDocumentFingerprint,
	type SurveyDocument,
} from '@/domain/document';
import { getSurveyEditorConfig } from '@/gutenberg/config';

type SetMeta = (value: unknown) => void;

export function useSurveyMetaSync(
	postId: number,
	postType: string,
	metaRaw: unknown,
	setMetaRaw: SetMeta,
): {
	isDirty: boolean;
	savedDocument: SurveyDocument;
	refreshSavedBaseline: () => void;
} {
	const config = getSurveyEditorConfig();
	const [savedDocument, setSavedDocument] = useState<SurveyDocument>(() =>
		normalizeDocument(metaRaw),
	);
	const savedFingerprint = useRef(panelDocumentFingerprint(metaRaw));
	const prevSaving = useRef(false);

	const isSavingPost = useSelect(
		(select) =>
			(select('core/editor') as { isSavingPost?: () => boolean }).isSavingPost?.() ??
			false,
		[],
	);
	const isAutosavingPost = useSelect(
		(select) =>
			(
				select('core/editor') as { isAutosavingPost?: () => boolean }
			).isAutosavingPost?.() ?? false,
		[],
	);

	const applyServerMeta = (raw: unknown) => {
		const normalized = normalizeDocument(raw);
		setSavedDocument(normalized);
		savedFingerprint.current = panelDocumentFingerprint(normalized);
		setMetaRaw(normalized);
	};

	const refreshSavedBaseline = () => {
		savedFingerprint.current = panelDocumentFingerprint(metaRaw);
		setSavedDocument(normalizeDocument(metaRaw));
	};

	useEffect(() => {
		if (postId <= 0) {
			return;
		}
		refreshSavedBaseline();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- reset baseline when post changes
	}, [postId]);

	useEffect(() => {
		const wasSaving = prevSaving.current;
		prevSaving.current = isSavingPost;

		if (
			wasSaving &&
			!isSavingPost &&
			!isAutosavingPost &&
			postId > 0 &&
			postType !== ''
		) {
			void (async () => {
				try {
					const record = await apiFetch<{ meta?: Record<string, unknown> }>({
						path: `/wp/v2/${postType}/${postId}?context=edit&_fields=meta`,
					});
					const serverMeta = record.meta?.[config.metaKey];
					if (serverMeta !== undefined) {
						applyServerMeta(serverMeta);
					}
				} catch {
					// Keep editor state; server meta may still match after save_post evaluate.
				}
			})();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- refetch once per save completion
	}, [isSavingPost, isAutosavingPost, postId, postType, config.metaKey, setMetaRaw]);

	const panelDocument = normalizeDocument(metaRaw);
	const isDirty =
		panelDocumentFingerprint(panelDocument) !== savedFingerprint.current;

	return { isDirty, savedDocument, refreshSavedBaseline };
}
