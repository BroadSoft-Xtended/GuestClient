package com.broadsoft.cgc.server;

import static com.broadsoft.cgc.server.AppConstants.COLLABORATE_GUEST_CLIENT_CHANNEL;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_ALLOW_HTTP;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_APPLICATION_ID;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_CHROME_EXTENSION_ID;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_BOSH_URL;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_CUSTOM_RESOURCE_PATH;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_DISABLE_CAPTCHA;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_ENABLE_CALLMENOW;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_ENABLE_WEBRTC;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_ENABLE_WEBRTCVIDEO;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_WEBRTCVIDEO_RESOLUTION;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_LEADER_ACCEPTANCE_TIMEOUT;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_RECAPTCHA_PRIVATE;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_RECAPTCHA_PUBLIC;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_TXN_GLOBAL_LIMIT;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_TXN_GLOBAL_LIMIT_PERIOD_IN_SEC;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_SEND_CONFID_AS_SIP_URI_HEADER_ENABLED;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_INTERNAL_DEV_MODE;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_INTERNAL_FORCE_MEETME_FOR_CALLMENOW;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_PA_HOST_ADMIN;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_PA_HOST_ADMIN_PASSWORD;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_PA_HOST_URL;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_SSL_SERVER_PORT;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_WRS_ADDRESS_LIST;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_WRS_DOMAIN_FROM;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_WRS_DOMAIN_TO;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_WRS_STUN_PORT;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_WRS_STUN_SERVER;
import static com.broadsoft.cgc.server.AppConstants.KEY_APP_APPLICATION_LOGGER;
import static com.broadsoft.cgc.server.AppConstants.RESOURCE_KEY_HTTP_MANAGER;
import static com.broadsoft.xsp.app.base.XSPAppConstants.KEY_APP_VERSION;

import java.util.logging.Level;

import javax.servlet.ServletContextEvent;

import com.broadsoft.cgc.i18n.I18nManager;
import com.broadsoft.cgc.server.loggers.ApplicationChannelLogger;
import com.broadsoft.cgc.server.loggers.CGCApplicationLogger;
import com.broadsoft.cgc.server.loggers.CGCDevLogger;
import com.broadsoft.cgc.server.loggers.ChannelLoggerUtil;
import com.broadsoft.cgc.util.ApplicationUtil;
import com.broadsoft.http.apache.ThreadsafeClientHttpManager;
import com.broadsoft.http.interfaces.IHttpCallBack;
import com.broadsoft.http.interfaces.IHttpClientConfigKeys;
import com.broadsoft.xsp.BwLogger.Severity;
import com.broadsoft.xsp.app.base.ChannelSeverity;
import com.broadsoft.xsp.app.base.IXSPAppConfiguration;
import com.broadsoft.xsp.app.server.XSPAppServletContextListener;
import com.broadsoft.xsp.app.server.XSPBaseAppContext;

