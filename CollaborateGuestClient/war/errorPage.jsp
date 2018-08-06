<!DOCTYPE html>
<%@page contentType="text/html; charset=utf-8"%>
<%@page import="com.broadsoft.cgc.util.ApplicationUtil"%>
<%@page import="com.broadsoft.cgc.i18n.I18nManager"%>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%!
String browserLang = null;
boolean isCaptchaEnabled = false;
String pageTitle = "Guest Client";
String version = "0";
String unsupportedBrowser = "";
String supportedBrowserList = "";
String leaderRoomTitle = "";
String invalidUrl = "";
%>
<%
browserLang = (String)request.getHeader("Accept-Language");

if(browserLang !=null && !browserLang.isEmpty()){
	browserLang = browserLang.split(",")[0];
	pageTitle = I18nManager.getI18nManager().getKeyValue(browserLang,"cgc.label.app.title");
	unsupportedBrowser = I18nManager.getI18nManager().getKeyValue(browserLang,"cgc.error.unsupported.browser");
	supportedBrowserList = I18nManager.getI18nManager().getKeyValue(browserLang,"cgc.info.supported.browserlist");
	leaderRoomTitle = I18nManager.getI18nManager().getKeyValue(browserLang,"cgc.label.room.title").replace("''", "'");
	invalidUrl = I18nManager.getI18nManager().getKeyValue(browserLang,"cgc.error.loginpage.url.invalid");
	if(ApplicationUtil.isEmptyString(pageTitle)){
		pageTitle = "Guest Client";
	}
}
if(ApplicationUtil.getContext().getManifestAttribute("Cache_Version") != null){
	version = ApplicationUtil.getContext().getManifestAttribute("Cache_Version");
}
%>

<html class="enyo-document-fit">
<head>
<meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible">
<link href="branding/assets/favicon.ico" rel="shortcut icon">
<meta content="no-cache" http-equiv="Pragma">
<meta content="no-cache" http-equiv="Cache-Control">
<meta content="Sat, 01 Dec 2001 00:00:00 GMT" http-equiv="Expires">
<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
<meta content="yes" name="apple-mobile-web-app-capable">
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport">
<meta content="telephone=no" name="format-detection">

<script src="https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js" type="text/javascript"></script>
<script src="jquery-1.6.4.js" type="text/javascript"></script>
<script src="util.js" type="text/javascript"></script>
<script charset="utf-8" src="spin.min.js"></script>

<link type="text/css" rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto">
<link rel="stylesheet" href="cgc/clientbuild/enyo.css?build=<%=version%>">
<link rel="stylesheet" href="cgc/clientbuild/app.css?build=<%=version%>">
<link href="branding/assets/custom.css?build=20160421111959" type="text/css" rel="stylesheet"/>

<title><%=pageTitle%></title>
</head>
<body class="enyo-body-fit webkitOverflowScrolling" style="overflow: hidden; width: 100%; height: 100%;font-family: 'Roboto' !important; background-color: #FFFFFF;">
<div id="collaborateGuestClient_viewControl" class="enyo-fittable-rows-layout cgcViewControl enyo-fit enyo-clip enyo-no-touch-action enyo-stretch">
<div id="collaborateGuestClient_viewControl_statusPage" class="enyo-fittable-rows-layout cgcstatusPageText enyo-stretch" style="height: 355px;">
<div id="com.broadsoft.cgc.joinPageHeader" class="cgcJoinPageHeader"></div>
<div id="collaborateGuestClient_viewControl_statusPage_fittableColumns" class="enyo-fittable-columns-layout enyo-stretch" style="text-align: center;">
<div id="collaborateGuestClient_viewControl_statusPage_control" class="cgcJoinPageOuterBox">
<img id="com.broadsoft.cgc.joinPageLogo" class="cgcJoinPageLogo" src="branding/assets/applogo.png">
<div id="collaborateGuestClient_viewControl_statusPage_logoSeperatorDIV" class="cgcLogoSeperator"></div>
<div id="collaborateGuestClient_viewControl_statusPage_control2">
<div id="com.broadsoft.cgc.WaitForLeaderAcceptanceBox">
<div id="com.broadsoft.cgc.WaitForLeaderAcceptanceBox_LoginHeader" class="cgcLoginHeader"></div>
<div id="com.broadsoft.cgc.WaitForLeaderAcceptanceBox_control" class="cgcLoginOuterBox">
<div id="com.broadsoft.cgc.WaitForLeaderAcceptanceBox_progressImage" class="cgcApploadingimgBox" style="display: none;"></div>
<div id="com.broadsoft.cgc.WaitForLeaderAcceptanceBox_statusMessageBox" class="cgcStatusMessageBox cgcBrowserSupportErrorPanel" style="display: inline-block;"></div>
<div id="com.broadsoft.cgc.WaitForLeaderAcceptanceBox_statusProgressInfoMessageBox" class="cgcStatusProgressInfoMessageBox"></div>
<div id="com.broadsoft.cgc.WaitForLeaderAcceptanceBox_statusProgressWarningMessageBox" class="cgcStatusUnSupportedBrowerMessageBox">
<%=supportedBrowserList%>
</div>
</div>
</div>
</div>
</div>

</div>
</div>
</div>
<script  type="text/javascript">
var unsupportedBrowserVersion = "<%=unsupportedBrowser%>";
$(".cgcBrowserSupportErrorPanel").html(unsupportedBrowserVersion.replace("{0}", browserName+" v."+fullVersion));

var urlPathArray = window.location.pathname.split('/');
var query = window.location.search.substring(1);
var value = query.indexOf("=");
var param = query.slice(value + 1);
if ($.trim(param).length != 0) {
	var data = decodeURIComponent(escape(B64.decode(param)));
	var profileData = data.split(',');
	if (profileData.length == 4) {
		var tempString = "<%=leaderRoomTitle%>"
		var leaderName = tempString.replace("{0}",profileData[0]);
		$('.cgcLoginHeader').html(leaderName);
		document.title = leaderName;
	} 
} 
</script>
</body>
</html>