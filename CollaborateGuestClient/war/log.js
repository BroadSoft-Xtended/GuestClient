/* 
Copyright 2013, BroadSoft, Inc.

Licensed under the Apache License,Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "ASIS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
var LOGGER = LOGGER || {};

LOGGER.Severity = LOGGER.Severity || {NO_LOG:5,ERROR:4,WARNING:3,WARN:3,INFO:2,DEBUG:1, DEV_DEBUG:0};
LOGGER.Level = LOGGER.Severity.INFO;

LOGGER.API = ( function () {

	function isDebug(){
		return LOGGER.Level <= LOGGER.Severity.DEBUG; 
	}
	
	function isDevDebug(){
		return LOGGER.Level <= LOGGER.Severity.DEV_DEBUG; 
	}
	function isInfo(){
		return LOGGER.Level <= LOGGER.Severity.INFO; 
	}
	function log ( component, message, data, format) {
		if(isChrome()){
			if(!format){
				format = "color:black";
			}
			
			if ( data ) {
				console.log( getDate() + " " + component + " : %c" + message,format, data );
			} else {
				console.log( getDate() + " " + component + " : %c" + message, format );
			}
		}else{
				if ( data ) {
					console.log( getDate() + " " + component + " : " + message, data );
				} else {
					console.log( getDate() + " " + component + " :" + message );
				}
		}
		
		
	}
	
	function devDebug ( component, message, data ) {
		if(isDevDebug()){
			log( component, message, data, "color:orange;");
		}
	}
	function debug ( component, message, data ) {
		if(isDebug()){
		
			log( component, message, data, "color:green;font-weight:bold;");
		}
	}
	
	function info ( component, message, data ) {
		if(isInfo()){
			log( component, message, data,"color:blue;font-style: italic;font-weight:bold;");
		}
	}
	
	function warn ( component, message, data ) {
		if(LOGGER.Level > LOGGER.Severity.WARN){
			return;
		}
		
		log( component, message, data,"color:yellow;font-style: italic; background-color: blue;padding: 2px");
	}

	function error ( component, message, data ) {
		if(LOGGER.Level > LOGGER.Severity.ERROR){
			return;
		}
		
		log( component, message, data,"color:red;font-style: italic; background-color: yellow;padding: 2px");
	}
	function getDate () {
		var now = new Date();
		var year = now.getFullYear();
		var month = now.getMonth() + 1;
		var day = now.getDate();
		var hour = now.getHours();
		var minute = now.getMinutes();
		var second = now.getSeconds();
		if ( month.toString().length == 1 ) {
			month = '0' + month;
		}
		if ( day.toString().length == 1 ) {
			day = '0' + day;
		}
		if ( hour.toString().length == 1 ) {
			hour = '0' + hour;
		}
		if ( minute.toString().length == 1 ) {
			minute = '0' + minute;
		}
		if ( second.toString().length == 1 ) {
			second = '0' + second;
		}
		var dateTime = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
		return dateTime;
	}

	return {
		isDevDebug:isDevDebug,
		isDebug:isDebug,
		isInfo:isInfo,
		log : log,
		devDebug:devDebug,
		debug:debug,
		info:info,
		warn:warn,
		error : error
		
		
		
	};

} )();

