/**
 * GatherPress event editor — Document Settings shell (Open… + modal tabs).
 */
import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel as PanelFromEditPost } from '@wordpress/edit-post';
import * as editorPackage from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { Notice } from '@wordpress/components';
import { DocumentPanelFields } from '@/gutenberg/DocumentPanelFields';
import '../styles/gutenberg.scss';

type DocumentSettingPanel = typeof PanelFromEditPost;

const s2jWebinarSurveyDocumentSettings = {
	panelComponent:
		(editorPackage as { PluginDocumentSettingPanel?: DocumentSettingPanel })
			.PluginDocumentSettingPanel || PanelFromEditPost,
};

const SurveyPanel = () => {
	const DocumentPanel = s2jWebinarSurveyDocumentSettings.panelComponent;
	if (!DocumentPanel) {
		return (
			<Notice status="error" isDismissible={false}>
				{__(
					'PluginDocumentSettingPanel is unavailable in this WordPress version.',
					's2j-webinar-survey',
				)}
			</Notice>
		);
	}

	return (
		<DocumentPanel
			name="s2j-webinar-survey"
			title={__('S2J Webinar Survey', 's2j-webinar-survey')}
			className="s2j-webinar-survey-panel"
		>
			<DocumentPanelFields />
		</DocumentPanel>
	);
};

registerPlugin('s2j-webinar-survey', {
	render: SurveyPanel,
});
