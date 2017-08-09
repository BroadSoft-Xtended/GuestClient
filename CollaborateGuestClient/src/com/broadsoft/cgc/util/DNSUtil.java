/*
 * BroadWorks
 * Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */
 
package com.broadsoft.cgc.util;


import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;

import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.Attributes;
import javax.naming.directory.InitialDirContext;

import com.broadsoft.cgc.server.loggers.ChannelLoggerUtil;
import com.broadsoft.xsp.app.base.ChannelSeverity;

public final class DNSUtil {
	
	private static DNSUtil instance = new DNSUtil();
	private InitialDirContext initialContext;
	private static String _XMPP_CLIENT_XBOSH = "_xmpp-client-xbosh";
	private static String _XMPPCONNECT = "_xmppconnect.";
	private static String RECORD_TYPE_TXT = "TXT";
	private static String LOG_COMPONENT_NAME = DNSUtil.class.getName();

	private DNSUtil() {
		Hashtable<String, String> environment = new Hashtable<String, String>();
		environment.put("java.naming.factory.initial",
				"com.sun.jndi.dns.DnsContextFactory");
		environment.put("java.naming.provider.url", "dns:");
		try {
			initialContext = new InitialDirContext(environment);
		} catch (NamingException namEx) {
			ChannelLoggerUtil.getLogger().log(
					ChannelSeverity.WARN,
					LOG_COMPONENT_NAME,
					"Error while Initializing JNDI for BOSH Lookup "+namEx.toString());
		}catch (Exception ex) {
			ChannelLoggerUtil.getLogger().log(
					ChannelSeverity.WARN,
					LOG_COMPONENT_NAME,
					"Error while Initializing JNDI for BOSH Lookup "+ex.toString());
		}
	}

	public static DNSUtil getInstance() {
		return instance;
	}
	

	@SuppressWarnings("rawtypes")
	public List<String> getBoshUrlsFromTXTRecord(String domain) {
		ChannelLoggerUtil.getLogger().log(ChannelSeverity.DEV_DEBUG,
				LOG_COMPONENT_NAME,
				"Performing DNS TXT record lookup for " + domain);
		ArrayList<String> boshEndpoints = new ArrayList<String>();
		if (initialContext != null) {
			try {
				synchronized (initialContext) {
					Attributes attributes = initialContext.getAttributes(
							_XMPPCONNECT + domain,
							new String[] { RECORD_TYPE_TXT });
					NamingEnumeration all = attributes.get(RECORD_TYPE_TXT)
							.getAll();
					while (all.hasMoreElements()) {
						String nextElement = (String) all.nextElement();
						if (nextElement != null
								&& nextElement.startsWith(_XMPP_CLIENT_XBOSH)) {
							ChannelLoggerUtil.getLogger().log(
									ChannelSeverity.DEV_DEBUG,
									LOG_COMPONENT_NAME,
									"Found " + _XMPP_CLIENT_XBOSH + " record: "
											+ nextElement);	
							String [] endpoint = nextElement.split("=", 2);
							if(endpoint.length==2){
								//After split around = Retrieve the second token after _xmpp-client-xbosh
								boshEndpoints.add(endpoint[1].trim());
							}
						}
					}
				}
			} catch (NamingException namEx) {
				ChannelLoggerUtil.getLogger().log(
						ChannelSeverity.WARN,
						LOG_COMPONENT_NAME,
						"Error while DNS lookup for BOSH "+namEx.toString());
			}catch(Exception ex){
				ChannelLoggerUtil.getLogger().log(
						ChannelSeverity.WARN,
						LOG_COMPONENT_NAME,
						"Error while DNS lookup for BOSH "+ex.toString());

			}
		}
		return boshEndpoints;
	}
}