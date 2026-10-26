import { ExternalLink, Notice, PanelRow } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getSurveyEditorConfig } from '@/gutenberg/config';

export function WebinarDependencyNotice() {
	const config = getSurveyEditorConfig();

	if (config.s2jWebinarActive) {
		return null;
	}

	if (!config.s2jWebinarInstalled) {
		const guideUrl = config.webinarInstallGuideUrl;
		return (
			<PanelRow>
				<Notice status="warning" isDismissible={false}>
					<p>
						{__(
							'Install S2J Webinar to attach surveys to webinars.',
							's2j-webinar-survey',
						)}{' '}
						{guideUrl ? (
							<ExternalLink href={guideUrl}>
								{__('Installation guide', 's2j-webinar-survey')}
							</ExternalLink>
						) : null}
					</p>
				</Notice>
			</PanelRow>
		);
	}

	const activateUrl = config.webinarActivateUrl;
	return (
		<PanelRow>
			<Notice status="warning" isDismissible={false}>
				<p>
					{__('Enable S2J Webinar to attach surveys to webinars.', 's2j-webinar-survey')}{' '}
					{activateUrl ? (
						<a href={activateUrl}>
							{__('Activate S2J Webinar', 's2j-webinar-survey')}
						</a>
					) : null}
				</p>
			</Notice>
		</PanelRow>
	);
}
