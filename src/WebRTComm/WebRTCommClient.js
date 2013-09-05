/**
 * @class WebRTCommClient
 * @classdesc Main class of the WebRTComm Framework providing high level communication service: call and be call
 * @constructor
 * @public
 * @param  {object} eventListener event listener object implementing WebRTCommClient and WebRTCommCall listener interface
 */ 
WebRTCommClient = function(eventListener)
{ 
    if(typeof eventListener == 'object')
    {
        this.id = "WebRTCommClient" + Math.floor(Math.random() * 2147483648);
        console.debug("WebRTCommClient:WebRTCommClient():this.id="+this.id);
        this.eventListener = eventListener;  
        this.configuration=undefined; 
        this.connector=undefined; 
        this.closePendingFlag=false; 
    }
    else 
    {
        throw "WebRTCommClient:WebRTCommClient(): bad arguments"      
    }
} 

/**
 * SIP call control protocol mode 
 * @public
 * @constant
 */ 
WebRTCommClient.prototype.SIP="SIP";


/**
 * Get opened/closed status 
 * @public
 * @returns {boolean} true if opened, false if closed
 */
WebRTCommClient.prototype.isOpened=function(){
    if(this.connector) return this.connector.isOpened();
    else return false;   
}

/**
 * Get client configuration
 * @public
 * @returns {object} configuration
 */
WebRTCommClient.prototype.getConfiguration=function(){
    return this.configuration;  
}

/**
 * Open the WebRTC communication client, asynchronous action, opened or error event are notified to the eventListener
 * @public 
 * @param {object} configuration  WebRTC communication client configuration <br>
 * <p> Client configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">communicationMode:WebRTCommClient.prototype.SIP,<br></span>
 * <span style="margin-left: 30px">sip: {,<br></span>
 * <span style="margin-left: 60px">sipUriContactParameters:undefined,<br></span>
 * <span style="margin-left: 60px">sipUserAgent:"WebRTCommTestWebApp/0.0.1",<br></span>
 * <span style="margin-left: 60px">sipUserAgentCapabilities=undefined,<br></span>
 * <span style="margin-left: 60px">sipOutboundProxy:"ws://localhost:5082",<br></span>
 * <span style="margin-left: 60px">sipDomain:"sip.net",<br></span>
 * <span style="margin-left: 60px">sipUserName:"alice",<br></span>
 * <span style="margin-left: 60px">sipLogin:"alice@sip.net,<br></span>
 * <span style="margin-left: 60px">sipPassword:"1234567890",<br></span>
 * <span style="margin-left: 60px">sipRegisterMode:true,<br></span>
 * <span style="margin-left: 30px">}<br></span>
 * <span style="margin-left: 30px">RTCPeerConnection: {,<br></span>
 * <span style="margin-left: 60px"stunServer:undefined,<br></span>
 * <span style="margin-left: 30px">}<br></span>
 * }<br>
 *  </p>
 * @throw {String} Exception "bad argument, check API documentation"
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception [internal error]
 */
WebRTCommClient.prototype.open=function(configuration){
    console.debug("WebRTCommClient:open(): configuration="+ JSON.stringify(configuration));
    if(typeof(configuration) == 'object')
    {
        if(this.isOpened()==false)
        {
            if(this.checkConfiguration(configuration)==true)
            {
                this.configuration=configuration;
                if(configuration.communicationMode==WebRTCommClient.prototype.SIP)
                {
                    this.connector = new PrivateJainSipClientConnector(this);
                    this.connector.open(this.configuration.sip);
                }
            } 
            else
            {
                console.error("WebRTCommClient:open(): bad configuration");
                throw "WebRTCommClient:open(): bad configuration";   
            }
        }
        else
        {   
            console.error("WebRTCommClient:open(): bad state, unauthorized action");
            throw "WebRTCommClient:open(): bad state, unauthorized action";    
        }
    }
    else
    {   
        console.error("WebRTCommClient:open(): bad argument, check API documentation");
        throw "WebRTCommClient:open(): bad argument, check API documentation"    
    } 
}

