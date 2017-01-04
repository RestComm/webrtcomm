#! /bin/sh -x

#rm -R build
#mkdir build
rm -f build/*.js

cat ./src/WebRTComm/PrivateJainSipMessageConnector.js > ./build/WebRTComm.debug.js
cat ./src/WebRTComm/PrivateJainSipCallConnector.js >> ./build/WebRTComm.debug.js
cat ./src/WebRTComm/PrivateJainSipClientConnector.js  >> ./build/WebRTComm.debug.js
cat ./src/WebRTComm/WebRTCommCall.js  >> ./build/WebRTComm.debug.js
cat ./src/WebRTComm/WebRTCommMessage.js  >> ./build/WebRTComm.debug.js
cat ./src/WebRTComm/WebRTCommClient.js  >> ./build/WebRTComm.debug.js
cat ./src/WebRTComm/WebRTCommClientEventListenerInterface.js  >> ./build/WebRTComm.debug.js
cat ./src/WebRTComm/WebRTCommCallEventListenerInterface.js  >> ./build/WebRTComm.debug.js
cat ./src/WebRTComm/WebRTCommMessageEventListenerInterface.js  >> ./build/WebRTComm.debug.js

# Let's leave debug logging around until we reach GA
cat ./build/WebRTComm.debug.js  >  ./build/WebRTComm.js

# TODO: add this when we reach GA: remove debug and warn console logs for release
#grep -v "console\.\(debug\|warn\)" ./build/WebRTComm.debug.js  >  ./build/WebRTComm.js

java -jar yuicompressor-2.4.7.jar  ./build/WebRTComm.js -o ./build/WebRTComm.min.js
