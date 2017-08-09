/*
 * BroadWorks
 * Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

package com.broadsoft.cgc.i18n;

import static com.broadsoft.cgc.server.AppConstants.COLLABORATE_GUEST_CLIENT_CHANNEL;
import static com.broadsoft.cgc.server.AppConstants.CONFIG_KEY_INTERNAL_DEV_MODE;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FilenameFilter;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.concurrent.ConcurrentHashMap;

import com.broadsoft.cgc.server.AppConstants;
import com.broadsoft.cgc.server.loggers.ChannelLoggerUtil;
import com.broadsoft.cgc.util.ApplicationUtil;
import com.broadsoft.xsp.app.base.ChannelSeverity;
import com.broadsoft.xsp.app.base.IXSPAppContext;
import com.broadsoft.xsp.app.base.XSPAppConstants;

public class I18nManager {

	private static final String DEFAULT_FILE_BASE_NAME = "CollaborateGuestClientMessages";
	private static final String DEFAULT_FILE_NAME = "CollaborateGuestClientMessages.properties";

	private ConcurrentHashMap<String, LanguageFile> resourceBundle = new ConcurrentHashMap<String, LanguageFile>();
	private static String CUSTOM_LOCALIZATION_RESOURCE_PATH;
	private static String DEFAULT_LOCALIZATION_RESOURCE_PATH;

	static volatile I18nManager i18nManager = null;

	// this is called during the application's deployment and initialization
	public static void init(IXSPAppContext appContext) {
		i18nManager = new I18nManager(appContext);
		ChannelLoggerUtil.getLogger().log(ChannelSeverity.INFO,
				I18nManager.class.getName(),
				"I18nManager has been initiated successfully");
	}

	// this is called when the application is undeployed.
	
	public static void destroy() {
		if (i18nManager != null) {
			i18nManager.resourceBundle.clear();
			i18nManager = null;
		}
	}

	public static I18nManager getI18nManager() {

		if (i18nManager == null) {
			throw new IllegalStateException(
					"I18nManager not initiated proeprly");
		}

		return i18nManager;
	}

	private I18nManager(IXSPAppContext appContext) {
		CUSTOM_LOCALIZATION_RESOURCE_PATH = appContext
				.getResourceConfiguration().getConfiguration(
						AppConstants.CONFIG_KEY_GENERAL_CUSTOM_RESOURCE_PATH)
				+ File.separator + "localization";
        if (ChannelLoggerUtil.isLogLevelActive(COLLABORATE_GUEST_CLIENT_CHANNEL, ChannelSeverity.DEV_DEBUG)) {
            ChannelLoggerUtil.getLogger().log(ChannelSeverity.DEV_DEBUG, I18nManager.class.getName(),
                    "Localization custom resource path is configured as " + CUSTOM_LOCALIZATION_RESOURCE_PATH);
        }
		DEFAULT_LOCALIZATION_RESOURCE_PATH = File.separator
				+ "var"
				+ File.separator
				+ "broadworks"
				+ File.separator
				+ "webapps"
				+ File.separator
				+ "conf"
				+ File.separator
				+ appContext.getAttribute(XSPAppConstants.KEY_APP_DISPLAY_NAME)
				+ "_"
				+ (String) appContext
						.getAttribute(XSPAppConstants.KEY_APP_VERSION);
        if (ChannelLoggerUtil.isLogLevelActive(COLLABORATE_GUEST_CLIENT_CHANNEL, ChannelSeverity.DEV_DEBUG)) {
            ChannelLoggerUtil.getLogger().log(
                    ChannelSeverity.DEV_DEBUG,
                    I18nManager.class.getName(),
                    "Localization default resource path is configured as " + DEFAULT_LOCALIZATION_RESOURCE_PATH
                            + ". \nInitiaing the default localization");
        }

	}

	public InputStream getInputStream(String strFileName) {
		strFileName = strFileName.replaceAll("-", "_");
		strFileName = strFileName.substring(0, strFileName.indexOf(".properties"));
		
		if(strFileName.split("_").length == 3) {
			String[] fileNameComponents = strFileName.split("_");
			fileNameComponents[1] = fileNameComponents[1].toLowerCase();
			fileNameComponents[2] = fileNameComponents[2].toUpperCase();
			if(fileNameComponents[2].equals("HA")) {
				fileNameComponents[2] = "CN"; // This is to handle Windows 10, where the locale passed for Simplified Chinese is zh-ha whereas in other cases it is zh-cn 
			}
			strFileName = fileNameComponents[0]+"_"+fileNameComponents[1]+"_"+fileNameComponents[2]+".properties" ;
		}
        if (ChannelLoggerUtil.isLogLevelActive(COLLABORATE_GUEST_CLIENT_CHANNEL, ChannelSeverity.DEV_DEBUG)) {
            ChannelLoggerUtil.getLogger().log(ChannelSeverity.DEV_DEBUG, I18nManager.class.getName(),
                    "Retrieve the input stream for " + strFileName);
        }

		// get the language file if already loaded
		LanguageFile langFile = resourceBundle.get(strFileName);

		if (langFile == null) {
			// if it here then the language file is still not loaded
			langFile = LanguageFile.loadFile(strFileName);
			if (langFile != null) {
				resourceBundle.put(strFileName, langFile);

			} else {
				
				// Logic added to handle different locales sent from IE and Chrome for Spanish (CALA). es-419 from Chrome and es-BO, es-AR etc from IE
				if (strFileName.startsWith(DEFAULT_FILE_BASE_NAME + "_es")
						&& (!strFileName.startsWith(DEFAULT_FILE_BASE_NAME + "_es_ES") && !strFileName.startsWith(DEFAULT_FILE_BASE_NAME + "_es_US"))) {

					strFileName = DEFAULT_FILE_NAME + "_es_CA.properties";
					langFile = LanguageFile.loadFile(strFileName);

					ChannelLoggerUtil.getLogger().log(
							ChannelSeverity.NOTICE,
							I18nManager.class.getName(),
							"Trying to load the " + strFileName
									+ " file as fallback option");
					
					if (langFile != null) {
						resourceBundle.put(strFileName, langFile);
					}
				} 
				
				if (langFile == null) {
					ChannelLoggerUtil
					.getLogger()
					.log(ChannelSeverity.NOTICE,
							I18nManager.class.getName(),
							strFileName
									+ " not found in the custom or default directory. So return the input stream for defaulf language "
									+ DEFAULT_FILE_NAME);
					
					langFile = resourceBundle.get(DEFAULT_FILE_NAME);
					if (langFile == null) {
						langFile = LanguageFile.loadFile(DEFAULT_FILE_NAME);
						if (langFile != null) {
							resourceBundle.put(DEFAULT_FILE_NAME, langFile);
						}
					}
				}

			}

		}
		if(langFile == null){
			return null;
		}
		return langFile.getLocaleInputStream();

	}

	public String getKeyValue(String locale, String key) {
		
		locale = locale.replaceAll("-", "_");
		if(locale.split("_").length == 2) {
			String[] localeComponents = locale.split("_");
			localeComponents[0] = localeComponents[0].toLowerCase();
			localeComponents[1] = localeComponents[1].toUpperCase();
			locale = localeComponents[0] + "_" + localeComponents[1];
		} else if(locale.split("_").length == 3) {
			// This is to handle the locale passed for Simplified Chinese from Windows 10 which is zh_Hans_Ha whereas in other cases it is like en_US
			String[] localeComponents = locale.split("_");
			localeComponents[0] = localeComponents[0].toLowerCase();
			localeComponents[2] = localeComponents[2].toUpperCase();
			locale = localeComponents[0] + "_" + localeComponents[2];
		}
		
		String strFileName = DEFAULT_FILE_BASE_NAME + "_"
				+ locale + ".properties";
        if (ChannelLoggerUtil.isLogLevelActive(COLLABORATE_GUEST_CLIENT_CHANNEL, ChannelSeverity.DEV_DEBUG)) {
            ChannelLoggerUtil.getLogger().log(ChannelSeverity.DEV_DEBUG, I18nManager.class.getName(),
                    "Retrieve the value for " + key + " for the locale " + locale);
        }
		LanguageFile langFile = resourceBundle.get(strFileName);

		if (langFile == null) {
			// if it here then the language file is still not loaded
			langFile = LanguageFile.loadFile(strFileName);
			if (langFile != null) {
				resourceBundle.put(strFileName, langFile);

			} else {
				
				// Logic added to handle different locales sent from IE and Chrome for Spanish (CALA). es-419 from Chrome and es-BO, es-AR etc from IE
				if (locale.startsWith("es")
						&& (!locale.equals("es_ES") && !locale.equals("es_US"))) {

					locale = "es_CA";
					strFileName = DEFAULT_FILE_BASE_NAME + "_" + locale
							+ ".properties";
					
					ChannelLoggerUtil.getLogger().log(
							ChannelSeverity.NOTICE,
							I18nManager.class.getName(),
							"Trying to load the " + strFileName
									+ " file as fallback option");
					langFile = LanguageFile.loadFile(strFileName);

					if (langFile != null) {
						resourceBundle.put(strFileName, langFile);
					}
				} 
				
				if (langFile == null) {

					ChannelLoggerUtil.getLogger().log(
							ChannelSeverity.NOTICE,
							I18nManager.class.getName(),
							strFileName + " Language file not found for " + locale
									+ ". So retrieveing the value of " + key
									+ " from the default language "
									+ DEFAULT_FILE_NAME);
					
					langFile = resourceBundle.get(DEFAULT_FILE_NAME);
					if (langFile == null) {
						langFile = LanguageFile.loadFile(DEFAULT_FILE_NAME);
						resourceBundle.put(DEFAULT_FILE_NAME, langFile);
					}
				}

			}

		}

		// replace all "'" with two "''" and "\" with "\\".
		if(langFile != null){
			return langFile.getLocalValue(key);
		}else{
			return null;
		}

	}

	/**
	 * This represents a particular language file.
	 * 
	 * Logic to read and retrieve a particular language file is encapsulated in
	 * this file.
	 * 
	 * @author kdey
	 * 
	 */
	private static class LanguageFile {

		private File filePath;
		private String fileName;
		private String fileContent = null;
		Long lastUpdateTimeStamp = 0l;
		/**
		 * Load and return the language file
		 * 
		 * @param strFileName
		 * @return
		 */
		static LanguageFile loadFile(String strFileName) {


            File filePath = null;
            IXSPAppContext appContext = ApplicationUtil.getContext();
                // it is checking the strFileName is available in Custom directory path
                if ((filePath = isAvailableAtCustomResourePath(strFileName)) != null) {
                    return new LanguageFile(filePath);
    
                } else {
                    boolean isDevelopmentMode = appContext.getResourceConfiguration().getBooleanOption(
                          CONFIG_KEY_INTERNAL_DEV_MODE, false);
                    // it is checking the devmode or not
                    if (isDevelopmentMode) {
                        try {
                            //URL fileURL = ((XSPBaseAppContext)ApplicationUtil.getContext()).getServletContext().getResource("/WEB-INF/customDir/"+strFileName);
//                          if(fileURL != null){
//                                File file = new File(fileName);
//                                return new LanguageFile(file);
//                            }
                            String classpath  = I18nManager.class.getClassLoader().getResource("").toString();
                            String localFilePath = classpath.substring(0, classpath.indexOf("/WEB-INF")+8) + "/customDir/"+strFileName;
                            if(localFilePath != null){
                                File file = new File(localFilePath.substring(6));
                                if(file.exists()){
                                return new LanguageFile(file);
                                }
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                            if(strFileName.split("_").length==3){
                                ChannelLoggerUtil.getLogger().log(ChannelSeverity.NOTICE, I18nManager.class.getName(),
                                        "Could not read language file " + strFileName);
                            }
                        }
						// it is checking the strFileName is available in BW Extract directory path
					}else if ((filePath = isAvailableAtDefaultPath(strFileName)) != null) {
							return new LanguageFile(filePath);
	
					}else{
						// if it is not available localization file without country code in BWExtract and Custom Directory we have fetch the matching 
						// file of same localization with country code, which is first in list file.
						filePath =  getMatchingFileFromDir(DEFAULT_LOCALIZATION_RESOURCE_PATH,strFileName );
						if(filePath == null){
							filePath = getMatchingFileFromDir(CUSTOM_LOCALIZATION_RESOURCE_PATH,strFileName );
						}
						if(filePath != null){
							return new LanguageFile(filePath);
						}
					}
			}
			return null;
		}

		LanguageFile(File file) {
			this.filePath = file;
			this.fileName = file.getName();

			if (file.exists()) {
				// just load the file
				reLoadFile();
			}

		}

		private void reLoadFile() {
			this.fileName = filePath.getName();
			StringBuilder localValue = new StringBuilder();
			try {

				BufferedReader in = new BufferedReader(new InputStreamReader(
						new FileInputStream(filePath), "UTF8"));

				String str;

				while ((str = in.readLine()) != null) {
					// replace all "'" with two "''" and "\" with "\\".
					localValue.append(str.replaceAll("'", "''").replaceAll(
							"\\\\", "\\\\\\\\")
							+ "\n");
				}

				in.close();
			} catch (Exception e) {
				ChannelLoggerUtil.getLogger().log(
						ChannelSeverity.WARN,
						I18nManager.class.getName(),
						" Exception while loading/reloading the Language file for  "
								+ filePath.getAbsolutePath() + ":\n"
								+ ApplicationUtil.getStackTrace(e));

			}
			fileContent = localValue.toString();

			if (filePath.getAbsolutePath().startsWith(
					CUSTOM_LOCALIZATION_RESOURCE_PATH)) {
				// update the time stamp only if read from the custom path
				lastUpdateTimeStamp = filePath.lastModified();
			} else {
				lastUpdateTimeStamp = 0l;
			}

		}

		public InputStream getLocaleInputStream() {
			File file = null;
			if (filePath.exists()) {
				// if the previous load is from custom path, check for any
				// update with the language file and reload, if required
				if (filePath.getAbsolutePath().startsWith(
						CUSTOM_LOCALIZATION_RESOURCE_PATH)) {

					if (filePath.lastModified() > lastUpdateTimeStamp) {
						ChannelLoggerUtil
								.getLogger()
								.log(ChannelSeverity.DEV_DEBUG,
										I18nManager.class.getName(),
										this.fileName
												+ " has been updated since last load. Reloading the the Language file from "
												+ filePath.getAbsolutePath());
						reLoadFile();
					}
				} else if ((file = isAvailableAtCustomResourePath(fileName)) != null) {
					// if the previous load is from default path, check for any
					// update with the language file and reload, if required
					ChannelLoggerUtil
							.getLogger()
							.log(ChannelSeverity.DEV_DEBUG,
									I18nManager.class.getName(),
									this.fileName
											+ this.fileName
											+ "has been provided through custom folder. Reloading the the Language file from "
											+ filePath.getAbsolutePath());

					filePath = file;
					reLoadFile();
				}
			} else {
				if ((file = isAvailableAtCustomResourePath(fileName)) != null) {
					file = isAvailableAtDefaultPath(fileName);

				}
				if (file != null) {
					filePath = file;
					reLoadFile();
				}
			}
			InputStream in = new ByteArrayInputStream(
					fileContent.getBytes(Charset.forName("UTF-8")));

			return in;
		}

		public String getLocalValue(String key) {
			int index = fileContent.indexOf(key);
			StringBuilder value = new StringBuilder();
			for (int i = index + key.length() + 1;; i++) {
				char ch = fileContent.charAt(i);
				if (ch == '\n' || ch == '\r') {
					break;
				}
				value.append(ch);
			}

			return value.toString();
		}
		
		

		/**
		 * This returns File if the file is available at the custom resource
		 * path or null.
		 * 
		 * @param strFileName
		 * @return
		 */
		private static File isAvailableAtCustomResourePath(final String strFileName) {
			String customResourcePath = CUSTOM_LOCALIZATION_RESOURCE_PATH
					+ File.separator + strFileName;
			
			File file = new File(customResourcePath);
			
			if( file.exists() ){
				return file;
			} else{
				return null;
			}
			
		}

		/**
		 * This returns File if the file is available at the default path else
		 * null.
		 * 
		 * @param strFileName
		 * @return
		 */
		private static File isAvailableAtDefaultPath(final String strFileName) {
			String customResourcePath = DEFAULT_LOCALIZATION_RESOURCE_PATH
					+ File.separator + strFileName;
			File file = new File(customResourcePath);

			
			
			if( file.exists() ){
				return file;
			} else {
				return null;
				
			}
			
		}
		
		private static File getMatchingFileFromDir(String strDir, final String strFileName){
			File langDir = new File(strDir);
			final String fileToSrch = strFileName.replace(".properties",
					"");
			File[] files = langDir.listFiles(new FilenameFilter() {

				@Override
				public boolean accept(File dir, String name) {
					System.out.println("fileToSrch: "+fileToSrch+" -- name: "+name);
					if (name.startsWith(fileToSrch)) {
						return true;
					}
					return false;
				}
			});
			
			return (files != null && files.length > 0)? files[0]:null;
		}

	}
}
