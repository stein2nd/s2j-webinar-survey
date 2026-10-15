/**
 * GatherPress イベント編集 Fill — 設問 CRUD は follow-up で拡張。
 */
import { registerPlugin } from '@wordpress/plugins';
import { __ } from '@wordpress/i18n';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import '../styles/gutenberg.scss';

const SurveyPanel = () => (
	<PluginDocumentSettingPanel
		name="s2j-webinar-survey"
		title={__('Survey questions', 's2j-webinar-survey')}
		className="s2j-webinar-survey-panel"
	>
		<p className="description">
			{__(
				'Survey editor UI is under construction. Meta REST and evaluate REST are available.',
				's2j-webinar-survey',
			)}
		</p>
	</PluginDocumentSettingPanel>
);

registerPlugin('s2j-webinar-survey', {
	render: SurveyPanel,
});
