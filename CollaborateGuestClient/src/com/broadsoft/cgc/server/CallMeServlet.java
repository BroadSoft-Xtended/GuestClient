/*
 * BroadWorks
 * Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

package com.broadsoft.cgc.server;

import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_INTERNAL_FORCE_MEETME_FOR_CALLMENOW;
import static com.broadsoft.cgc.server.AppConstants.MEETME_CONF_TYPE;
import static com.broadsoft.cgc.server.AppConstants.UVS_CONF_TYPE;
import static com.broadsoft.xsp.app.base.XSPAppConstants.KEY_RESOURCE_XSP_APP_CONTEXT;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.broadsoft.cgc.server.loggers.ChannelLoggerUtil;
import com.broadsoft.cgc.util.ApplicationUtil;
import com.broadsoft.xsp.BwCommunicationMgr;
import com.broadsoft.xsp.BwPrincipal;
import com.broadsoft.xsp.app.base.ChannelSeverity;
import com.broadsoft.xsp.app.base.IXSPAppContext;

public class CallMeServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	IXSPAppContext appContext = null;

	@Override
	public void init(ServletConfig config) throws ServletException {		
		super.init(config);
		appContext = (IXSPAppContext) config.getServletContext().getAttribute(
				KEY_RESOURCE_XSP_APP_CONTEXT);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		PrintWriter out = resp.getWriter();

		boolean internalConfigForceCallMeForMeetMeNow = appContext
				.getResourceConfiguration()
				.getBooleanOption(
						CONFIG_KEY_INTERNAL_FORCE_MEETME_FOR_CALLMENOW,
						false);
		String leaderBWUserId = req.getParameter("leaderBWUserId");
		String bridgeID = req.getParameter("bridgeId");
		String confId = req.getParameter("conferenceId");
		String phoneNumber = req.getParameter("phoneNumber");
		String confType = req.getParameter("confType");
		
        if (ApplicationUtil.isEmptyString(leaderBWUserId) || ApplicationUtil.isEmptyString(confType)
                || ApplicationUtil.isEmptyString(bridgeID) || ApplicationUtil.isEmptyString(confId)
                || ApplicationUtil.isEmptyString(phoneNumber)) {
            ChannelLoggerUtil.getLogger().log(
                    ChannelSeverity.NOTICE,
                    "CallMeNow failed due to invalid argument " + "leaderId=" + leaderBWUserId + " confType="
                            + confType + " bridgeId=" + bridgeID + " confId=" + confId + " phoneNumber=" + phoneNumber);
            resp.setStatus(412);
            out.println(
                    "CallMeNow failed due to invalid argument " + "leaderId=" + leaderBWUserId + " confType="
                            + confType + " bridgeId=" + bridgeID + " confId=" + confId + " phoneNumber=" + phoneNumber);
            out.flush();
            return;

        }
        String response = null;
		
        BwCommunicationMgr bwMgr = appContext.getCommunicationManager();
        BwPrincipal principal = bwMgr.generatePrincipal(leaderBWUserId);
        
		
				
		String ocicXML = null;
		confId = confId.replaceAll("#", "");
		if (confType != null
				&& (internalConfigForceCallMeForMeetMeNow || confType
						.equalsIgnoreCase(MEETME_CONF_TYPE))) {
			// EV240092 - conferencebridgeID without domain name (CGC Call back
			// fails)
			// If the bridgeID does not contain the domain part, then retrieve the
			// system default domain and append it.
			if (bridgeID.indexOf("@") < 0) {
				String ociXML = prepareOciXMLForSystemDefaultDomain(leaderBWUserId);
				response = bwMgr.sendOCIPMessage(principal, ociXML);

				if (!ApplicationUtil.isEmptyString(response)) {
					String defaultDomain = ApplicationUtil.getTagValue(
							"systemDefaultDomain", response);
					if (!ApplicationUtil.isEmptyString(defaultDomain)) {
						bridgeID = bridgeID + "@" + defaultDomain;
					}
				}

			}
			
			
			ocicXML = prepareOcicXMLForMeeMeConf(leaderBWUserId, bridgeID, confId,
					phoneNumber);
		} else if (confType != null
				&& confType.equalsIgnoreCase(UVS_CONF_TYPE)) {
			ocicXML = prepareOcicXMLForUVSConf(leaderBWUserId, confId, phoneNumber);
		}

		ChannelLoggerUtil.getLogger().log(ChannelSeverity.INFO,
				"CallMeNow invoked : " + ocicXML);
		

		if (ocicXML != null) {
			
			response = bwMgr.sendOCICMessage(principal, ocicXML);
			
		}

		ChannelLoggerUtil.getLogger().log(ChannelSeverity.INFO,
				"CallMeBack invoked Response: " + response);
		if (response == null) {
		    
		    resp.setStatus(400);
		    out.println(
					"CallMeNow failed by the server");
		    out.flush();
		}else{
			resp.setStatus(200);
			out.write(response);
			out.flush();
		}

	}

	private String prepareOcicXMLForMeeMeConf(String leaderBWUserId, String bridgeId,
			String confId, String phoneNumber) {
		StringBuffer stringBuffer = new StringBuffer();
		stringBuffer.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
		stringBuffer
				.append("<oci:OCICMessage xsi:type=\"oci:MeetMeConferenceOutgoingDialRequest17sp3\" "
				        + "xmlns:oci=\"http://schema.broadsoft.com/oci-c\" "
				        + "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">");
		stringBuffer.append("<oci:authUserId>" + leaderBWUserId
				+ "</oci:authUserId>");
		stringBuffer.append("<oci:userId>" + bridgeId + "</oci:userId>");
		stringBuffer.append("<oci:conferenceId>" + confId
				+ "</oci:conferenceId>");
		stringBuffer.append("<oci:address>tel:" + phoneNumber
				+ "</oci:address>");
		stringBuffer.append("</oci:OCICMessage>");

		return stringBuffer.toString();
	}

	private String prepareOcicXMLForUVSConf(String leaderBWUserId, String confId,
 String phoneNumber) {

		StringBuffer stringBuffer = new StringBuffer();
		stringBuffer.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
		stringBuffer
				.append("<oci:OCICMessage xsi:type=\"oci:CollaborateRoomOutgoingDialRequest\" "
						+ "xmlns:oci=\"http://schema.broadsoft.com/oci-c\" "
						+ "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">");
		stringBuffer.append("<oci:authUserId>" + leaderBWUserId
				+ "</oci:authUserId>");
		stringBuffer.append("<oci:userId>" + leaderBWUserId + "</oci:userId>");
		stringBuffer.append("<oci:roomId>" + confId + "</oci:roomId>");
		stringBuffer.append("<oci:address>tel:" + phoneNumber
				+ "</oci:address>");

		stringBuffer.append("</oci:OCICMessage>");

		return stringBuffer.toString();
	}
	
    private String prepareOciXMLForSystemDefaultDomain(String userId) {

        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append("<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>"
                + "<BroadsoftDocument protocol=\"OCI\" xmlns=\"C\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">"
        		+"<userId xmlns=\"\">"+userId+"</userId>"
                + "<command xsi:type=\"SystemDomainGetListRequest\" xmlns=\"\" >"
                +"</command>"
                + "</BroadsoftDocument>");

        return stringBuffer.toString();
    }
	
}
