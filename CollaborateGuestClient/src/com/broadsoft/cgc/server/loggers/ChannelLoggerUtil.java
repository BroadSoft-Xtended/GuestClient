/*
 * BroadWorks
 * Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

package com.broadsoft.cgc.server.loggers;

import com.broadsoft.cgc.server.AppConstants;
import com.broadsoft.xsp.app.base.ChannelSeverity;
import com.broadsoft.xsp.app.server.XSPBaseAppContext;

public class ChannelLoggerUtil {

	private static ApplicationChannelLogger appLogger;

	public static void initialize(XSPBaseAppContext applicationContext) {

		appLogger = (ApplicationChannelLogger) applicationContext
				.getAttribute(AppConstants.KEY_APP_APPLICATION_LOGGER);

	}

	public static ApplicationChannelLogger getLogger() {
		return appLogger;
	}

	public static boolean isLogLevelActive(String channelName,
			ChannelSeverity severity) {
		return appLogger.getLogLevel(channelName).getIntValue() <= severity
				.getIntValue();
	}

}
