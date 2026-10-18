import { __ } from '@wordpress/i18n';
import {
	messageForAdviceCode,
	messageForDeficiencyCode,
} from '@/domain/evaluationMessages';

type Props = {
	deficiencies: string[];
	advice: string[];
};

export function AdviceList({ deficiencies, advice }: Props) {
	return (
		<>
			<h3 className="s2j-webinar-survey-modal__subhead">
				{__('Deficiencies', 's2j-webinar-survey')}
			</h3>
			{deficiencies.length === 0 ? (
				<p className="description">{__('None', 's2j-webinar-survey')}</p>
			) : (
				<ul className="s2j-webinar-survey-modal__messages">
					{deficiencies.map((code, index) => (
						<li key={`d-${index}-${code}`}>
							{messageForDeficiencyCode(code)}
						</li>
					))}
				</ul>
			)}
			<h3 className="s2j-webinar-survey-modal__subhead">
				{__('Advice', 's2j-webinar-survey')}
			</h3>
			{advice.length === 0 ? (
				<p className="description">{__('None', 's2j-webinar-survey')}</p>
			) : (
				<ul className="s2j-webinar-survey-modal__messages">
					{advice.map((code, index) => (
						<li key={`a-${index}-${code}`}>
							{messageForAdviceCode(code)}
						</li>
					))}
				</ul>
			)}
		</>
	);
}
