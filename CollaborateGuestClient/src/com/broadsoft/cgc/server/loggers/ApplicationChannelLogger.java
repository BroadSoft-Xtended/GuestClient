/*
 * BroadWorks
 * Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

package com.broadsoft.cgc.server.loggers;

import com.broadsoft.xsp.app.base.ChannelSeverity;

/**
 * This interface provides methods to the application to log to various channel
 * interfaces configurable for thin clients.
 * 
 * @author animesh.sonkar
 * 
 */
public interface ApplicationChannelLogger {

	/**
	 * This method logs to application channel interface.
	 * 
	 * @param severity
	 *            The log severity level
	 * @param component
	 *            The application component.
	 * @param message
	 *            The log message
	 */
	public void log(ChannelSeverity severity, String component, String message);

	/**
	 * This method logs to application channel interface.
	 * 
	 * @param severity
	 *            The log severity level
	 * @param message
	 *            The log message
	 */
	public void log(ChannelSeverity severity, String message);

	/**
	 * This method logs exceptions to application channel interface.
	 * 
	 * @param severity
	 *            The log severity level
	 * @param throwable
	 *            The throwable to log
	 */
	public void log(ChannelSeverity severity, Throwable throwable);

	/**
	 * This method logs to GenericInterface channel.<br>
	 * 
	 * @param severity
	 *            The log severity level
	 * @param message
	 *            The log message
	 */
	public void logGenericInterface(ChannelSeverity severity, String message);

	/**
	 * This method logs exceptions to GenericInterface channel.<br>
	 * 
	 * @param severity
	 *            The log severity level
	 * @param throwable
	 *            The throwable to log
	 */
	public void logGenericInterface(ChannelSeverity severity,
			Throwable throwable);

	/**
	 * This method logs to the console depending upon the property
	 * XSPAppConstants.KEY_DEVELOPER_LOG_ENABLED
	 * 
	 * @param message
	 */
	public void logConsole(String message);

	/**
	 * This method returns the log level configured for param channelName.
	 * 
	 * @param channelName
	 *            The channelname for which log level is needed.
	 */
	public ChannelSeverity getLogLevel(String channelName);

}
