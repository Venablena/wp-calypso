/**
 * External dependencies
 *
 * @format
 */

import { bindActionCreators } from 'redux';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	fetchEmailSettings,
	emailSettingChange,
	emailSettingsSubmitSettings,
} from 'woocommerce/state/sites/settings/email/actions';
import {
	getEmailSettings,
	areEmailSettingsLoading,
	areEmailSettingsLoaded,
	emailSettingsSaveRequest,
	isSavingEmailSettings,
	emailSettingsSubmitSettingsError,
} from 'woocommerce/state/sites/settings/email/selectors';
import { errorNotice, successNotice } from 'state/notices/actions';
import CustomerNotification from './components/customer-notification';
import ExtendedHeader from 'woocommerce/components/extended-header';
import InternalNotification from './components/internal-notification';
import NotificationsOrigin from './components/notifications-origin';
import List from 'woocommerce/components/list/list';
import ListHeader from 'woocommerce/components/list/list-header';
import ListItemField from 'woocommerce/components/list/list-item-field';

const originNotifications = [
	{
		field: 'email',
		option: 'woocommerce_email_from_name',
		title: translate( 'From name' ),
		subtitle: translate( "Emails will appear in recipients inboxes 'from' this name." ),
	},
	{
		field: 'email',
		option: 'woocommerce_email_from_address',
		title: translate( 'From address' ),
		subtitle: translate( 'If recipients reply to store emails they will be sent to this address.' ),
		checkEmail: true,
	},
];

const internalNotifications = [
	{
		field: 'email_new_order',
		title: translate( 'New order' ),
		subtitle: translate( 'Sent when a new order is received.' ),
	},
	{
		field: 'email_cancelled_order',
		title: translate( 'Cancelled order' ),
		subtitle: translate( "Sent when a new order is marked 'cancelled'." ),
	},
	{
		field: 'email_failed_order',
		title: translate( 'Failed order' ),
		subtitle: translate( "Sent when a new order is marked 'failed'." ),
	},
];

// id enabled
const customerNotifications = [
	{
		field: 'email_customer_on_hold_order',
		title: translate( 'Order pending payment' ),
		subtitle: translate( "Sent when an order is marked 'payment pending'." ),
	},
	{
		field: 'email_customer_processing_order',
		title: translate( 'Processing order' ),
		subtitle: translate( "Sent when an order is marked 'payment processing'." ),
	},
	{
		field: 'email_customer_completed_order',
		title: translate( 'Completed order' ),
		subtitle: translate( "Sent when an order is marked 'paid in full'." ),
	},
	{
		field: 'email_customer_refunded_order',
		title: translate( 'Refunded order' ),
		subtitle: translate( "Sent when an order is marked 'payment refunded'." ),
	},
	{
		field: 'email_customer_new_account',
		title: translate( 'New account' ),
		subtitle: translate( 'Sent when customers sign up via checkout or account page.' ),
	},
];

class Settings extends React.Component {
	constructor( props ) {
		super( props );
	}

	fetchSettings = props => {
		const { siteId, fetchSettings } = props;
		siteId && fetchSettings( siteId );
	};

	componentDidMount = () => {
		this.fetchSettings( this.props );
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			this.fetchSettings( nextProps );
		}

		// Save settings request
		if ( ! this.props.saveSettingsRequest && nextProps.saveSettingsRequest ) {
			nextProps.loaded && nextProps.submit( nextProps.siteId, nextProps.settings );
		}

		// Settings save request finished.
		if ( ! nextProps.isSaving && this.props.isSaving ) {
			if ( nextProps.submitError ) {
				nextProps.errorNotice(
					translate( 'There was a problem saving the email settings. Please try again.' )
				);
			} else {
				nextProps.successNotice( translate( 'Email settings saved.' ), { duration: 4000 } );
			}
		}
	}

	onChange = event => {
		const { onChange, siteId } = this.props;
		onChange( siteId, event );
	};

	renderOriginNotification = ( item, index ) => {
		const { settings, loaded, loading } = this.props;
		return (
			<NotificationsOrigin
				key={ index }
				item={ item }
				isPlaceholder={ loading }
				recipient={ loaded ? settings[ item.field ][ item.option ] : '' }
				onChange={ this.onChange }
				checkEmail={ item.checkEmail }
			/>
		);
	};

	renderInternalNotification = ( item, index ) => {
		const { settings, loaded, loading } = this.props;
		return (
			<InternalNotification
				key={ index }
				item={ item }
				checked={ 'yes' === ( loaded && settings[ item.field ].enabled ) }
				recipient={ loaded ? settings[ item.field ].recipient : '' }
				isPlaceholder={ loading }
				onChange={ this.onChange }
			/>
		);
	};

	renderCustomerNotification = ( item, index ) => {
		const { settings, loaded, loading } = this.props;
		return (
			<CustomerNotification
				key={ index }
				item={ item }
				isPlaceholder={ loading }
				checked={ 'yes' === ( loaded && settings[ item.field ].enabled ) }
				onChange={ this.onChange }
			/>
		);
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	render() {
		const { loading, loaded, settings } = this.props;
		const waiting = ! loaded || loading;

		return (
			<div className="email-settings__container">
				<ExtendedHeader label={ translate( 'Origin' ) } />
				<List>{ originNotifications.map( this.renderOriginNotification ) }</List>
				<div>
					<ExtendedHeader
						label={ translate( 'Internal notifications' ) }
						description={ translate( 'Email notifications sent to store staff.' ) }
					/>
					<List>
						<ListHeader>
							<ListItemField className="components__notification-component-title">
								{ translate( 'Email' ) }
							</ListItemField>
							<ListItemField className="components__notification-component-input">
								{ translate( 'Recipients (comma separated)' ) }
							</ListItemField>
							<ListItemField className="components__notification-component-toggle-label">
								{ translate( 'Enabled' ) }
							</ListItemField>
						</ListHeader>
						{ internalNotifications.map( this.renderInternalNotification ) }
					</List>
				</div>
				<div>
					<ExtendedHeader
						label={ translate( 'Customer notifications' ) }
						description={ translate( 'Email notifications sent to your customers.' ) }
					/>
					<List>
						<ListHeader>
							<ListItemField>{ translate( 'Email' ) }</ListItemField>
							<ListItemField>{ translate( 'Enabled' ) }</ListItemField>
						</ListHeader>
						{ customerNotifications.map( this.renderCustomerNotification ) }
					</List>
				</div>
			</div>
		);
	}
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

Settings.propTypes = {
	siteId: PropTypes.number.isRequired,
	fetchSettings: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
	settings: PropTypes.object,
	loading: PropTypes.bool,
};

function mapStateToProps( state, props ) {
	return {
		settings: areEmailSettingsLoaded( state, props.siteId )
			? getEmailSettings( state, props.siteId )
			: {},
		loading: areEmailSettingsLoading( state, props.siteId ),
		loaded: areEmailSettingsLoaded( state, props.siteId ),
		saveSettingsRequest: emailSettingsSaveRequest( state, props.siteId ),
		isSaving: isSavingEmailSettings( state, props.siteId ),
		submitError: emailSettingsSubmitSettingsError( state, props.siteId ),
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			onChange: emailSettingChange,
			fetchSettings: fetchEmailSettings,
			submit: emailSettingsSubmitSettings,
			errorNotice,
			successNotice,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( Settings );