/**
 * Close the WebRTC communication client, asynchronous action, closed event is notified to the eventListener
 * @public 
 * @throw {String} Exception "bad argument, check API documentation"
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 */ 
WebRTCommClient.prototype.close=function(){
    console.debug("WebRTCommClient:close()");
    if(this.isOpened())
    {    
        try
        {
            this.closePendingFlag=true;
            this.connector.close();
        }
        catch(exception){
            console.error("WebRTCommClient:close(): catched exception:"+exception);
            // Force notification of closed event to listener
            this.closePendingFlag=false;
            this.connector=undefined;
            if(this.eventListener.onWebRTCommClientClosedEvent!=undefined) 
            {
                var that=this;
                setTimeout(function(){
                    try{
                        that.eventListener.onWebRTCommClientClosedEvent(that);
                    }
                    catch(exception)
                    {
                        console.error("WebRTCommClient:onWebRTCommClientClosed(): catched exception in event listener:"+exception);  
                    }
                },1);
            }
        } 
    }
}
 
 
 
/**
 * Send a short text message
 * @public 
 * @param {String} to destination identifier (Tel URI, SIP URI: sip:bob@sip.net)
 * @param {String} message Message to send <br>
 * @throw {String} Exception "bad argument, check API documentation"
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 */ 
WebRTCommClient.prototype.sendMessage = function (to,message)
{
    console.debug ("WebRTCommClient:sendMessage(): to="+to);
    console.debug ("WebRTCommClient:sendMessage(): message="+message);
    if(this.isOpened())
    {   
        this.connector.sendMessage(to,message); 
    }
    else
    {   
        console.error("WebRTCommClient:sendMessage(): bad state, unauthorized action");
        throw "WebRTCommClient:sendMessage(): bad state, unauthorized action";    
    }
}

/**
 * Request a WebRTC communication, asynchronous action, call events are notified to the eventListener 
 * @public 
 * @param {string} calleePhoneNumber Callee contact identifier (Tel URI, SIP URI: sip:bob@sip.net)
 * @param {object} callConfiguration Communication configuration <br>
 * <p> Communication configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">displayName:alice,<br></span>
 * <span style="margin-left: 30px">localMediaStream: [LocalMediaStream],<br></span>
 * <span style="margin-left: 30px">audioMediaFlag:true,<br></span>
 * <span style="margin-left: 30px">videoMediaFlag:false,<br></span>
 * <span style="margin-left: 30px">dataMediaFlag:false,<br></span>
 * <span style="margin-left: 30px">audioCodecsFilter:PCMA,PCMU,OPUS,<br></span>
 * <span style="margin-left: 30px">videoCodecsFilter:VP8,H264,<br></span>
 * <span style="margin-left: 30px">opusFmtpCodecsParameters:maxaveragebitrate=128000,<br></span>
 * }<br>
 * </p>
 * @returns {WebRTCommCall} new created WebRTCommCall object
 * @throw {String} Exception "bad argument, check API documentation"
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 */ 
WebRTCommClient.prototype.call=function(calleePhoneNumber, callConfiguration){
    console.debug("WebRTCommClient:call():calleePhoneNumber="+calleePhoneNumber);
    console.debug("WebRTCommClient:call():callConfiguration="+ JSON.stringify(callConfiguration));
    try
    {
        if(typeof(calleePhoneNumber) == 'string' && typeof(callConfiguration) == 'object')
        {
            if(this.isOpened())
            {       
                var newWebRTCommCall = new WebRTCommCall(this);
                newWebRTCommCall.connector=this.connector.createPrivateCallConnector(newWebRTCommCall); 
                newWebRTCommCall.id=newWebRTCommCall.connector.getId();
                newWebRTCommCall.open(calleePhoneNumber, callConfiguration);
                return newWebRTCommCall;
            }
            else
            {   
                console.error("WebRTCommClient:call(): bad state, unauthorized action");
                throw "WebRTCommClient:call(): bad state, unauthorized action";    
            }
        }
        else
        {   
            console.error("WebRTCommClient:call(): bad argument, check API documentation");
            throw "WebRTCommClient:call(): bad argument, check API documentation"    
        }
    }
    catch(exception){
        console.error("WebRTCommClient:call(): catched exception:"+exception);
        throw exception;  
    }  
}


