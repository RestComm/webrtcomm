/**
 * @class WebRTCommClientEventListenerInterface
 * @classdesc Abstract class describing  WebRTCommClient event listener interface 
 *            required to be implented by the webapp 
 * @constructor
 * @public
 */ 
 WebRTCommClientEventListenerInterface = function(){
};
 
/**
 * Open event
 * @public
 */ 
WebRTCommClientEventListenerInterface.prototype.onWebRTCommClientOpenedEvent= function() {
    throw "WebRTCommClientEventListenerInterface:onWebRTCommClientOpenedEvent(): not implemented;"; 
}

/**
 * Open error event 
 * @public
 * @param {String} error open error message
 */
WebRTCommClientEventListenerInterface.prototype.onWebRTCommClientOpenErrorEvent= function(error) {
    throw "WebRTCommClientEventListenerInterface:onWebRTCommClientOpenErrorEvent(): not implemented;"; 
}


/**
 * Open error event 
 * @public
 */
WebRTCommClientEventListenerInterface.prototype.onWebRTCommClientClosedEvent= function(error) {
    throw "WebRTCommClientEventListenerInterface:onWebRTCommClientClosedEvent(): not implemented;"; 
}


