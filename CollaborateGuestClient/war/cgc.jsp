<!DOCTYPE html>
<%@page import="com.broadsoft.xsp.app.base.IXSPAppContext"%>
<%@page import="com.broadsoft.xsp.app.base.XSPAppConstants"%>
<%@page import="com.broadsoft.cgc.server.AppConstants"%>
<%@page import="com.broadsoft.cgc.util.ApplicationUtil"%>
<%@page import="com.broadsoft.cgc.i18n.I18nManager"%>
<%@page import="com.broadsoft.cgc.util.ApplicationUtil"%>

<%!
	IXSPAppContext appContext = null;
	String browserLang = null;
	boolean isCaptchaEnabled = false;
	String pageTitle = "Guest Client";
	String version = "0";
	String warVersion = "0";
%>
<%
	long timeStamp = System.currentTimeMillis();
	/** The below session goes to invalidate and create session for each refresh the jsp page. 
	    Due to avoid the invalid session 
	**/
	session.invalidate();
	session = request.getSession();
	
	appContext = (IXSPAppContext) config.getServletContext().getAttribute(XSPAppConstants.KEY_RESOURCE_XSP_APP_CONTEXT);
	browserLang = (String)request.getHeader("Accept-Language");
	isCaptchaEnabled = ApplicationUtil.isCaptchaEnable();
	warVersion = ApplicationUtil.getContext().getManifestAttribute("Version");
	session.setAttribute(AppConstants.KEY_REQUEST_IS_CAPTCHA_ENABLED, new Boolean(isCaptchaEnabled));
	
	if(browserLang !=null && !browserLang.isEmpty()){
		browserLang = browserLang.split(",")[0];
		pageTitle = I18nManager.getI18nManager().getKeyValue(browserLang,"cgc.label.app.title");
		if(ApplicationUtil.isEmptyString(pageTitle)){
			pageTitle = "Guest Client";
		}
	}
	if(ApplicationUtil.getContext().getManifestAttribute("Cache_Version") != null){
		version = ApplicationUtil.getContext().getManifestAttribute("Cache_Version");
	}
	
	HttpServletResponse httpResponse = (HttpServletResponse) response;
	httpResponse.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1
	httpResponse.setHeader("Pragma", "no-cache"); // HTTP 1.0
	httpResponse.setDateHeader("Expires", 0); // Proxies.
