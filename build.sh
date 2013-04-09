#! /bin/sh -x

rm -R build
mkdir build

cat ./src/WebRTComm/PrivateJainSipCallConnector.js > ./build/WebRTComm.debug.js
cat ./src/WebRTComm/PrivateJainSipClientConnector.js  >> ./build/WebRTComm.debug.js
cat ./src/WebRTComm/WebRTCommCall.js  >> ./build/WebRTComm.debug.js
cat ./src/WebRTComm/WebRTCommClient.js  >> ./build/WebRTComm.debug.js
cat ./src/WebRTComm/WebRTCommClientEventListenerInterface.js  >> ./build/WebRTComm.debug.js
cat ./src/WebRTComm/WebRTCommCallEventListenerInterface.js  >> ./build/WebRTComm.debug.js
grep -v "logger.debug" ./build/WebRTComm.debug.js  >  ./build/WebRTComm.js
java -jar yuicompressor-2.4.7.jar  ./build/WebRTComm.js -o ./build/WebRTComm.min.js
