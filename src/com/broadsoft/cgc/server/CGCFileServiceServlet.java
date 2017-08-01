/*
 * BroadWorks
 * Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

package com.broadsoft.cgc.server;

import static com.broadsoft.cgc.server.AppConstants.COLLABORATE_GUEST_CLIENT_CHANNEL;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_CUSTOM_RESOURCE_PATH;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.nio.charset.Charset;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.broadsoft.cgc.i18n.I18nManager;
import com.broadsoft.cgc.server.loggers.ChannelLoggerUtil;
import com.broadsoft.xsp.app.base.ChannelSeverity;
import com.broadsoft.xsp.app.server.XSPFileServiceServlet;

public class CGCFileServiceServlet extends XSPFileServiceServlet {

	
	private static final long serialVersionUID = 1L;

	public CGCFileServiceServlet() {
		super();
	}

	protected String getFullyQualifiedFileName(HttpServletRequest req,
			HttpServletResponse resp) {

		
		String filePath = null;
		if (req.getRequestURL().toString().contains("/branding/")) {
			String fileName = req.getRequestURL().substring(
					req.getRequestURL().lastIndexOf("/") + 1);

			// first look at the custom resource path
			filePath = getCustomResourcePath(req, fileName);

			File file = new File(filePath);
			if (!file.exists()) {
				// look at the default path
				filePath = WEB_RESOURCE_PREFIX + File.separator + "cgc" + File.separator + "assets"
						+ File.separator + fileName;

			}


		} else if (req.getRequestURL().toString().contains("properties")) {
			// verify the language file format. it has to be with language code
			filePath = super.getFullyQualifiedFileName(req, resp);	
		} else {
			filePath = super.getFullyQualifiedFileName(req, resp);

		}
        if (ChannelLoggerUtil.isLogLevelActive(COLLABORATE_GUEST_CLIENT_CHANNEL, ChannelSeverity.DEV_DEBUG)) {
            ChannelLoggerUtil.getLogger().log(ChannelSeverity.DEV_DEBUG, CGCFileServiceServlet.class.getName(),
                    "Resource to be fetched from " + filePath);
        }

		return filePath;
	}

	protected InputStream getFileInputStream(HttpServletRequest req,
			HttpServletResponse resp, String filePath) throws Exception {
		InputStream in = null;

		if (filePath.endsWith("properties")) {

				String fileName = req.getRequestURL().substring(
						req.getRequestURL().lastIndexOf("/") + 1);
				in = I18nManager.getI18nManager().getInputStream(fileName);
				//EV241137 Avoiding 404 error
				if(in == null){
					in = new ByteArrayInputStream(
							"".getBytes(Charset.forName("UTF-8")));
				}
				

		} else {
			in = super.getFileInputStream(req, resp, filePath);
		}

		return in;
	}

	private String getCustomResourcePath(HttpServletRequest req, String fileName) {
		String customResourcePath = null;
		customResourcePath = appContext.getResourceConfiguration()
				.getConfiguration(
						CONFIG_KEY_GENERAL_CUSTOM_RESOURCE_PATH);
		if (customResourcePath != null
				&& customResourcePath.trim().length() != 0) {
			if (fileName.endsWith("gif") || fileName.endsWith("jpeg")
					|| fileName.endsWith("png") || fileName.endsWith("bmp")
					|| fileName.endsWith("icon") || fileName.endsWith("ico")
					|| fileName.endsWith("svg")) {
				customResourcePath = customResourcePath + File.separator
						+ "images" + File.separator + fileName;
				System.out.println(customResourcePath);
			} else if (fileName.endsWith("css")) {
				customResourcePath = customResourcePath + File.separator
						+ "css" + File.separator + fileName;
			} else {
				customResourcePath = customResourcePath + File.separator
						+ fileName;
			}
            if (ChannelLoggerUtil.isLogLevelActive(COLLABORATE_GUEST_CLIENT_CHANNEL, ChannelSeverity.DEV_DEBUG)) {
                ChannelLoggerUtil.getLogger().log(ChannelSeverity.DEV_DEBUG, CGCFileServiceServlet.class.getName(),
                        fileName + "is to be fetched from " + customResourcePath);
            }

		}
		
		return customResourcePath;
	}

}
