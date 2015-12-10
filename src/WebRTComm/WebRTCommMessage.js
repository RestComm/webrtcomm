/**
 * @class WebRTCommMessage
 * @classdesc Implements WebRTComm message  
 * @constructor
 * @public
 * @param  {WebRTCommClient} webRTCommClient WebRTComm client owner 
 * @param  {WebRTCommCall} webRTCommCall WebRTComm call owner 
 * @author Laurent STRULLU (laurent.strullu@orange.com) 
 */ 
WebRTCommMessage = function(webRTCommClient, webRTCommCall)
{
    console.debug("WebRTCommMessage:WebRTCommMessage()");
    if((webRTCommClient instanceof WebRTCommClient) || (webRTCommCall instanceof WebRTCommCall))
    {
        this.id=undefined;
        this.webRTCommClient=webRTCommClient;
        this.webRTCommCall=webRTCommCall;
        this.connector= this.webRTCommClient.connector.createPrivateSessionConnector(this);
        this.text=undefined;
        this.from=undefined;
        this.to=undefined;
    }
    else 
    {
        throw "WebRTCommMessage:WebRTCommMessage(): bad arguments"      
    }
};


/**
 * Get message id
 * @public
 * @returns {String} id  
 */ 
WebRTCommMessage.prototype.getId= function() {
    return this.connector.getId();  
};

/**
 * Get message sender identity
 * @public
 * @returns {String} from  
 */ 
WebRTCommMessage.prototype.getFrom= function() {
    return this.from;  
};

/**
 * Get message recever identity
 * @public
 * @returns {String} to  
 */ 
WebRTCommMessage.prototype.getTo= function() {
    return this.to;  
};

/**
 * Get message 
 * @public
 * @returns {String} message  
 */ 
WebRTCommMessage.prototype.getText= function() {
    return this.text;  
};

/**
 * Get related WebRTCommCall  
 * @public
 * @returns {WebRTCommCall} WebRTCommCall 
 */ 
WebRTCommMessage.prototype.getLinkedWebRTCommCall= function() {
        return this.webRTCommCall;
};
