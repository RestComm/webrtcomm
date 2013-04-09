rmdir /S /Q build
mkdir build

copy /b .\src\WebRTComm\PrivateJainSipCallConnector.js .\build\WebRTComm.debug.js
copy /b .\build\WebRTComm.debug.js+.\src\WebRTComm\PrivateJainSipClientConnector.js   .\build\WebRTComm.debug.js
copy /b .\build\WebRTComm.debug.js+.\src\WebRTComm\WebRTCommCall.js   .\build\WebRTComm.debug.js
copy /b .\build\WebRTComm.debug.js+.\src\WebRTComm\WebRTCommClient.js   .\build\WebRTComm.debug.js
copy /b .\build\WebRTComm.debug.js+.\src\WebRTComm\WebRTCommClientEventListenerInterface.js   .\build\WebRTComm.debug.js
copy /b .\build\WebRTComm.debug.js+.\src\WebRTComm\WebRTCommCallEventListenerInterface.js   .\build\WebRTComm.debug.js
more .\build\WebRTComm.debug.js | find /v "logger.debug"   >  .\build\WebRTComm.js
%JAVA_HOME%\bin\java -jar yuicompressor-2.4.7.jar  .\build\WebRTComm.js -o .\build\WebRTComm.min.js

