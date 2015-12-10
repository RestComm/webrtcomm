/*
 * TeleStax, Open Source Cloud Communications  Copyright 2012. 
 * and individual contributors
 * by the @authors tag. See the copyright.txt in the distribution for a
 * full listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

/*
 *  Implementation of the JAIN-SIP OriginField .
 *  @see  gov/nist/javax/sdp/fields/OriginField.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function OriginField() {
    if(logger!=undefined) logger.debug("OriginField:OriginField()");
    this.classname="OriginField";
    this.fieldName=this.ORIGIN_FIELD;
    this.userName=null;
    this.networkType=SDPField.prototype.IN; 
    this.addressType=SDPField.prototype.IPV4;
    this.host=null;
    this.sessionId=null;
    this.sessionVersion=null;  
}
 
OriginField.prototype = new SDPField();
OriginField.prototype.constructor=OriginField; 


/** Returns the name of the session originator.
 * @throws SdpParseException
 * @return the string username.
 */
OriginField.prototype.getUserName =function() {
    if(logger!=undefined) logger.debug("OriginField:getUserName()");
    return this.userName;
}

/**
 * Get the sessionID member.
 */
OriginField.prototype.getSessionId =function() {
    if(logger!=undefined) logger.debug("OriginField:getSessionId()");
    return new Number(this.sessionId);
}

/**
 * Get the sessionVersion member.
 */
OriginField.prototype.getSessionVersion =function() {
    if(logger!=undefined) logger.debug("OriginField:getSessionVersion()");
    return new Number(this.sessionVersion);
}

/**
 * Get the netType member.
 */
OriginField.prototype.getNetworkType =function() {
    if(logger!=undefined) logger.debug("OriginField:getNetworkType()");
    return this.networkType;
}

/**
 * Get the address type member.
 */
OriginField.prototype.getAddressType =function() {
    if(logger!=undefined) logger.debug("OriginField:getAddressType()");
    return this.addressType;
}

/**
 * Get the host member.
 */
OriginField.prototype.getHost =function() {
    if(logger!=undefined) logger.debug("OriginField:getHost()");
    return this.host;
}

/** Returns the type of the network for this Connection.
 * @throws SdpParseException
 * @return the string network type.
 */
OriginField.prototype.getAddress =function() {
    if(logger!=undefined) logger.debug("OriginField:getAddress()");
    var host = this.getHost();
    if (host == null)
        return null;
    else
        return host.getAddress();
}

/**
 * Set the sessId member
 */
OriginField.prototype.setSessionId =function(sessionId) {
    if(typeof(sessionId)=='string' || typeof(sessionId)=='number')
    {
        if(logger!=undefined) logger.debug("OriginField:setSessionId(): sessionId="+sessionId);
        this.sessionId="";
        this.sessionId+=sessionId;
    }
    else throw new SdpException("OriginField.setSessionId() requires string or number object argument");
}

/**
 * Set the sessVersion member
 */
OriginField.prototype.setSessionVersion =function(sessionVersion) {
    if(typeof(sessionVersion)=='string' || typeof(sessionVersion)=='number')
    {
        if(logger!=undefined) logger.debug("OriginField:setSessionVersion():sessionVersion="+sessionVersion);
        this.sessionVersion="";
        this.sessionVersion+=sessionVersion;
    }
    else throw new SdpException("OriginField.setSessionVersion() requires string or number argument");

}

/**
 * Set the nettype member
 */
OriginField.prototype.setNetworkType =function(networkType) {
    if(typeof(networkType)=='string')
    {
       if(logger!=undefined) logger.debug("OriginField:setNetworkType():networkType="+networkType);
       this.networkType = networkType;
    }
    else throw new SdpException("OriginField.setNetworkType() requires string argument"); 

}

/**
 * Set the addrtype member
 */
OriginField.prototype.setAddressType =function(addressType) {
    if(typeof(addressType)=='string')
    {   
        if(logger!=undefined) logger.debug("OriginField:setAddressType():addressType="+addressType);
        this.addressType = addressType;
    }
    else throw new SdpException("OriginField.setAddressType() requires string argument"); 
}


/**
 * Set the address member
 */
OriginField.prototype.setHost =function(host) {
    if (host instanceof Host) {
        if(logger!=undefined) logger.debug("OriginField:setHost():h="+host);
        this.host = host;
    } 
    else  throw new SdpException("OriginField.setHost() requires Host object argument");
}


/**
 * Set the address member
 */
OriginField.prototype.setAddress =function(address) {
    if (typeof(address) =='string' ) {
        if(logger!=undefined) logger.debug("OriginField:setAddress():address="+address);
        var host = this.getHost();
        if (host == null) host = new Host();
        host.setAddress(address);
        this.setHost(host);
    } 
    else  throw new SdpException("OriginField.setAddress() requires string argument");
}


/** Sets the name of the session originator.
 * @param user the string username.
 * @throws SdpException if the parameter is null
 */
OriginField.prototype.setUserName =function(userName) {
    if(typeof(userName)=='string')
    {   
        if(logger!=undefined) logger.debug("OriginField:setUserName():userName="+userName);
        this.userName = userName;
    }
    else throw new SdpException("OriginField.setUserName() requires string argument"); 
}


/**
 *  Get the string encoded version of this object
 * @since v1.0
 */
OriginField.prototype.encode =function() {
    if(logger!=undefined) logger.debug("OriginField:encode()");
    if(this.host == null) throw  new SdpException("OriginField.encode() requires host"); 
    if(this.userName == null) throw  new SdpException("OriginField.encode() requires userName"); 
    if(this.sessionId == null) throw  new SdpException("OriginField.encode() requires sessionId"); 
    if(this.sessionVersion == null) throw  new SdpException("OriginField.encode() requires sessionVersion"); 
    
    var hostEncoding = "";
    if (this.host != null){
        hostEncoding = this.host.encode();
        //it appears that SDP does not allow square brackets
        //in the connection address (see RFC4566) so make sure
        //we lose them
        if(Host.prototype.isIPv6Address(hostEncoding))
        {
            //the isIPv6Reference == true means we have a minimum
            //of 2 symbols, so substring bravely
            hostEncoding = hostEncoding.substring(1, hostEncoding.length()-1);
        }
    }
    var encodedString = this.ORIGIN_FIELD;
    encodedString+= this.userName
    encodedString+= Separators.prototype.SP
    encodedString+= this.sessionId
    encodedString+= Separators.prototype.SP
    encodedString+= this.sessionVersion
    encodedString+= Separators.prototype.SP
    encodedString+= this.networkType
    encodedString+= Separators.prototype.SP
    encodedString+= this.addressType
    encodedString+= Separators.prototype.SP
    encodedString+= hostEncoding
    encodedString+= Separators.prototype.NEWLINE;
    return encodedString;
}

OriginField.prototype.clone =function() {
    if(logger!=undefined) logger.debug("OriginField:clone()");
    var retval = new OriginField();
    retval.userName = this.userName;
    retval.networkType = this.networkType; 
    retval.addressType =  this.addressType; 
    retval.sessionId = this.sessionId;
    retval.sessionVersion =  this.sessionVersion;  
    retval.host = new Host(this.host.getAddress());
    return retval;
}


