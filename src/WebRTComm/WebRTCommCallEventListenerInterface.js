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
 * Open error  event
 * @public
 * @param {WebRTCommCall} webRTCommCall source WebRTCommCall object
 */
WebRTCommCallEventListenerInterface.prototype.onWebRTCommCallRingingEvent = function(webRTCommCall) {
	throw "WebRTCommCallEventListenerInterface:onWebRTCommCallRingingEvent(): not implemented;";
};

/**
 * Open error  event
 * @public
 * @param {WebRTCommCall} webRTCommCall source WebRTCommCall object
 */
WebRTCommCallEventListenerInterface.prototype.onWebRTCommCallRingingBackEvent = function(webRTCommCall) {
	throw "WebRTCommCallEventListenerInterface:onWebRTCommCallRingingBackEvent(): not implemented;";
};

/**
 * Open error  event
 * @public
 * @param {WebRTCommCall} webRTCommCall source WebRTCommCall object
 */
WebRTCommCallEventListenerInterface.prototype.onWebRTCommCallHangupEvent = function(webRTCommCall) {
	throw "WebRTCommCallEventListenerInterface:onWebRTCommCallHangupEvent(): not implemented;";
};

/**
 * Incoming call Cancel event
 * @public
 * @param {WebRTCommCall} webRTCommCall source WebRTCommCall object
 */
WebRTCommCallEventListenerInterface.prototype.onWebRTCommCallCanceledEvent = function(webRTCommCall) {
	throw "WebRTCommCallEventListenerInterface:onWebRTCommCallCanceledEvent(): not implemented;";
};