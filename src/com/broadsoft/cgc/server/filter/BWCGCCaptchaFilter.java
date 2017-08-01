/*
 * BroadWorks
 * Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

package com.broadsoft.cgc.server.filter;

import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_TXN_GLOBAL_LIMIT;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_TXN_GLOBAL_LIMIT_PERIOD_IN_SEC;
import static com.broadsoft.cgc.server.AppConstants.KEY_OVERLOADED_STATE;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import com.broadsoft.cgc.server.loggers.ChannelLoggerUtil;
import com.broadsoft.cgc.util.ApplicationUtil;
import com.broadsoft.xsp.app.base.ChannelSeverity;

public class BWCGCCaptchaFilter implements Filter {

	// private final static long USER_CLEANUP_PERIOD_MSECS = 3600000;

	TransactionCounter globalTransactionCounter = new TransactionCounter();
	// private long lastCleanupTime = System.currentTimeMillis();
	protected long globalTransactioLimitPeriodMilliSecs = 30 * 1000;
	protected long globalTransactionLimit = 1000;

	private boolean currentOverloadedState = false;

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {

		this.globalTransactioLimitPeriodMilliSecs = ApplicationUtil
				.getContext()
				.getResourceConfiguration()
				.getIntegerOption(
						CONFIG_KEY_GENERAL_TXN_GLOBAL_LIMIT_PERIOD_IN_SEC,
						30) * 1000;
		this.globalTransactionLimit = ApplicationUtil
				.getContext()
				.getResourceConfiguration()
				.getIntegerOption(
						CONFIG_KEY_GENERAL_TXN_GLOBAL_LIMIT, 1000);

		
		ApplicationUtil.getContext().setAttribute(
				KEY_OVERLOADED_STATE, new Boolean("false"));
		
		ChannelLoggerUtil.getLogger().log(
				ChannelSeverity.INFO,
				BWCGCCaptchaFilter.class.getName(),
				"BWCGCCaptchaFilter has initiated with global transation limit of "
						+ globalTransactionLimit + " per "
						+ (globalTransactioLimitPeriodMilliSecs / 1000)
						+ " seconds");

	}

	@Override
	public void destroy() {
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		
		// It check for all kind of requests which hits the server and overload
		// it and just not the join request.
		// if (httpRequest.getParameterMap().containsKey("join")) {

		if (!pegTransactionCounter()) {
			if (!currentOverloadedState) {
				currentOverloadedState = true;
				ApplicationUtil.getContext().setAttribute(
						KEY_OVERLOADED_STATE, new Boolean("true"));

				ChannelLoggerUtil
						.getLogger()
						.log(ChannelSeverity.INFO,
								BWCGCCaptchaFilter.class.getName(),
								"BWCGCCaptchaFilter has encountered overloading. The current volume of requests is more than global transation limit of "
										+ globalTransactionLimit
										+ " per "
										+ (globalTransactioLimitPeriodMilliSecs / 1000)
										+ " seconds");

			}

		} else if (currentOverloadedState) {
			currentOverloadedState = false;
			ApplicationUtil.getContext().setAttribute(
					KEY_OVERLOADED_STATE, new Boolean("false"));
		}

		chain.doFilter(request, response);

	}

	/**
	 * Increments the number of transaction for a period of time.
	 * 
	 * @param principal
	 *            Identifier of the user making the request.
	 * @param contextPath
	 *            Context path of the application.
	 * @return Returns if an overload occurred or not.
	 */
	protected boolean pegTransactionCounter() {
		boolean overloaded = false;
		long count = 0;

		/* Verify the user transaction limit */
		count = globalTransactionCounter.peg();

		if (count > globalTransactionLimit) {
			overloaded = true;
		}

		return !overloaded;
	}

	private class TransactionCounter {
		private long periodCounter = 0;
		private long periodTime = System.currentTimeMillis();



		public synchronized long peg() {
			long currentTime = System.currentTimeMillis();
			long deltaTime = currentTime - periodTime;

			if (deltaTime > globalTransactioLimitPeriodMilliSecs) {
				deltaTime %= globalTransactioLimitPeriodMilliSecs; // Skip whole
																	// periods
				// elapsed
				periodTime = currentTime - deltaTime; // The current's period
														// approx start time.
				periodCounter = 1;
			} else {
				periodCounter++;
			}
			return periodCounter;
		}
	}

}
