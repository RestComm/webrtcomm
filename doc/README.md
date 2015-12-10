WebRTCComm is a simple high level JavaScript WebRTC Framework for Web Developers to add Real Time Communications and IM Capabilities to any website.

WebRTCComm allows to create Real Time Video, Voice and Instant Messaging Web Applications that can connect together any WebRTC enabled Browser (Chrome, Firefox, ...), SIP enabled devices and legacy phones (Cell Phone, Desktop Phone)

It leverage under the covers the popular JAIN SIP JS (a full Javascript SIP Stack based on JAIN SIP) to interconnect with any SIP Over WebSockets Capable Server allowing to reach any SIP Endpoints or traditional Telecom infrastructure.


### How to use it

You gain access to WebRTComm facilities through WebRTCommClient object and get notified of various events through callbacks defined at WrtcEventListener. You implement these callbacks in an object conforming to WrtcEventListener interface and pass that object to WebRTCCommClient constructor. To register with RestComm you use WebRTCommClient:open() passing it various connection parameters. After that you are ready to make calls and receive messages.

To make a call you call WebRTCommClient:open() specifying the target contact as well as call configuration (whether it is an audio only call or audio & video)

To send a message you call WebRTCommClient:sendMessage()

For a simple example, please refer to samples/hello-world sample application
