/*
 * BroadWorks
 * Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

package com.broadsoft.cgc.util;

import static com.broadsoft.cgc.server.AppConstants.COLLABORATE_GUEST_CLIENT_CHANNEL;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_BOSH_URL;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_DISABLE_CAPTCHA;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_RECAPTCHA_PRIVATE;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_RECAPTCHA_PUBLIC;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_PA_HOST_URL;
import static com.broadsoft.cgc.server.AppConstants.KEY_OVERLOADED_STATE;
import static com.broadsoft.cgc.server.AppConstants.RESOURCE_KEY_HTTP_MANAGER;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;

import com.broadsoft.cgc.server.loggers.ChannelLoggerUtil;
import com.broadsoft.http.HttpClientRequest;
import com.broadsoft.http.apache.ThreadsafeClientHttpManager;
import com.broadsoft.http.interfaces.IHttpClientResponse;
import com.broadsoft.xsp.BwCommunicationMgr;
import com.broadsoft.xsp.BwPrincipal;
import com.broadsoft.xsp.app.base.ChannelSeverity;
import com.broadsoft.xsp.app.base.IXSPAppContext;

public class ApplicationUtil {

	private static IXSPAppContext appContext = null;
	private static String boshUrlList;
	private static String provisioningURL;


	// private static LocalizationCache cacheLocal =
	// LocalizationCache.getInstance();
	public static IXSPAppContext getContext() {
		return appContext;
	}

	public static void setAppContext(IXSPAppContext context) {
		ApplicationUtil.appContext = context;
		boshUrlList = appContext.getResourceConfiguration().getConfiguration(
				CONFIG_KEY_GENERAL_BOSH_URL);
		provisioningURL = appContext
				.getResourceConfiguration().getConfiguration(
						CONFIG_KEY_PA_HOST_URL);
	}

	public static String getStackTrace(Throwable t) {
		StringWriter out = new StringWriter();
		t.printStackTrace(new PrintWriter(out));
		return out.toString();
	}
	
	
	public static boolean isCaptchaEnable() {
		return !Boolean.parseBoolean(appContext.getResourceConfiguration()
				.getConfiguration(
						CONFIG_KEY_GENERAL_DISABLE_CAPTCHA))
				&& ((Boolean)(appContext
						.getAttribute(KEY_OVERLOADED_STATE)))
				&& !isEmptyString((String) (appContext
						.getResourceConfiguration()
						.getConfiguration(CONFIG_KEY_GENERAL_RECAPTCHA_PUBLIC)))
				&& !isEmptyString((String) (appContext
						.getResourceConfiguration()
						.getConfiguration(CONFIG_KEY_GENERAL_RECAPTCHA_PRIVATE)));

	}
	

	public static String getProvisioningURL(String authUserId) {
		
		String usrProvisioningURL = "";
		StringBuilder stringBuffer = new StringBuilder();
		stringBuffer.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
		stringBuffer
				.append("<BroadsoftDocument protocol=\"OCI\" xmlns=\"C\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">");
		
		stringBuffer.append("<userId xmlns=\"\">" + authUserId + "</userId>");
		stringBuffer.append("<command xsi:type=\"UserMessagingServerGetRequest\" xmlns=\"\">");
		stringBuffer.append("<userId>" + authUserId + "</userId>");
		stringBuffer.append("</command>");
		stringBuffer.append("</BroadsoftDocument>");

		String UserMessagingServerGetRequest = stringBuffer.toString();

		
		
		BwCommunicationMgr bwMgr = ApplicationUtil.getContext()
				.getCommunicationManager();
		BwPrincipal principal = bwMgr.generatePrincipal(authUserId);
        if (ChannelLoggerUtil.isLogLevelActive(COLLABORATE_GUEST_CLIENT_CHANNEL, ChannelSeverity.DEV_DEBUG)) {
            ChannelLoggerUtil.getLogger().log(ChannelSeverity.DEV_DEBUG,
                    "ApplicationUtil:Send  UserMessagingServerGetRequest" + UserMessagingServerGetRequest + "\n");
        }
		
		String response = null;
		try {
			response = bwMgr
					.sendOCIPMessage(principal, stringBuffer.toString());
		} catch (Exception e) {
			ChannelLoggerUtil.getLogger().log(
					ChannelSeverity.WARN,
					"ApplicationUtil:Exception while executing UserMessagingServerGetRequest"
							+ ApplicationUtil.getStackTrace(e) + "\n");
		}
		if (response != null && response.contains("UserMessagingServerGetResponse")){
            if (ChannelLoggerUtil.isLogLevelActive(COLLABORATE_GUEST_CLIENT_CHANNEL, ChannelSeverity.DEV_DEBUG)) {
                ChannelLoggerUtil.getLogger().log(ChannelSeverity.DEV_DEBUG,
                        "ApplicationUtil:Received  UserMessagingServerGetResponse" + response + "\n");
            }
			usrProvisioningURL = getTagValue("provisioningURL", response);
		}else{
			ChannelLoggerUtil.getLogger().log(
					ChannelSeverity.WARN,
					"ApplicationUtil:Received  Invalid UserMessagingServerGetResponse" 
							+ response + "\n");
		}
		
		if(ApplicationUtil.isEmptyString(usrProvisioningURL)){
			usrProvisioningURL = ApplicationUtil.provisioningURL;
		}
		return usrProvisioningURL;
	}
	

	
	
    public static String getBoshURLs(String authUserId) {
        String usrBoshURLList = "";

        StringBuilder stringBuffer = new StringBuilder();
        stringBuffer.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        stringBuffer
                .append("<BroadsoftDocument protocol=\"OCI\" xmlns=\"C\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">");

        stringBuffer.append("<userId xmlns=\"\">" + authUserId + "</userId>");
        stringBuffer.append("<command xsi:type=\"UserIMPGetRequest\" xmlns=\"\">");
        stringBuffer.append("<userId>" + authUserId + "</userId>");
        stringBuffer.append("</command>");
        stringBuffer.append("</BroadsoftDocument>");
        String UserMessagingServerGetRequest = stringBuffer.toString();
        ArrayList<String> boshURLList = new ArrayList<String>();
        ArrayList<String> serviceNetAddressList = new ArrayList<String>();

        ArrayList<String> resolvedBoshURLList = new ArrayList<String>();

        if (!ApplicationUtil.isEmptyString(ApplicationUtil.boshUrlList)) {
            return ApplicationUtil.boshUrlList.trim();

        }

        ChannelLoggerUtil.getLogger().log(ChannelSeverity.INFO,
                "ApplicationUtil:BOSH URL not configured in the XSP CLI. Resolving BoshUrls BroadWorks \n");

        BwCommunicationMgr bwMgr = ApplicationUtil.getContext().getCommunicationManager();
        BwPrincipal principal = bwMgr.generatePrincipal(authUserId);
        
        if (ChannelLoggerUtil.isLogLevelActive(COLLABORATE_GUEST_CLIENT_CHANNEL, ChannelSeverity.DEV_DEBUG)) {
            ChannelLoggerUtil.getLogger().log(ChannelSeverity.DEV_DEBUG,
                    "ApplicationUtil:Send  UserIMPGetRequest" + UserMessagingServerGetRequest + "\n");
        }

        String response = null;
        
        try {
            response = bwMgr.sendOCIPMessage(principal, stringBuffer.toString());
        } catch (Exception e) {
            ChannelLoggerUtil.getLogger().log(
                    ChannelSeverity.WARN,
                    "ApplicationUtil:Exception while executing UserIMPGetRequest" + ApplicationUtil.getStackTrace(e)
                            + "\n");
        }

        if (response != null && response.contains("UserIMPGetResponse")) {
            if (ChannelLoggerUtil.isLogLevelActive(COLLABORATE_GUEST_CLIENT_CHANNEL, ChannelSeverity.DEV_DEBUG)) {
                ChannelLoggerUtil.getLogger().log(ChannelSeverity.DEV_DEBUG,
                        "ApplicationUtil:Received  UserIMPGetResponse" + response + "\n");
            }

            // extract the BoshUrl values from the response
            getTagValues(0, "boshURL", response, boshURLList);
            if (!boshURLList.isEmpty()) {
                
                //resolvedBoshURLList.addAll(boshURLList);
                /*
                 * it might happen that each entry in the boshURLList is a comma
                 * separated list of multiple BOSH URLs. In that case the
                 * individual token should be separated and populated in the
                 * list
                 */
                for(String strBoshURLs : boshURLList){
                    String [] boshURLs = strBoshURLs.split(",");
                    for(String boshURL : boshURLs){
                        if(boshURL != null && boshURL.trim().length()>0){
                            resolvedBoshURLList.add(boshURL);
                        }
                    }
                }
                
            }
            
            if (resolvedBoshURLList.isEmpty()) {
                ChannelLoggerUtil.getLogger().log(ChannelSeverity.INFO,
                        "ApplicationUtil:BOSH URL not configured in the Broadworks AS. Resolving BoshUrls from TXT Record lookup \n");

                // extract the domains in the serviceNetAddress from the
                // response
                getTagValues(0, "serviceNetAddress", response, serviceNetAddressList);

                for (String domain : serviceNetAddressList) {
                    List<String> xmpp_client_xbosh_Urls = DNSUtil.getInstance().getBoshUrlsFromTXTRecord(domain);
                    ChannelLoggerUtil.getLogger().log(ChannelSeverity.DEV_DEBUG,
                            "ApplicationUtil:Received  DNSUtil BoshUrlList " + xmpp_client_xbosh_Urls + "\n");
                    if (!xmpp_client_xbosh_Urls.isEmpty()) {

                        resolvedBoshURLList.addAll(xmpp_client_xbosh_Urls);

                    }
                }
            }

        } else {
            ChannelLoggerUtil.getLogger().log(ChannelSeverity.WARN,
                    "ApplicationUtil:Received  Invalid UserMessagingServerGetResponse" + response + "\n");
        }

        if (!resolvedBoshURLList.isEmpty()) {
            StringBuffer buff = new StringBuffer();
            for (String url : resolvedBoshURLList) {
                if (!ApplicationUtil.isEmptyString(url)) {
                    if (buff.length() > 0) {
                        buff.append(',');
                    }
                    buff.append(url);
                }
            }
            usrBoshURLList = buff.toString();
        }

        ChannelLoggerUtil.getLogger().log(ChannelSeverity.DEV_DEBUG,
                "ApplicationUtil:Received  valid BoshUrlList " + usrBoshURLList + "\n");
        return usrBoshURLList;
    }
	
	public static String getTagValue(String tag, String xml) {
		String value = "";
		String startTag = "<" + tag + ">";
		int startTagIndex = xml.indexOf(startTag);
		if (startTagIndex>=0) {
			int start = startTagIndex + startTag.length();
			String endTag = "</" + tag + ">";
			int end = xml.indexOf(endTag, start);
			if(end>=0){
				value = xml.substring(start, end);
			}
		}
		return value;
	}
	
	public static List<String> getTagValues(int startIndex, String tag, String xml, List<String> values) {
		
		String startTag = "<" + tag + ">";
		
		int startTagIndex = xml.indexOf(startTag, startIndex);
		if (startTagIndex>=0) {
			int start = startTagIndex + startTag.length();
			String endTag = "</" + tag + ">";
			int end = xml.indexOf(endTag, start);
			if(end>0){
				values.add(xml.substring(start, end));
				return getTagValues(end + endTag.length(),  tag,  xml,  values);
			}
			
		}
		return values;
	}
	
	public static IHttpClientResponse doExecute(HttpClientRequest httpClientRequest){
		ThreadsafeClientHttpManager threadsafeClientHttpManager = (ThreadsafeClientHttpManager) appContext
				.getAttribute(RESOURCE_KEY_HTTP_MANAGER);
		return threadsafeClientHttpManager.doExecute(httpClientRequest);		
	}
	


	public static boolean isEmptyString(String data) {
		return (data == null) || (data.trim().length()==0);
	}
	

}
