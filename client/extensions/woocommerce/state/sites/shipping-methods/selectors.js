/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { filter, get, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isWcsEnabled } from 'woocommerce/state/selectors/plugins';
import { LOADING } from 'woocommerce/state/constants';

/*
 * By default, those methods are called "XXXX (WooCommerce Services)".
 * We aren't pushing the "WooCommerce Services" brand anywhere in Calypso, so the method names must be changed.
 */
const METHOD_NAMES = {
	wc_services_usps: translate( 'USPS', { comment: 'United States Postal Services' } ),
	wc_services_canada_post: translate( 'Canada Post' ),
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} The list of shipping methods, as retrieved from the server. It can also be the string "LOADING"
 * if the methods are currently being fetched, or a "falsy" value if that haven't been fetched at all.
 */
export const getShippingMethods = ( state, siteId = getSelectedSiteId( state ) ) => {
	const allMethods = get( state, [
		'extensions',
		'woocommerce',
		'sites',
		siteId,
		'shippingMethods',
	] );
	if ( ! isArray( allMethods ) ) {
		return allMethods;
	}
	const availableMethods = isWcsEnabled( state, siteId )
		? allMethods
		: filter( allMethods, ( { id } ) => ! id.startsWith( 'wc_services' ) );
	return availableMethods.map( method => ( {
		...method,
		title: METHOD_NAMES[ method.id ] || method.title,
	} ) );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the shipping methods list has been successfully loaded from the server
 */
export const areShippingMethodsLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getShippingMethods( state, siteId ) );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the shipping methods list is currently being retrieved from the server
 */
export const areShippingMethodsLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getShippingMethods( state, siteId );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Function} utility function taking method type as an argument and returning a matched type
 */
export const getShippingMethodNameMap = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		if ( ! areShippingMethodsLoaded( state, siteId ) ) {
			return typeId => typeId;
		}

		const map = getShippingMethods( state, siteId ).reduce( ( result, { id, title } ) => {
			result[ id ] = title;
			return result;
		}, {} );

		return typeId => map[ typeId ] || typeId;
	},
	[ areShippingMethodsLoaded, getShippingMethods ]
);
