/**
 * @class WebRTCommCallEventListenerInterface
 * @classdesc Abstract class describing  WebRTCommClient event listener interface 
 *            required to be implented by the webapp 
 * @constructor
 * @public
 */
WebRTCommCallEventListenerInterface = function() {};

/**
 * Open event
 * @public
 * @param {WebRTCommCall} webRTCommCall source WebRTCommCall object
 */
WebRTCommCallEventListenerInterface.prototype.onWebRTCommCallOpenedEvent = function(webRTCommCall) {
	throw "WebRTCommCallEventListenerInterface:onWebRTCommCallOpenedEvent(): not implemented;";
};


/**
 * In progress event 
 * @public
 * @param {WebRTCommCall} webRTCommCall source WebRTCommCall object
 */
WebRTCommCallEventListenerInterface.prototype.onWebRTCommCallInProgressEvent = function(webRTCommCall) {
	throw "WebRTCommCallEventListenerInterface:onWebRTCommCallInProgressEvent(): not implemented;";
};

/**
 * Open error  event
 * @public
 * @param {WebRTCommCall} webRTCommCall source WebRTCommCall object
 * @param {String} error error message
 */
WebRTCommCallEventListenerInterface.prototype.onWebRTCommCallOpenErrorEvent = function(webRTCommCall, error) {
	throw "WebRTCommCallEventListenerInterface:onWebRTCommCallOpenErrorEvent(): not implemented;";
};

/**
 * Call error event
 * @public
 * @param {WebRTCommCall} webRTCommCall source WebRTCommCall object
 * @param {String} error error message
 */
WebRTCommCallEventListenerInterface.prototype.onWebRTCommCallErrorEvent = function(webRTCommCall, error) {
	throw "WebRTCommCallEventListenerInterface:onWebRTCommCallErrorEvent(): not implemented;";
};

/**
 * Ringing event
 * @public
 * @param {WebRTCommCall} webRTCommCall source WebRTCommCall object. Interesting webRTCommCall members are 'callerPhoneNumber', like '+30210...' , 'callerDisplayName', like 'bob', 'customHeaders' which is a dictonary holding any custom SIP headers, like: { "X-RestComm-ApiVersion": "2012-04-24", "X-RestComm-AccountSid": "ACae6e420f425248d6a26948c17a9e2acf", "X-RestComm-CallSid": "CAe90d9084e282493799612f2e9a586c24" }
 */
WebRTCommCallEventListenerInterface.prototype.onWebRTCommCallRingingEvent = function(webRTCommCall) {
	throw "WebRTCommCallEventListenerInterface:onWebRTCommCallRingingEvent(): not implemented;";
};

/**
 * Ringback event
 * @public
 * @param {WebRTCommCall} webRTCommCall source WebRTCommCall object
 */
WebRTCommCallEventListenerInterface.prototype.onWebRTCommCallRingingBackEvent = function(webRTCommCall) {
	throw "WebRTCommCallEventListenerInterface:onWebRTCommCallRingingBackEvent(): not implemented;";
};

/**
 * Hangup event
 * @public
 * @param {WebRTCommCall} webRTCommCall source WebRTCommCall object
 */
WebRTCommCallEventListenerInterface.prototype.onWebRTCommCallHangupEvent = function(webRTCommCall) {
	throw "WebRTCommCallEventListenerInterface:onWebRTCommCallHangupEvent(): not implemented;";
};

/**
 * Webrtc stats event
 * @public
 * @param {WebRTCommCall} webRTCommCall source WebRTCommCall object
 * @param {stats} stats for the Webrtc call
 */
WebRTCommCallEventListenerInterface.prototype.onWebRTCommCallStatsEvent = function(webRTCommCall, stats) {
	throw "WebRTCommCallEventListenerInterface:onWebRTCommCallStatsEvent(): not implemented;";
};

/**
 * Incoming call Cancel event
 * @public
 * @param {WebRTCommCall} webRTCommCall source WebRTCommCall object
 */
WebRTCommCallEventListenerInterface.prototype.onWebRTCommCallCanceledEvent = function(webRTCommCall) {
	throw "WebRTCommCallEventListenerInterface:onWebRTCommCallCanceledEvent(): not implemented;";
};