public class CollaborateGuestClientServletContextListener extends
		XSPAppServletContextListener {

	@Override
	protected String getApplicationName() {
		return "BWCollaborateGuestClient";
	}

	@Override
	public void contextInitialized(ServletContextEvent event) {
		super.contextInitialized(event);
		ChannelLoggerUtil.initialize(appContext);

		ApplicationUtil.setAppContext(appContext);

		I18nManager.init(appContext);

		ThreadsafeClientHttpManager threadsafeClientHttpManager = (ThreadsafeClientHttpManager) ThreadsafeClientHttpManager.getInstance(appContext
                .getResourceConfiguration().getProperties());

		threadsafeClientHttpManager.setCallBack(new IHttpCallBack() {
			
			@Override
			public void log(Level level, String message) {
				ChannelLoggerUtil
				.getLogger()
				.log( ChannelSeverity.convertToChannelSeverity(level),
						"CollaborateGuestClient:HTTP Layer : \n" + message);

			}
		});
		appContext.setAttribute(RESOURCE_KEY_HTTP_MANAGER,
				threadsafeClientHttpManager);

		appContext.log(Severity.INFO, "BwServletContextListener",
				"Context Initialization Done for " + getApplicationName());
	}

	@Override
	public void contextDestroyed(ServletContextEvent event) {

		appContext.log(Severity.INFO, "BwServletContextListener",
				"Shut Down started for " + getApplicationName());
		I18nManager.destroy();

		ThreadsafeClientHttpManager threadsafeClientHttpManager = (ThreadsafeClientHttpManager) appContext
				.getAttribute(RESOURCE_KEY_HTTP_MANAGER);
		if (threadsafeClientHttpManager != null) {
			threadsafeClientHttpManager.close();
		}
		super.contextDestroyed(event);

	}

	@Override
	protected void setDefaultApplicationConfiguration(
			IXSPAppConfiguration configuration) {
		super.setDefaultApplicationConfiguration(configuration);

		// internal configuartion
		configuration.setConfiguration(
				CONFIG_KEY_INTERNAL_DEV_MODE, "false");
		configuration.setConfiguration(
				CONFIG_KEY_INTERNAL_FORCE_MEETME_FOR_CALLMENOW,
				"false");

		// Default for general configurations
		configuration.setConfiguration(
				CONFIG_KEY_GENERAL_ENABLE_WEBRTC, "true");
		configuration.setConfiguration(
				CONFIG_KEY_GENERAL_ENABLE_WEBRTCVIDEO, "true");
		configuration.setConfiguration(
		        CONFIG_KEY_GENERAL_WEBRTCVIDEO_RESOLUTION, "R_640x480");
		configuration.setConfiguration(
				CONFIG_KEY_GENERAL_ENABLE_CALLMENOW, "true");
		configuration.setConfiguration(
				CONFIG_KEY_GENERAL_BOSH_URL, "");
		configuration.setConfiguration(
				CONFIG_KEY_GENERAL_CUSTOM_RESOURCE_PATH, "");
		configuration.setConfiguration(
				CONFIG_KEY_GENERAL_TXN_GLOBAL_LIMIT_PERIOD_IN_SEC,
				"30");
		configuration.setConfiguration(
				CONFIG_KEY_GENERAL_TXN_GLOBAL_LIMIT, "1000");
		
		configuration.setConfiguration(
				CONFIG_KEY_GENERAL_LEADER_ACCEPTANCE_TIMEOUT, "60");

		configuration.setConfiguration(
				CONFIG_KEY_GENERAL_DISABLE_CAPTCHA, "false");
		configuration.setConfiguration(
				CONFIG_KEY_GENERAL_RECAPTCHA_PRIVATE, "");
		configuration.setConfiguration(
				CONFIG_KEY_GENERAL_RECAPTCHA_PUBLIC, "");
		
		configuration.setConfiguration(
				CONFIG_KEY_GENERAL_SEND_CONFID_AS_SIP_URI_HEADER_ENABLED, "false");
		

		// Default for Http configurations
		configuration.setConfiguration(
				IHttpClientConfigKeys.KEY_HTTP_CLIENT_CONNECTION_MAX, "200");
		configuration.setConfiguration(
				IHttpClientConfigKeys.KEY_HTTP_CLIENT_CONNECTION_PER_HOST_MAX,
				"100");
		configuration.setConfiguration(
				IHttpClientConfigKeys.KEY_HTTP_CONNECTION_ALLOW_SELF_SIGNED_CERTS, "true");

		// Default for ProvisioningAdapter configurations
		configuration.setConfiguration(CONFIG_KEY_PA_HOST_URL, "");
		configuration.setConfiguration(CONFIG_KEY_PA_HOST_ADMIN,
				"");
		configuration.setConfiguration(
				CONFIG_KEY_PA_HOST_ADMIN_PASSWORD, "");

		// Default for ProvisioningAdapter configurations
		configuration.setConfiguration(
				CONFIG_KEY_WRS_ADDRESS_LIST,
				"");
		configuration.setConfiguration(CONFIG_KEY_WRS_DOMAIN_TO,
				"");
		configuration.setConfiguration(CONFIG_KEY_WRS_DOMAIN_FROM,
				"");
		configuration.setConfiguration(CONFIG_KEY_WRS_STUN_SERVER,
				"");
		configuration.setConfiguration(CONFIG_KEY_WRS_STUN_PORT,
				"19302");
		
		configuration.setConfiguration(CONFIG_KEY_APPLICATION_ID, "com.broadsoft.guestclient");
		
		// Default configuration for Http Client
		configuration.setConfiguration(IHttpClientConfigKeys.KEY_HTTP_CLIENT_CONNECTION_MAX,
                "200");
		configuration.setConfiguration(
                IHttpClientConfigKeys.KEY_HTTP_CLIENT_CONNECTION_PER_HOST_MAX,
                "100");
		configuration.setConfiguration(IHttpClientConfigKeys.KEY_HTTP_CLIENT_TCP_NO_DELAY,
                "true");

		configuration.setConfiguration(CONFIG_KEY_CHROME_EXTENSION_ID,
                "");
		
		configuration.setConfiguration(CONFIG_KEY_SSL_SERVER_PORT,
                "443");
		configuration.setConfiguration(CONFIG_KEY_ALLOW_HTTP,
                "true");
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.broadsoft.xsp.app.server.XSPAppServletContextListener#
	 * postReadApplicationConfiguration
	 * (com.broadsoft.xsp.app.base.IXSPAppConfiguration)
	 */
	@Override
	protected void postReadApplicationConfiguration(
			IXSPAppConfiguration configuration) {

		super.postReadApplicationConfiguration(configuration);
		String logFileName = "BWCollaborateGuestClientLog";
		String appVersion = getApplicationVersion();
		if (appVersion != null && !appVersion.trim().isEmpty()) {
			logFileName = "BWCollaborateGuestClientLog_" + appVersion + "_";
		}
		configuration.setConfiguration("bwLogger.webapp.logFileName",
				logFileName);
		
		
		//Backward compatibility to set the option for sending confid with SIP URI invite
		String oldConfig = configuration.getConfiguration("cgc.config.key.inBandDTMFSupport.enabled");
		String newConfig = configuration.getConfiguration(CONFIG_KEY_GENERAL_SEND_CONFID_AS_SIP_URI_HEADER_ENABLED);
		if( (newConfig == null || newConfig.trim().length()==0)
				&& (oldConfig != null && oldConfig.trim().length()>0)){
			configuration.setConfiguration(
					CONFIG_KEY_GENERAL_SEND_CONFID_AS_SIP_URI_HEADER_ENABLED, oldConfig);
		}
		
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @seecom.broadsoft.xsp.app.server.XSPAppServletContextListener#
	 * getApplicationConfigurationFile()
	 */
	@Override
	protected String getApplicationConfigurationFile() {
		String fileName = super.getApplicationConfigurationFile();
		return fileName == null ? "BWCollaborateGuestClientConfig.properties"
				: fileName;

	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.broadsoft.xsp.app.server.XSPAppServletContextListener#
	 * getApplicationVersion()
	 */
	@Override
	protected String getApplicationVersion() {
		/*
		 * Look for the version of the webapp in the web.xml from the
		 * (<env-entry-name>webAppVersion</env-entry-name>).
		 */
		String webAppVersion = (String) appContext
				.getAttribute(KEY_APP_VERSION);
		if (webAppVersion == null || webAppVersion.isEmpty()) {
			webAppVersion = "1.0";
		}
		return webAppVersion;
	}

	@Override
	public String getApplicationChannelName() {
		return COLLABORATE_GUEST_CLIENT_CHANNEL;
	}

	@Override
	protected void initializeApplicationLogger(XSPBaseAppContext appContext) {
		ApplicationChannelLogger logger;
		if (appContext.isDevEnvironmentLoggingEnabled()
				|| !appContext.isLogConfigEnabled()) {
			logger = new CGCDevLogger(appContext);

		} else {
			logger = new CGCApplicationLogger(appContext);
		}
		appContext
				.setAttribute(KEY_APP_APPLICATION_LOGGER, logger);
	}

}
