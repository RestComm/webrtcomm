/**
 * @class WebRTCommDataMessageEventListenerInterface
 * @classdesc Abstract class describing  WebRTCommDataMessage event listener interface 
 *            required to be implented by the webapp 
 * @constructor
 * @public
 */
WebRTCommDataMessageEventListenerInterface = function() {};

/**
 * Received message event
 * @public
 * @param {WebRTCommMessage} message object
 */
WebRTCommMessageEventListenerInterface.prototype.onWebRTCommDataMessageReceivedEvent = function(message) {
	throw "WebRTCommMessageEventListenerInterface:onWebRTCommDataMessageReceivedEvent(): not implemented;";
};

/**
 * Received message event
 * @public
 * @param {WebRTCommMessage} message object
 */
WebRTCommMessageEventListenerInterface.prototype.onWebRTCommDataMessageSentEvent = function(message) {
	throw "WebRTCommMessageEventListenerInterface:onWebRTCommDataMessageSentEvent(): not implemented;";
};

/**
 * Send message error event
 * @public
 * @param {WebRTCommMessage} message object
 * @param {String} error code
 */
WebRTCommMessageEventListenerInterface.prototype.onWebRTCommDataMessageSendErrorEvent = function(message, error) {
	throw "WebRTCommMessageEventListenerInterface:onWebRTCommDataMessageSendErrorEvent(): not implemented;";
};

/**
 * Data channel was established, ready to send messages
 * @public
 */
WebRTCommMessageEventListenerInterface.prototype.onWebRTCommDataMessageChannelOnOpenEvent = function() {
	throw "WebRTCommMessageEventListenerInterface:onWebRTCommDataMessageChannelOnOpenEvent(): not implemented;";
};

/**
 * Data channel was suddenly closed
 * @public
 */
WebRTCommMessageEventListenerInterface.prototype.onWebRTCommDataMessageChannelOnCloseEvent = function() {
	throw "WebRTCommMessageEventListenerInterface:onWebRTCommDataMessageChannelOnCloseEvent(): not implemented;";
};

/**
 * There was a failure establishing the Data channel
 * @public
 */
WebRTCommMessageEventListenerInterface.prototype.onWebRTCommDataMessageChannelOnErrorEvent = function() {
	throw "WebRTCommMessageEventListenerInterface:onWebRTCommDataMessageChannelOnErrorEvent(): not implemented;";
};