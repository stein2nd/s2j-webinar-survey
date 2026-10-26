import { Button, Notice, PanelRow } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';
import { useCallback, useMemo, useState } from '@wordpress/element';
import { normalizeDocument, type SurveyDocument } from '@/domain/document';
import { getSurveyEditorConfig } from '@/gutenberg/config';
import { SurveyEditorModal } from '@/gutenberg/SurveyEditorModal';
import { useSurveyMetaSync } from '@/gutenberg/useSurveyMetaSync';
import { WebinarDependencyNotice } from '@/gutenberg/WebinarDependencyNotice';

const EDITOR_STORE = 'core/editor';

function statusBadgeLabel(status: string | undefined): string {
	if (status === 'ready') {
		return __('Saved: ready', 's2j-webinar-survey');
	}
	if (status === 'draft') {
		return __('Saved: draft', 's2j-webinar-survey');
	}
	return __('Not saved yet', 's2j-webinar-survey');
}

function DocumentPanelFieldsInner({
	postId,
	postType,
}: {
	postId: number;
	postType: string;
}) {
	const config = getSurveyEditorConfig();
	const [open, setOpen] = useState(false);

	const [metaRaw, setMetaRaw] = useEntityProp(
		'postType',
		postType,
		config.metaKey,
	);

	const document = useMemo(() => normalizeDocument(metaRaw), [metaRaw]);

	const setMeta = useCallback(
		(value: unknown) => {
			setMetaRaw(value);
		},
		[setMetaRaw],
	);

	const { isDirty, savedDocument } = useSurveyMetaSync(
		postId,
		postType,
		metaRaw,
		setMeta,
	);

	const setDocument = (next: SurveyDocument) => {
		setMetaRaw(next);
	};

	const savedStatus = savedDocument.status;
	const showReadyWarning = isDirty && savedStatus === 'ready';

	return (
		<>
			<PanelRow>
				<span className="s2j-webinar-survey-panel__status">
					{statusBadgeLabel(savedStatus)}
				</span>
			</PanelRow>
			{isDirty && (
				<Notice status="warning" isDismissible={false}>
					{showReadyWarning
						? __(
								'You have unsaved survey changes. Until you update the event, S2J Webinar keeps the last saved ready survey.',
								's2j-webinar-survey',
							)
						: __(
								'You have unsaved survey changes. Update the event to save.',
								's2j-webinar-survey',
							)}
				</Notice>
			)}
			<PanelRow>
				<Button
					variant="secondary"
					onClick={() => setOpen(true)}
					disabled={postId <= 0}
				>
					{__('Open…', 's2j-webinar-survey')}
				</Button>
			</PanelRow>
			{open && postId > 0 && (
				<SurveyEditorModal
					postId={postId}
					document={document}
					onChangeDocument={setDocument}
					onClose={() => setOpen(false)}
				/>
			)}
		</>
	);
}

export function DocumentPanelFields() {
	const postId = useSelect((select) => {
		const editor = select(EDITOR_STORE) as { getCurrentPostId?: () => number };
		return editor.getCurrentPostId?.() ?? 0;
	}, []);

	const postType = useSelect((select) => {
		const editor = select(EDITOR_STORE) as { getCurrentPostType?: () => string };
		return editor.getCurrentPostType?.() ?? '';
	}, []);

	if (postId <= 0 || postType === '') {
		return (
			<PanelRow>
				<p className="description">
					{__('Loading survey settings…', 's2j-webinar-survey')}
				</p>
			</PanelRow>
		);
	}

	const webinarConfig = getSurveyEditorConfig();
	if (!webinarConfig.s2jWebinarActive) {
		return <WebinarDependencyNotice />;
	}

	return <DocumentPanelFieldsInner postId={postId} postType={postType} />;
}
