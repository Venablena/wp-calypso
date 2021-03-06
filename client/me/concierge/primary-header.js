/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormattedHeader from 'components/formatted-header';
import ExternalLink from 'components/external-link';
import { localize } from 'i18n-calypso';
import support from 'lib/url/support';

class PrimaryHeader extends Component {
	render() {
		const { translate } = this.props;

		return (
			<Card>
				<img
					className="concierge__info-illustration"
					src={ '/calypso/images/illustrations/illustration-start.svg' }
				/>
				<FormattedHeader
					headerText={ translate( 'WordPress.com Business Concierge Session' ) }
					subHeaderText={ translate(
						"In this 30 minute session we'll help you get started with your site."
					) }
				/>
				<ExternalLink
					className="concierge__info-link"
					icon={ false }
					href={ support.CONCIERGE_SUPPORT }
					target="_blank"
				>
					{ translate( 'Learn more' ) }
				</ExternalLink>
			</Card>
		);
	}
}

export default localize( PrimaryHeader );