%>
<html>
	<head>
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
		<link rel="shortcut icon" href="branding/assets/favicon.ico?ts=<%=timeStamp %>" />
		

		<meta http-equiv="Pragma" content="no-cache"/>
 		<meta http-equiv="Cache-Control" content="no-cache"/>
 		<meta http-equiv="Expires" content="0"/>
 		<meta http-equiv="expires" content="0"/>
 		
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
		<meta name="apple-mobile-web-app-capable" content="yes"/>
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
		<meta name="format-detection" content="telephone=no"/>
		
		<!-- css -->
		<link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Roboto+Condensed|Roboto:300i,400,500'/>
		<link rel='stylesheet' type='text/css' href='cgc/clientbuild/enyo.css?build=<%=version%>' />
		<link rel='stylesheet' type='text/css' href='cgc/clientbuild/app.css?build=<%=version%>' />
		<link rel='stylesheet' type='text/css' href='branding/assets/custom.css?ts=<%=timeStamp%>' />
		
		<script type="text/javascript" src="jquery-1.6.4.js"></script>
		<script type="text/javascript" src="log.js?build=<%=version%>"  ></script>
        <script type="text/javascript" src="util.js?build=<%=version%>"  type="text/javascript"></script>
		<%if(isCaptchaEnabled){%>
			<script type="text/javascript" src="https://www.google.com/recaptcha/api/js/recaptcha_ajax.js"></script>
		<%}%>
		
		<script>
		
		window.ts=<%=timeStamp%>;
					
			var preLoadImgs = ["audio.svg","browser.svg",
			              "down-arrow.png","end.svg","exitfullscreen.png",
			              "exitfullscreen_h.png","exitfullscreen_p.png",
			              "fullscreen.png","fullscreen_h.png","fullscreen_p.png",
			              "mute.svg","mute_a.svg","self-view_h.svg",
			              "self-view_i.svg","self-view_p.svg","share.svg",
			              "share_a.svg","up-arrow.png","video.svg","video_a.svg"];
			for( var i = 0; i < preLoadImgs.length; i++ ) {
			    new Image().src = "./branding/assets/" + preLoadImgs[i] + "?ts=" + window.ts;
			}
			
			window.cgcProfile = {};
			window.cgcComponent = {};
			window.cgcConfig = {};
			window.ClientConfig = {};
			
			window.cgcConfig.ServiceAPIs = {
  				paServletUrl: "<%= response.encodeURL("./PAServlet")%>",
  				callMeNowServletUrl: "<%=response.encodeURL("./CallMeServlet")%>",
  				deleteGuestServlet : "<%=response.encodeURL("./DeleteGuestServlet")%>"
			}
		    
			window.cgcConfig.build = "<%=version%>";
				
			window.cgcConfig.wrsAddressList = "<%=appContext.getResourceConfiguration().getConfiguration(
				AppConstants.CONFIG_KEY_WRS_ADDRESS_LIST)%>";
			window.cgcConfig.wrsDomainTo = "<%=appContext.getResourceConfiguration().getConfiguration(
					AppConstants.CONFIG_KEY_WRS_DOMAIN_TO)%>";
			window.cgcConfig.wrsDomainFrom = "<%=appContext.getResourceConfiguration().getConfiguration(
					AppConstants.CONFIG_KEY_WRS_DOMAIN_FROM)%>";
			window.cgcConfig.wsStunServer = "<%=appContext.getResourceConfiguration().getConfiguration(
					AppConstants.CONFIG_KEY_WRS_STUN_SERVER)%>";
			window.cgcConfig.wsStunPort = "<%=appContext.getResourceConfiguration().getIntegerOption(
					AppConstants.CONFIG_KEY_WRS_STUN_PORT, 19302)%>";
			window.cgcConfig.enableCaptcha = "<%=isCaptchaEnabled%>";
			window.cgcConfig.reCaptchaPublicKey = "<%=appContext.getResourceConfiguration().getConfiguration(
					AppConstants.CONFIG_KEY_GENERAL_RECAPTCHA_PUBLIC)%>";

			window.cgcConfig.leaderAcceptanceTimeOutInSeconds = <%=appContext.getResourceConfiguration().getConfiguration(
				AppConstants.CONFIG_KEY_GENERAL_LEADER_ACCEPTANCE_TIMEOUT)%>;
				
			window.cgcConfig.callMeNowEnabled =	<%=appContext.getResourceConfiguration().getConfiguration(
					AppConstants.CONFIG_KEY_GENERAL_ENABLE_CALLMENOW)%>;
			window.cgcConfig.browserLang = "<%=browserLang%>";
			window.cgcConfig.webRTCEnabled = <%=appContext.getResourceConfiguration().getConfiguration(
					AppConstants.CONFIG_KEY_GENERAL_ENABLE_WEBRTC)%>;
			window.cgcConfig.webRTCVideoEnabled = <%=appContext.getResourceConfiguration().getConfiguration(
					AppConstants.CONFIG_KEY_GENERAL_ENABLE_WEBRTCVIDEO)%>;
			window.cgcConfig.videoResolution = "<%=appContext.getResourceConfiguration().getConfiguration(
		                    AppConstants.CONFIG_KEY_GENERAL_WEBRTCVIDEO_RESOLUTION)%>";
			window.cgcConfig.enableSendingConfIdAsSipUriHeader = <%=appContext.getResourceConfiguration().getConfiguration(
					AppConstants.CONFIG_KEY_GENERAL_SEND_CONFID_AS_SIP_URI_HEADER_ENABLED)%>;					
		
		    window.cgcConfig.desktopShareExtId = "<%=appContext.getResourceConfiguration().getConfiguration(
					AppConstants.CONFIG_KEY_CHROME_EXTENSION_ID)%>";
			
			window.cgcConfig.warVersion = "<%=warVersion%>";
			

			function load() {
				


				ClientConfig.domainTo = window.cgcConfig.wrsDomainTo;
				ClientConfig.domainFrom = window.cgcConfig.wrsDomainFrom;
				ClientConfig.stunServer = window.cgcConfig.wsStunServer;
				ClientConfig.stunPort = window.cgcConfig.wsStunPort;

				ClientConfig.websocketsServers = [];
				var wsAddressListArray = window.cgcConfig.wrsAddressList
						.split(",");
				for (count = 0; count < wsAddressListArray.length; count++) {
					var new_obj = {
						'ws_uri' : wsAddressListArray[count]
					};
					ClientConfig.websocketsServers.push(new_obj);
				}

				window.wsURLCount = wsAddressListArray.length;

				// Prefetching DTMF tone files to avoid delay
				if (isChrome() && window.cgcConfig.webRTCEnabled && window.location.protocol.indexOf('https') !== -1) {
						for (i = 0; i <= 9; i++) {
							$("body").append("<audio><source src='media/dtmf-" + i + ".ogg'></audio>");
						}
						$("body").append("<audio><source src='media/dtmf-star.ogg'></audio>");
						$("body").append("<audio><source src='media/dtmf-pound.ogg'></audio>");
				}
			}
		
			window.addEventListener("dragover",function(e){
  				e = e || event;
  				e.preventDefault();
			},false);
			window.addEventListener("drop",function(e){
  				e = e || event;
  				e.preventDefault();
				},false);
		</script>
		

		<!-- js -->
		
		
		<script src='cgc/clientbuild/enyo.js?build=<%=version%>' charset='utf-8'></script>
		<script src='cgc/clientbuild/app.js?build=<%=version%>' charset='utf-8'></script>
		
        <script src="spin.min.js" charset="utf-8"></script>
		<title><%=pageTitle%></title>
		
	</head>
	<!-- disable right click of mouse -- >
	<!-- oncontextmenu="return false;" -->
	<body onload="load()"  
	style="overflow: hidden; width: 100%; height: 100%;font-family: 'Roboto', -apple-system, Arial, Helvetica, sans-serif !important;  background-color: #FFFFFF;" >
	   
	    
	</body>
</html>

