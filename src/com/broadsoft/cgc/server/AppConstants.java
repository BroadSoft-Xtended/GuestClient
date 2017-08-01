/*
 * BroadWorks
 * Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

package com.broadsoft.cgc.server;

import java.io.Serializable;

/**
 * This class contains the various constants used in the application
 * 
 * @author BroadSoft Engineering
 * 
 *         <pre>
 * Change History
 * Change Date     Changed By     Change Description
 * -----------     ----------     ------------------
 */
public interface AppConstants extends Serializable {

	public static final String ENCODING_UTF8 = "UTF-8";

	public static final String MANIFEST_ENTRY_BUILD_NO = "Build-Number";
	public static final String DEFAULT_DOMAIN_KEY = "system.default.domain";

	public static final String APP_CLIENT_SIDE_DEBUG_ALERT = "system.client.debug.alert.active";
	public static final String APP_CLIENT_SIDE_DEBUG_ALERT_ACCESS_VAR = "system_client_debug_alert_active";

	public static final String MEETME_CONF_TYPE = "Meet-me";
	public static final String UVS_CONF_TYPE = "UVS";

	public static final String RESOURCE_KEY_HTTP_MANAGER = "cgc.http.manager";

	public static final String KEY_OVERLOADED_STATE = "cgc.overload.state";
	public static final String KEY_REQUEST_IS_CAPTCHA_ENABLED = "isCaptchaEnabled";

	/****************************** Logger Channels *******************************/

	public static final String KEY_APP_APPLICATION_LOGGER = "channelAppLogger";
	public static final String COLLABORATE_GUEST_CLIENT_CHANNEL = "BWCollaborateGuestClient";
	public static final String GENERIC_INTERFACE_CHANNEL = "Generic";

	/****************************** Internal Configuration Keys *******************************/
	public static final String CONFIG_KEY_INTERNAL_DEV_MODE = "cgc.config.key.internal.devmode";
	public static final String CONFIG_KEY_INTERNAL_FORCE_MEETME_FOR_CALLMENOW = "cgc.config.key.internal.forceMeetMeForCallMeNow";

	/****************************** General Configuration Keys *******************************/

	public static final String CONFIG_KEY_GENERAL_ENABLE_WEBRTC = "cgc.config.key.webrtc.enabled";
	public static final String CONFIG_KEY_GENERAL_ENABLE_WEBRTCVIDEO = "cgc.config.key.webrtc.video.enabled";
	public static final String CONFIG_KEY_GENERAL_ENABLE_CALLMENOW = "cgc.config.key.callmenow.enabled";
	public static final String CONFIG_KEY_GENERAL_BOSH_URL = "cgc.config.key.boshUrlList";
	public static final String CONFIG_KEY_GENERAL_CUSTOM_RESOURCE_PATH = "cgc.config.key.custom.resourcepath";
	public static final String CONFIG_KEY_GENERAL_IN_BAND_DTMF_SUPPORT_ENABLED ="cgc.config.key.inBandDTMFSupport.enabled";
	public static final String CONFIG_KEY_GENERAL_TXN_GLOBAL_LIMIT_PERIOD_IN_SEC = "cgc.config.key.globalTransactionLimitPeriodInSeconds";
	public static final String CONFIG_KEY_GENERAL_TXN_GLOBAL_LIMIT = "cgc.config.key.globalTransactionLimit";
	
	public static final String CONFIG_KEY_GENERAL_LEADER_ACCEPTANCE_TIMEOUT = "cgc.config.key.leaderAcceptanceTimeOutInSeconds";
	
	public static final String CONFIG_KEY_GENERAL_DISABLE_CAPTCHA = "cgc.config.key.captcha.disabled";
	public static final String CONFIG_KEY_GENERAL_RECAPTCHA_PRIVATE = "cgc.config.key.recaptchaprivatekey";
	public static final String CONFIG_KEY_GENERAL_RECAPTCHA_PUBLIC = "cgc.config.key.recaptchapublickey";
	
	public static final String CONFIG_KEY_SSL_SERVER_PORT = "cgc.config.key.sslServerPort";
	public static final String CONFIG_KEY_ALLOW_HTTP = "cgc.config.key.allowHttp";

	/****************************** PA Configuration Keys *******************************/
	public static final String CONFIG_KEY_PA_HOST_URL = "provisioning.adapter.url";
	public static final String CONFIG_KEY_PA_HOST_ADMIN = "provisioning.adapter.admin";
	public static final String CONFIG_KEY_PA_HOST_ADMIN_PASSWORD = "provisioning.adapter.admin.password";

	/****************************** WRS Configurations *******************************/
	public static final String CONFIG_KEY_WRS_ADDRESS_LIST = "wrs.address.list";
	public static final String CONFIG_KEY_WRS_DOMAIN_TO = "wrs.domain.to";
	public static final String CONFIG_KEY_WRS_DOMAIN_FROM = "wrs.domain.from";
	public static final String CONFIG_KEY_WRS_STUN_SERVER = "wrs.stun.server";
	public static final String CONFIG_KEY_WRS_STUN_PORT = "wrs.stunserver.port";
	
	
	/****************************** BWIntegration Configurations *******************************/
	public static final String CONFIG_KEY_APPLICATION_ID = "bwConnection.ocic.application";
	
	/****************************** Chrome Configurations *******************************/
	public static final String CONFIG_KEY_CHROME_EXTENSION_ID = "chrome.desktopShare.extensionId";

}
