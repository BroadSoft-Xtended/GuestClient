/*
 * BroadWorks
 * Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

package com.broadsoft.cgc.server;

import static com.broadsoft.cgc.server.AppConstants.COLLABORATE_GUEST_CLIENT_CHANNEL;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_RECAPTCHA_PRIVATE;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_GENERAL_RECAPTCHA_PUBLIC;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_PA_HOST_ADMIN;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_PA_HOST_ADMIN_PASSWORD;
import static com.broadsoft.cgc.server.AppConstants.KEY_REQUEST_IS_CAPTCHA_ENABLED;
import static com.broadsoft.xsp.app.base.XSPAppConstants.KEY_RESOURCE_XSP_APP_CONTEXT;

import java.io.IOException;
import java.util.UUID;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import net.tanesha.recaptcha.ReCaptchaImpl;
import net.tanesha.recaptcha.ReCaptchaResponse;

import com.broadsoft.cgc.server.loggers.ChannelLoggerUtil;
import com.broadsoft.cgc.util.ApplicationUtil;
import com.broadsoft.http.HttpClientRequest;
import com.broadsoft.http.interfaces.IHttpClientResponse;
import com.broadsoft.http.interfaces.IHttpConstants;
import com.broadsoft.xsp.app.base.ChannelSeverity;
import com.broadsoft.xsp.app.base.IXSPAppContext;

public class PAServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private static final String RECAPTCHA_VALIDATION_URL = "http://www.google.com/recaptcha/api/js/recaptcha_ajax.js";
	private static final String GUEST_PROVISIONING_RESOURECE_PATH = "/userservice/impguest";
	private static final String INVALID_CAPTCHA = "cgc.error.captcha.response.failed";
	private static final String GUEST_CREATION_ERROR = "cgc.error.pa.provision";
	private IXSPAppContext appContext = null;

	@Override
	public void init(ServletConfig config) throws ServletException {
		super.init(config);
		this.appContext = (IXSPAppContext) config.getServletContext()
				.getAttribute(KEY_RESOURCE_XSP_APP_CONTEXT);

        if (ChannelLoggerUtil.isLogLevelActive(COLLABORATE_GUEST_CLIENT_CHANNEL, ChannelSeverity.DEV_DEBUG)) {
            ChannelLoggerUtil.getLogger().log(ChannelSeverity.DEV_DEBUG, "PAServlet successfully initialized");
        }
	}

	protected void doPost(HttpServletRequest req, HttpServletResponse response)
			throws ServletException, IOException {
		String leaderBWUserId = req.getParameter("leaderBWUserId");
		String firstName = req.getParameter("impFirstName");
		String lastName = req.getParameter("impLastName");
		String password = UUID.randomUUID().toString();
		String impMucHash = req.getParameter("impMucHash");
		String impMucSeed = req.getParameter("impMucSeed");
		String challenge = req.getParameter("challenge");
		String answered = req.getParameter("answered");
		ReCaptchaImpl reCaptcha = new ReCaptchaImpl();
		String remoteAddr = req.getRemoteAddr();

		if (ChannelLoggerUtil.isLogLevelActive(
				COLLABORATE_GUEST_CLIENT_CHANNEL,
				ChannelSeverity.DEV_DEBUG)) {
			ChannelLoggerUtil.getLogger().log(
					ChannelSeverity.DEV_DEBUG,
					"Request received for provisioning a new guest client  : "
							+ "[firstName=" + firstName + ", lastName="
							+ lastName + ", impMucHash=" + impMucHash
							+ ", impMucSeed=" + impMucSeed + "]");
		}

		HttpSession session = req.getSession(false);
		if (session == null) {
			String json = getJSONResponse("", "", "", "", "", "", "", "",
					"", "");
			
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().write(json);
			response.getWriter().flush();
			response.getWriter().close();
			return;
		}
		boolean isCaptchaEnabled = ((Boolean) session
				.getAttribute(KEY_REQUEST_IS_CAPTCHA_ENABLED)).booleanValue();
		
		/*
		 * By default, isCaptchValidated is set to pass (i.e. true), so that in
		 * case captcha validation is not required for this guest request or the
		 * Google recaptcha URL is not accessible or throws any exception, then
		 * also it allows the guest creation.
		 */
		boolean isCaptchValidated = true;
		
		
		/*
		 * 
		 * if captcha authentication is enabled but guest has not provided a
		 * reCaptcha response (i.e. answered) then it might be case where
		 * ReCaptcha site is not available.
		 * 
		 * The following validation is done to check if the ReCaptcha site is up
		 * or not. If not then reCaptcha verification will be skipped in the
		 * next step.
		 */
		if (isCaptchaEnabled && ApplicationUtil.isEmptyString(answered)) {
			try {

				HttpClientRequest httpClientRequest = new HttpClientRequest(
						RECAPTCHA_VALIDATION_URL);

				httpClientRequest.setMethod(IHttpConstants.METHOD_HEAD);				
				IHttpClientResponse httpResponse = ApplicationUtil.doExecute(httpClientRequest);
				// answered is empty string. hence it is not required to validate the 
				// reCaptcha answerd
				isCaptchaEnabled = false;
				if (httpResponse.getStatusCode() >= 200 && httpResponse.getStatusCode() < 400) {
					
					

					// no need to go for captcha validation now, since guest has
					// not provided the reCaptcha response though the site is
					// up.
					
					isCaptchValidated = false;
				}
			} catch (Exception e) {
				ChannelLoggerUtil
						.getLogger()
						.log(ChannelSeverity.NOTICE,
								"Skiping Captcha validation for the guest. ReCaptcha site is not accessable ");

			}
		}
		/*
		 * By default, isCaptchValidated is set to pass (i.e. true), so that in
		 * case captcha validation is not required for this guest request or the
		 * Google recaptcha URL is not accessible or throws any exception, then
		 * also it allows the guest creation.
		 * 
		 * Only if the validation is successfully made and it is false, then we
		 * challenge the guest with a new reCaptcha image
		 */
		
		if (isCaptchaEnabled) {
			try {
				String privateKey = appContext
						.getResourceConfiguration()
						.getConfiguration(
								CONFIG_KEY_GENERAL_RECAPTCHA_PRIVATE);
				String publicKey = appContext
						.getResourceConfiguration()
						.getConfiguration(
								CONFIG_KEY_GENERAL_RECAPTCHA_PUBLIC);
				if(!privateKey.trim().isEmpty() && !publicKey.trim().isEmpty()){
					reCaptcha.setPrivateKey(privateKey);
					ReCaptchaResponse reCaptchaResponse = reCaptcha.checkAnswer(
							remoteAddr, challenge, answered);
					
					isCaptchValidated = reCaptchaResponse.isValid();
                    if (ChannelLoggerUtil.isLogLevelActive(COLLABORATE_GUEST_CLIENT_CHANNEL, ChannelSeverity.DEV_DEBUG)) {
                        ChannelLoggerUtil.getLogger().log(
                                ChannelSeverity.DEV_DEBUG,
                                "Validation with ReCaptcha for remoteAddr " + remoteAddr + " has passed "
                                        + reCaptchaResponse.isValid() + " " + reCaptchaResponse.getErrorMessage());
                    }
					
				}
			} catch (Exception e) {

				ChannelLoggerUtil.getLogger().log(
						ChannelSeverity.NOTICE,
						RECAPTCHA_VALIDATION_URL
								+ " is not accessible for validation "
								+ ApplicationUtil.getStackTrace(e));
			}
		}

		String json = null;
		if (isCaptchValidated) {

			json = provisionGuestClient(leaderBWUserId, firstName, lastName, password,
					impMucHash, impMucSeed);

			if (ChannelLoggerUtil.isLogLevelActive(
					COLLABORATE_GUEST_CLIENT_CHANNEL,
					ChannelSeverity.DEV_DEBUG)) {
				ChannelLoggerUtil.getLogger().log(
						ChannelSeverity.DEV_DEBUG,
						"Response received for new guest client provisioning request for : "
								+ firstName + " " + lastName + "is json["
								+ json + "]");
			}
			
			session
			.setAttribute(KEY_REQUEST_IS_CAPTCHA_ENABLED,Boolean.FALSE);
		} else {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			json = getJSONResponse("", "", "", "", "", "", "", "", "",
					INVALID_CAPTCHA);

		}
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		
		
		response.getWriter().write(json);
		response.getWriter().flush();
		response.getWriter().close();
	}

	private String provisionGuestClient(String bwUserId, String firstName, String lastName,
			String password, String seed, String root) {
		
		String ret = null;
		
		String usrProvisioningURL = ApplicationUtil.getProvisioningURL(bwUserId);

		
		
		if(ApplicationUtil.isEmptyString(usrProvisioningURL)){
			// invalid response
			ret = getJSONResponse("", "", "", "", "", "", "", "", "", "");
			
			ChannelLoggerUtil.getLogger().log(
					ChannelSeverity.WARN,
					"Failed to provisiong guest. Provisioning URL is not configured for the application and the user ");

			return ret;
		}else{
			ChannelLoggerUtil.getLogger().log(
					ChannelSeverity.DEV_DEBUG,
					"The provisionig URL to be used for provisioning the user " +firstName + " " + lastName + " is " + usrProvisioningURL);

		}
		
		//TIII-54124 - Guest Client support for UCaaS - provisioningUrl update
		String provisionGuest = usrProvisioningURL + GUEST_PROVISIONING_RESOURECE_PATH;
		
		HttpClientRequest httpClientRequest = new HttpClientRequest(provisionGuest);

		httpClientRequest.setMethod(IHttpConstants.METHOD_POST);
		httpClientRequest.setAllowLogging(true);
		httpClientRequest.setAuthUserName(appContext.getResourceConfiguration()
				.getConfiguration(CONFIG_KEY_PA_HOST_ADMIN));
		httpClientRequest.setAuthUserPassword(appContext
				.getResourceConfiguration().getConfiguration(
						CONFIG_KEY_PA_HOST_ADMIN_PASSWORD));		
		
		//httpClientRequest.setResourcePath(resourcePath + GUEST_PROVISIONING_RESOURECE_PATH);

		String httpBody = getRequestBodyContent(firstName, lastName, password,
				seed, root);
		httpClientRequest.setBody(httpBody);

		IHttpClientResponse response = ApplicationUtil.doExecute(httpClientRequest);

		if (response.getStatusCode() == 200) {
			String content = response.getContent();
			String impId = ApplicationUtil.getTagValue("b:impId", content);
			String impMucName = ApplicationUtil.getTagValue("b:impMucName", content);
			String impOwnerId = ApplicationUtil.getTagValue("b:impOwnerId", content);
			String bworksUserId = ApplicationUtil.getTagValue("bwOwnerId: ", content);
			String domain = ApplicationUtil.getTagValue("b:domain", content);

			//Fetch the BOSH after successful provisioning of Guest 
			String usrBoshURLList = ApplicationUtil.getBoshURLs(bwUserId);
	        if(ApplicationUtil.isEmptyString(usrBoshURLList)){
                
                DeleteGuestServlet.deleteGuest(impId, usrProvisioningURL, appContext.getResourceConfiguration()
                                .getConfiguration(AppConstants.CONFIG_KEY_PA_HOST_ADMIN), appContext
                                .getResourceConfiguration().getConfiguration(
                                        AppConstants.CONFIG_KEY_PA_HOST_ADMIN_PASSWORD));
                
	            ret = getJSONResponse("", "", "", "", "", "", "", "", "", "");

	            ChannelLoggerUtil.getLogger().log(
	                    ChannelSeverity.WARN,
	                    "Failed to provisiong guest. Bosh URLs are not configured for the application and the user ");
	            

	            return ret;
	        }else{
	            ChannelLoggerUtil.getLogger().log(
	                    ChannelSeverity.DEV_DEBUG,
	                    "The BOSH URL to be used by the user " +firstName + " " + lastName + " is " + usrBoshURLList);

	        }
			
			ret = getJSONResponse(impId, password, impMucName, firstName,
					lastName, impOwnerId, bworksUserId, domain, usrBoshURLList, "");

			if (ChannelLoggerUtil.isLogLevelActive(
					COLLABORATE_GUEST_CLIENT_CHANNEL,
					ChannelSeverity.DEV_DEBUG)) {
				ChannelLoggerUtil.getLogger().log(
						ChannelSeverity.DEV_DEBUG,
						"Http Response from Provisioning Adapter : "
								+ response.getStatusLine() + "\n"
								+ response.getContent());
			}

		} else {
			// invalid response
			ret = getJSONResponse("", "", "", "", "", "", "", "", "", GUEST_CREATION_ERROR);

			ChannelLoggerUtil.getLogger().log(
					ChannelSeverity.WARN,
					"Failed to provisiong guest. Http Response from Provisioning Adapter : "
							+ response.getStatusLine() + "\n"
							+ response.getContent());
		}

		return ret;
	}

	private String getRequestBodyContent(String firstName, String lastName,
			String password, String impMucHash, String impMucSeed) {
		StringBuffer stringBuffer = new StringBuffer();
		System.out.println("firstName::: "+firstName);
		stringBuffer.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
		stringBuffer
				.append("<b:impGuestSubscriberProfile xmlns:b=\"http://broadsoft.com/schemas/BroadCloudOSS\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">");
		stringBuffer.append("<b:impFirstName>").append(firstName)
				.append("</b:impFirstName>");
		stringBuffer.append("<b:impLastName>").append(lastName)
				.append("</b:impLastName>");
		stringBuffer.append("<b:impPassword>").append(password)
				.append("</b:impPassword>");
		stringBuffer.append("<b:impMucHash>").append(impMucHash)
				.append("</b:impMucHash>");
		stringBuffer.append("<b:impMucSeed>").append(impMucSeed)
				.append("</b:impMucSeed>");
		stringBuffer.append("</b:impGuestSubscriberProfile>");
		return stringBuffer.toString();
	}

	private String getJSONResponse(String impId, String password,
			String impMucName, String firstName, String lastName,
			String impOwnerId, String bworksUserId, String domain,
			String boshURLs, String error) {

		StringBuilder jsonBuilder = new StringBuilder();

		jsonBuilder.append("{\"loginId\":\"").append(impId)
				.append("\",\"password\":\"").append(password)
				.append("\",\"room\":\"").append(impMucName)
				.append("\",\"firstName\":\"").append(firstName)
				.append("\",\"lastName\":\"").append(lastName)
				.append("\",\"ownerId\":\"").append(impOwnerId)
				.append("\",\"hostUserId\":\"").append(bworksUserId)
				.append("\",\"domain\":\"").append(domain)
				.append("\",\"boshUrl\":\"").append(boshURLs)
				.append("\",\"error\":\"").append(error)
				.append("\"}");

		return jsonBuilder.toString();
	}


}
