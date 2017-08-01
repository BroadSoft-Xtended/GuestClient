/*
 * BroadWorks
 * Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

package com.broadsoft.cgc.server.filter;

import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_ALLOW_HTTP;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_SSL_SERVER_PORT;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

import com.broadsoft.cgc.server.loggers.ChannelLoggerUtil;
import com.broadsoft.cgc.util.ApplicationUtil;
import com.broadsoft.xsp.app.base.ChannelSeverity;

public class BWCGCFilter implements Filter {

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
		ChannelLoggerUtil.getLogger().log(ChannelSeverity.INFO,
				BWCGCCaptchaFilter.class.getName(),
				"BWCGCFilter has been initiated ");
	}

	@Override
	public void destroy() {
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {

		boolean allowHttp = ApplicationUtil.getContext()
				.getResourceConfiguration()
				.getBooleanOption(CONFIG_KEY_ALLOW_HTTP, true);
		if (!allowHttp
				&& request.getScheme().equals("http")
				&& !(request.getServerName().equals("localhost") || request
						.getServerName().equals("127.0.0.1"))) {

			String sslPort = ApplicationUtil.getContext()
					.getResourceConfiguration()
					.getConfiguration(CONFIG_KEY_SSL_SERVER_PORT);

			HttpServletResponse httpResponse = (HttpServletResponse) response;
			httpResponse.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY);

			HttpServletRequest httpRequest = (HttpServletRequest) request;

			String redirectHTTPSURL = "https://" + request.getServerName()
					+ ":" + sslPort + httpRequest.getRequestURI() + "?"
					+ httpRequest.getQueryString();

			ChannelLoggerUtil.getLogger().log(ChannelSeverity.DEV_DEBUG,
					BWCGCFilter.class.getName(),
					"HTTP request is redirected to : " + redirectHTTPSURL);

			httpResponse.sendRedirect(redirectHTTPSURL);
		} else {
			final HttpServletRequest httpRequest = (HttpServletRequest) request;

			// TIII-50350 - DTMF not heard when guest client enters conference
			final String requestURL = httpRequest.getRequestURL().toString();
			if (!requestURL.contains(",") && requestURL.contains(".ogg")) {
				HttpServletResponse httpResponse = (HttpServletResponse) response;
				httpResponse.setHeader("Cache-Control", "max-age=86400");
			}
			chain.doFilter(request, new HttpServletResponseWrapper((HttpServletResponse) response) {
				@Override
		        public void setHeader(String name, String value) {
					// Skipping ETag and Last-Modified for tone files
					if (!requestURL.contains(",") && requestURL.contains(".ogg")) {
	            		if (!name.equalsIgnoreCase("ETag") && !name.equalsIgnoreCase("Last-Modified")) {
	            			super.setHeader(name, value);
	            		}
		            } else {
		            	super.setHeader(name, value);
		            }
		        }
		    });
		}

	}

}
