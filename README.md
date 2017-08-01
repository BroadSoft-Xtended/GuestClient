# GuestClient
Open Source version of the Collaborate Guest Client


------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Downloading WebRTC Client used in Guest Client
------------------------------------------------------------------------------------------------------------------------------------------------------------------------
1. Download the WebRTC client code from "https://github.com/broadsoftxtended/webrtc" to download the source
2. Execute the following commands in order to compile the webrtc client for our development, <br>
        npm install -g grunt-cli <br>
        npm install && grunt <br>
3. Navigate to the webrtc/js folder and get the following files for webrtc client, <br>
        3rdparty.js <br>
        client-config.js <br>
        exsip.js <br>
        webrtc.js <br>
        
------------------------------------------------------------------------------------------------------------------------------------------------------------------------        
Build the war file
------------------------------------------------------------------------------------------------------------------------------------------------------------------------
1. The ant script is available under the build folder of the project .
2. The ant script consists of following configurations which are required to build a war, <br>
a) cgc.war.name - this configuration is for creating the war with the configured name <br>
b) cgc.version - this configuration is for configuring the version of the war build <br>
c) cgc.war.output - this configuration is for configuring the output folder in which the generated war will be placed after compilation. Output folder in the project is the default folder for this configuration <br>
3. Before compilation make sure that following jars are available as part of the in WEB-INF/lib folder, <br>
        BWCommunicationUtility.jar <br>
        servlet-api.jar <br>
4. For WAR creation, use the cgc.war from the ant script. This will generate the war and places it in the configured output folder.