/**
 * Check validity of the client configuration 
 * @private
 * @param {object} configuration client configuration
 *  * <p> Client configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">communicationMode:WebRTCommClient.prototype.SIP,<br></span>
 * <span style="margin-left: 30px">sip: {,<br></span>
 * <span style="margin-left: 60px">sipUriContactParameters:undefined,<br></span>
 * <span style="margin-left: 60px">sipUserAgent:"WebRTCommTestWebApp/0.0.1",<br></span>
 * <span style="margin-left: 60px">sipUserAgentCapabilities=undefined,<br></span>
 * <span style="margin-left: 60px">sipOutboundProxy:"ws://localhost:5082",<br></span>
 * <span style="margin-left: 60px">sipDomain:"sip.net",<br></span>
 * <span style="margin-left: 60px">sipUserName:"alice",<br></span>
 * <span style="margin-left: 60px">sipLogin:"alice@sip.net,<br></span>
 * <span style="margin-left: 60px">sipPassword:"1234567890",<br></span>
 * <span style="margin-left: 60px">sipRegisterMode:true,<br></span>
 * <span style="margin-left: 30px">}<br></span>
 * <span style="margin-left: 30px">RTCPeerConnection: {,<br></span>
 * <span style="margin-left: 60px"stunServer:undefined,<br></span>
 * <span style="margin-left: 30px">}<br></span>
 * }<br>
 *  </p>
 * @returns {boolean} true valid false unvalid
 */ 
WebRTCommClient.prototype.checkConfiguration=function(configuration){
    
    console.debug("WebRTCommClient:checkConfiguration(): configuration="+JSON.stringify(configuration));
    var check=true;
    if(configuration.communicationMode!=undefined)
    {
        if(configuration.communicationMode==WebRTCommClient.prototype.SIP) 
        {
        } 
        else  
        {
            check=false;
            console.error("WebRTCommClient:checkConfiguration(): unsupported communicationMode");  
        } 
    }
    else
    {
        check=false;
        console.error("WebRTCommClient:checkConfiguration(): missing configuration parameter communicationMode");           
    }
    return check;
}

/**
  * Implements PrivateClientConnector opened event listener interface
  * @private
  */
WebRTCommClient.prototype.onPrivateClientConnectorOpenedEvent=function()
{
    console.debug ("WebRTCommClient:onPrivateClientConnectorOpenedEvent()");
    if(this.eventListener.onWebRTCommClientOpenedEvent!=undefined) 
    {
        var that=this;
        setTimeout(function(){
            try{
                that.eventListener.onWebRTCommClientOpenedEvent();
            } 
            catch(exception){
                console.error("WebRTCommClient:onPrivateClientConnectorOpenedEvent(): catched exception in event listener:"+exception);
            }          
        },1);    
    }
}

/**
  * Implements PrivateClientConnector error event listener interface
  * @private
  * @param {string} error Error message
  */
WebRTCommClient.prototype.onPrivateClientConnectorOpenErrorEvent=function(error)
{
    console.debug ("WebRTCommClient:onPrivateClientConnectorOpenErrorEvent():error:"+error); 
    // Force closing of the client
    try {
        this.close();
    } catch(exception) {}
        
    if(this.eventListener.onWebRTCommClientOpenErrorEvent!=undefined) 
    {
        var that=this;
        setTimeout(function(){
            try{
                that.eventListener.onWebRTCommClientOpenErrorEvent(error);
            } 
            catch(exception){
                console.error("WebRTCommClient:onPrivateClientConnectorOpenErrorEvent(): catched exception in event listener:"+exception);
            }          
        },1); 
    }
} 
    
/**
  * Implements PrivateClientConnector closed event listener interface
  * @callback PrivatePrivateClientConnector interface
  * @private
  */

WebRTCommClient.prototype.onPrivateClientConnectorClosedEvent=function()
{
    console.debug ("WebRTCommClient:onPrivateClientConnectorClosedEvent()");  
    var wasOpenedFlag = this.isOpened()||this.closePendingFlag;
    
    // Close properly the client
    try {
        if(this.closePendingFlag==false) this.close();
        else  this.connector=undefined;
    } catch(exception) {     
    }
    
    if(wasOpenedFlag && this.eventListener.onWebRTCommClientClosedEvent!=undefined) 
    {
        var that=this;
        setTimeout(function(){
            try{
                that.eventListener.onWebRTCommClientClosedEvent();
            } 
            catch(exception){
                console.error("WebRTCommClient:onPrivateClientConnectorClosedEvent(): catched exception in event listener:"+exception);
            }          
        },1);  
    } 
    else  if(!wasOpenedFlag && this.eventListener.onWebRTCommClientOpenErrorEvent!=undefined) 
    {
        var that=this;
        setTimeout(function(){
            try{
                that.eventListener.onWebRTCommClientOpenErrorEvent("Connection to WebRTCommServer has failed");
            } 
            catch(exception){
                console.error("WebRTCommClient:onWebRTCommClientOpenErrorEvent(): catched exception in event listener:"+exception);
            }          
        },1);  
    } 
}
