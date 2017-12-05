/**
 * @class WebRTCommClientEventListenerInterface
 * @classdesc Abstract class describing  WebRTCommClient event listener interface 
 *            required to be implented by the webapp 
 * @constructor
 * @public
 */
WebRTCommClientEventListenerInterface = function() {};

/**
 * Open event
 * @public
 */
WebRTCommClientEventListenerInterface.prototype.onWebRTCommClientOpenedEvent = function() {
	throw "WebRTCommClientEventListenerInterface:onWebRTCommClientOpenedEvent(): not implemented;";
};

/**
 * Open error event 
 * @public
 * @param {String} error open error message
 */
WebRTCommClientEventListenerInterface.prototype.onWebRTCommClientOpenErrorEvent = function(error) {
	throw "WebRTCommClientEventListenerInterface:onWebRTCommClientOpenErrorEvent(): not implemented;";
};

/**
 * Warning event. Used for WebRTCommClient events that the application needs to know but which are not destructive
 * For example a REGISTER refresh that fails is such an event that we need to know, but which usually resolves
 * itself by retrying
 * @public
 * @param {String} error open error message
 */
WebRTCommClientEventListenerInterface.prototype.onWebRTCommClientOpenWarningEvent = function(error) {
	throw "WebRTCommClientEventListenerInterface:onWebRTCommClientOpenWarningEvent(): not implemented;";
};

/**
 * Close event 
 * @public
 */
WebRTCommClientEventListenerInterface.prototype.onWebRTCommClientClosedEvent = function() {
	throw "WebRTCommClientEventListenerInterface:onWebRTCommClientClosedEvent(): not implemented;";
};

/**
 * Keep-alive event
 * @public
 */
WebRTCommClientEventListenerInterface.prototype.onWebRTCommClientKeepAliveEvent = function() {
	throw "WebRTCommClientEventListenerInterface:onWebRTCommClientKeepAliveEvent(): not implemented;";
};
