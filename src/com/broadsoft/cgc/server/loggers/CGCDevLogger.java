/*
 * BroadWorks
 * Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

package com.broadsoft.cgc.server.loggers;

import java.text.FieldPosition;
import java.text.SimpleDateFormat;
import java.util.Date;

import com.broadsoft.xsp.BwLogger.Severity;
import com.broadsoft.xsp.app.base.ChannelSeverity;
import com.broadsoft.xsp.app.base.IXSPAppContext;
import com.broadsoft.xsp.app.logging.XSPAppLogger;
import com.broadsoft.xsp.app.server.XSPBaseAppContext;

/**
 * This is used for dev mode logging
 * 
 * @author animesh.sonkar
 * 
 */
@SuppressWarnings("deprecation")
public class CGCDevLogger implements ApplicationChannelLogger {

	private static IXSPAppContext appContext;
	private static XSPAppLogger appLogger = null;


	private final SimpleDateFormat dateFormatter = new SimpleDateFormat(
			"yyyy.MM.dd HH:mm:ss:SSS zzz");
	private final Date formatDate = new Date();
	private final FieldPosition pos = new FieldPosition(0);

	@SuppressWarnings("unused")
	private CGCDevLogger() {

	}

	public CGCDevLogger(XSPBaseAppContext applicationContext) {
		appContext = applicationContext;
		appLogger = (XSPAppLogger) applicationContext.getLogger();

	}

	public Severity getLogLevel() {
		return appLogger.getLogLevel();
	}

	public void log(Severity severity, String component, String logText) {
		component = (component == null) ? "" : component;
		if (severity.compareTo(getLogLevel()) <= 0) {
			StringBuffer strBuffer = new StringBuffer("\n");
			formatDate.setTime(System.currentTimeMillis());
			dateFormatter.format(formatDate, strBuffer, pos);
			strBuffer.append(" | " + severity);
			strBuffer.append(" | " + component);
			strBuffer.append("\n\t" + logText);
			logConsole("ThinClient => " + strBuffer.toString());
		}
		appLogger.log(severity, component, logText);
	}

	private void log(Severity severity, String component, Throwable throwable) {
		component = (component == null) ? "" : component;
		if (severity.compareTo(getLogLevel()) <= 0) {
			StringBuffer strBuffer = new StringBuffer("\n");
			formatDate.setTime(System.currentTimeMillis());
			dateFormatter.format(formatDate, strBuffer, pos);
			strBuffer.append(" | " + severity);
			strBuffer.append(" | " + component);
			strBuffer.append("\n\t" + throwable);
			logConsole("ThinClient => " + strBuffer.toString());
		}

		appLogger.logException(throwable);

	}

	private void convertAndLog(ChannelSeverity severity, String component,
			String message) {
		switch (severity) {
		case DEV_DEBUG:
			log(Severity.DEBUG, component, message);
			break;
		case FIELD_DEBUG:
			log(Severity.TRACE, component, message);
			break;

		case INFO:
			log(Severity.INFO, component, message);
			break;
		case NOTICE:
			log(Severity.WARN, component, message);
			break;

		case WARN:
			log(Severity.ERROR, component, message);
			break;

		default:
			log(Severity.INFO, component, message);
			break;
		}
	}

	private void convertAndLog(ChannelSeverity severity, String component,
			Throwable throwable) {
		log(Severity.ERROR, component, throwable);
	}

	@Override
	public void log(ChannelSeverity severity, String component, String message) {
		convertAndLog(severity, component, message);
	}

	@Override
	public void log(ChannelSeverity severity, String message) {
		convertAndLog(severity, null, message);
	}

	@Override
	public void log(ChannelSeverity severity, Throwable throwable) {
		convertAndLog(severity, null, throwable);
	}

	@Override
	public void logConsole(String message) {
		if (appContext != null) {
			appContext.logConsole(message);
		}
	}

	@Override
	public void logGenericInterface(ChannelSeverity severity, String message) {
		convertAndLog(severity, null, message);
	}

	@Override
	public void logGenericInterface(ChannelSeverity severity,
			Throwable throwable) {
		convertAndLog(severity, null, throwable);
	}

	@Override
	public ChannelSeverity getLogLevel(String channelName) {
		return ChannelSeverity.converToChannelSeverity(appLogger.getLogLevel());
	}
}