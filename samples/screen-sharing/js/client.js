var aliceButton = document.getElementById("aliceButton");
var bobButton = document.getElementById("bobButton");
var chooseUserForm = document.getElementById("chooseUserForm");
var helloJumbo = document.getElementById("helloJumbo");
var helloJumboUser = document.getElementById("helloJumboUser");
var helloJumboMessage = document.getElementById("helloJumboMessage");
var helloJumboButton = document.getElementById("helloJumboButton");
var screenVideo = document.getElementById("screenVideo");
var extDownloadHref = document.getElementById("extDownloadHref");

var screenStream;
var wrtcClient;
var wrtcEventListener = undefined;
var inCall = false;
var currentUser;
aliceButton.onclick = showAlicePage;
bobButton.onclick = showBobPage;

$(document).ready(function() {
	extDownloadHref.href = location.protocol + "//" + location.host  + location.pathname + "screen-sharing-extension.crx";
});

function showAlicePage() {
	showPageOf("alice");
}

function showBobPage() {
	showPageOf("bob");
}

function showPageOf(user) {
	currentUser = user;
	connectToRestcomm();
}

function fillJumboForSharing() {
	helloJumboUser.innerHTML = helloJumboUserHTML(false);
	helloJumboMessage.innerHTML = "Now you can share your screen with " + (currentUser == "alice" ? "Bob" : "Alice") + ". Let's go!";
	helloJumboButton.innerHTML = "Share screen";
	helloJumboButton.onclick = startSharing;
}

function connectToRestcomm() {
	var wrtcConfiguration = {
		communicationMode: WebRTCommClient.prototype.SIP,
		sip: {
			sipUserAgent: 'TelScale RTM Olympus/1.0.0',
			sipRegisterMode: true,
			sipOutboundProxy: 'wss://localhost:5063', // CHANGEME: setup your restcomm instance domain/ip and port
			sipDomain: 'localhost', // CHANGEME: setup your restcomm instance domain/ip
			sipDisplayName: currentUser,
			sipUserName: currentUser,
			sipLogin: currentUser,
			sipPassword: '1234',
		},
		RTCPeerConnection: {
			iceServers: undefined,
			stunServer: 'stun.l.google.com:19302',
			turnServer: undefined,
			turnLogin: undefined,
			turnPassword: undefined,
		}
	};
	wrtcEventListener = new WrtcEventListener();
	wrtcClient = new WebRTCommClient(wrtcEventListener);
	wrtcClient.open(wrtcConfiguration);
	getUserMedia({
		audio: true,
		video: true
	}, onGetInitialStream, function (error) {
		trace("getUserMedia error: ", error);
	});
}

function onGetInitialStream(stream) {
	screenStream = stream;
	prepareInitJumbo();
}

function prepareInitJumbo() {
	chooseUserForm.style.display = 'none';
	helloJumbo.style.display = 'block';
	fillJumboForSharing();
}

function startSharing() {
	var constraints = {
			video: {
				mandatory: {
					chromeMediaSource: 'desktop',
					maxWidth: 1920,
					maxHeight: 1080,
					maxFrameRate: 10,
					minAspectRatio: 1.77,
				}
			}
		};
	getScreenStream(constraints, true, function(stream) {
		screenStream = stream;
		makeScreenSharingCall();
	});
}

// extract to lib
function getScreenStream(constraints, needAudio, onScreenStream) {
	var onGotScreenStream  = function(screenStream) {
		// We need to get audio stream separately to send it with screen stream
		// http://stackoverflow.com/a/20063211
		if (needAudio) {
			getUserMedia({
				audio: true
			}, function (audioStream) {
				screenStream.addTrack(audioStream.getAudioTracks()[0]);
				onScreenStream(screenStream);
			}, function (error) {
				trace("getUserMedia Audio Stream error: ", error);
				onScreenStream(screenStream);
			});		
		} else {
			onScreenStream(screenStream);
		}
	}
	
	var extensionMessageHandler = function (msg) {
		var sourceId = msg.data.sourceId;
		if (sourceId) {
			constraints.video.mandatory.chromeMediaSourceId = sourceId;
			getUserMedia(constraints, onGotScreenStream, function (error) {
				trace("getUserMedia Screen Stream error: ", error);
			});
		}
	}
	

	window.addEventListener("message", function (msg) {
		return extensionMessageHandler(msg)
	});
	
	window.postMessage("get-sourceId", "*")
}

function makeScreenSharingCall() {
	var calleeContact = (currentUser == "alice" ? "bob" : "alice");
	currentCall = wrtcClient.call(calleeContact, getCallConfiguration());
	inCall = true;
	fillSharedJumbo();
}

function fillSharedJumbo() {
	helloJumboUser.innerHTML = helloJumboUserHTML(true);
	helloJumboMessage.innerHTML = "Now " + (currentUser == "alice" ? "Bob" : "Alice") + " can see your screen";
	helloJumboButton.innerHTML = "Stop sharing";
	helloJumboButton.onclick = hangup;
}

function hangup() {
	if (inCall) {
		currentCall.close();
		inCall = false;
	}
}

function getCallConfiguration() {
	var calleeContact = (currentUser == "alice" ? "bob" : "alice");
	var callConfiguration = {
		displayName: calleeContact,
		localMediaStream: screenStream,
		audioMediaFlag: true,
		videoMediaFlag: true,
		messageMediaFlag: false,
		audioCodecsFilter: '',
		videoCodecsFilter: ''
	};
	return callConfiguration;
}

function helloJumboUserHTML(isConnected) {
	return "Hello, " + (currentUser == "alice" ? "Alice" : "Bob") + "! <span class='label " + (isConnected ? "label-success'>Connected" : "label-default'>Disconnected") + "<\/span>";
}
WrtcEventListener = function () {
	trace("WrtcEventListener constructor");
};
WrtcEventListener.prototype.onWebRTCommCallRingingEvent = function (webRTCommCall) {
	trace("WrtcEventListener::onWebRTCommCallRingingEvent");
	webRTCommCall.accept(getCallConfiguration());
	currentCall = webRTCommCall;
};
WrtcEventListener.prototype.onWebRTCommCallRingingBackEvent = function (webRTCommCall) {
	trace("WrtcEventListener::onWebRTCommCallRingingBackEvent");
	currentCall = webRTCommCall;
};
WrtcEventListener.prototype.onWebRTCommCallClosedEvent = function (webRTCommCall) {
	trace("WrtcEventListener::onWebRTCommCallClosedEvent");
	screenStream.getTracks().forEach(track => track.stop())
	screenVideo.src = undefined;
	fillJumboForSharing();
};
WrtcEventListener.prototype.onWebRTCommCallOpenedEvent = function (webRTCommCall) {
	trace("WrtcEventListener::onWebRTCommCallOpenedEvent: received remote stream");
	screenVideo.src = URL.createObjectURL(webRTCommCall.getRemoteBundledAudioVideoMediaStream() || webRTCommCall.getRemoteVideoMediaStream() || webRTCommCall.getRemoteAudioMediaStream());
};
WrtcEventListener.prototype.onWebRTCommCallHangupEvent = function (webRTCommCall) {
	trace("WrtcEventListener::onWebRTCommCallHangupEvent");
	currentCall = undefined;
};

function trace(text) {
	console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}
