/*
 * BroadWorks
 * Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

package com.broadsoft.cgc.server;

import static com.broadsoft.cgc.server.AppConstants.COLLABORATE_GUEST_CLIENT_CHANNEL;
import static com.broadsoft.xsp.app.base.XSPAppConstants.KEY_RESOURCE_XSP_APP_CONTEXT;

import java.io.IOException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.broadsoft.cgc.server.loggers.ChannelLoggerUtil;
import com.broadsoft.cgc.util.ApplicationUtil;
import com.broadsoft.http.HttpClientRequest;
import com.broadsoft.http.interfaces.IHttpClientResponse;
import com.broadsoft.http.interfaces.IHttpConstants;
import com.broadsoft.xsp.app.base.ChannelSeverity;
import com.broadsoft.xsp.app.base.IXSPAppContext;

public class DeleteGuestServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	
	IXSPAppContext appContext = null;
	public static final String RESOURCE_PATH_DELETE_USER = "/userservice/impguest/jid/";
	public static final String REQ_PARAMETER_JID = "jid";
	public static final String REQ_PARAMETER_USERID = "leaderBWUserId";

	@Override
	public void init(ServletConfig config) throws ServletException {
		super.init(config);
		appContext = (IXSPAppContext) config.getServletContext().getAttribute(
				KEY_RESOURCE_XSP_APP_CONTEXT);
	}

	protected void doPost(HttpServletRequest req, HttpServletResponse response)
			throws ServletException, IOException {

		String jid = req.getParameter(REQ_PARAMETER_JID);
		String leaderBWUserId = req.getParameter(REQ_PARAMETER_USERID);
		ChannelLoggerUtil.getLogger().log(ChannelSeverity.INFO,
				DeleteGuestServlet.class.getName(),
				"Received request to delete Guest " + jid + ".");
		
		deleteGuest(jid, leaderBWUserId);

		try {
			req.getSession().invalidate();
		} catch (Exception e) {

		}
	}
	private void deleteGuest(String jid, String leaderBWUserId) {
		
		String hostUrl = ApplicationUtil.getProvisioningURL(leaderBWUserId);
		
	    deleteGuest(jid, hostUrl, appContext.getResourceConfiguration()
                        .getConfiguration(AppConstants.CONFIG_KEY_PA_HOST_ADMIN), appContext
                        .getResourceConfiguration().getConfiguration(
                                AppConstants.CONFIG_KEY_PA_HOST_ADMIN_PASSWORD));
	}
	public static void deleteGuest(String jid, String hostURL, String hostAdmin, String hostPwd) {

		//TIII-54124 - Guest Client support for UCaaS - provisioningUrl update
		HttpClientRequest httpClientRequest = new HttpClientRequest(hostURL + RESOURCE_PATH_DELETE_USER + jid);
		httpClientRequest.setMethod(IHttpConstants.METHOD_DELETE);
		httpClientRequest.setAllowLogging(true);
		httpClientRequest.setAuthUserName(hostAdmin);
		httpClientRequest.setAuthUserPassword(hostPwd);
		
		//httpClientRequest.setResourcePath(resourcePath + RESOURCE_PATH_DELETE_USER + jid);

		IHttpClientResponse response = ApplicationUtil.doExecute(httpClientRequest);

		if (response.getStatusCode() == 200) {
            if (ChannelLoggerUtil.isLogLevelActive(COLLABORATE_GUEST_CLIENT_CHANNEL, ChannelSeverity.DEV_DEBUG)) {
                ChannelLoggerUtil.getLogger().log(ChannelSeverity.DEV_DEBUG, DeleteGuestServlet.class.getName(),
                        "Guest " + jid + " has been successfully removed from the IMP guest domain");
            }

		} else {
			ChannelLoggerUtil.getLogger().log(
					ChannelSeverity.WARN,
					DeleteGuestServlet.class.getName(),
					"Failed to remove Guest " + jid
							+ " from the IMP guest domain");
		}
	}
}
