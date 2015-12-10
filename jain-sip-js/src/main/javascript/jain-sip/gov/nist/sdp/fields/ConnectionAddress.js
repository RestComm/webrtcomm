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
 *  Implementation of the JAIN-SIP ConnectionAddress .
 *  @see  gov/nist/javax/sdp/fields/ConnectionAddress.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function ConnectionAddress() {
    if(logger!=undefined) logger.debug("ConnectionAddress:ConnectionAddress()");
    this.classname="ConnectionAddress";
    this.host =null;
    this.ttl=0;
    this.port=0;
}
 
ConnectionAddress.prototype = new SDPObject();
ConnectionAddress.prototype.constructor=ConnectionAddress; 


ConnectionAddress.prototype.getHost =function() {
    if(logger!=undefined) logger.debug("ConnectionAddress:getHost()");
    return this.host;
}
 
ConnectionAddress.prototype.getTtl =function() {
    if(logger!=undefined) logger.debug("ConnectionAddress:getTtl()");
    return this.ttl;
}

ConnectionAddress.prototype.getPort =function() {
    if(logger!=undefined) logger.debug("ConnectionAddress:getPort()");
    return this.port;
}

/**
 * Set the address member
 */
ConnectionAddress.prototype.setHost =function(host) {
    if(host instanceof Host)
    {
        if(logger!=undefined) logger.debug("ConnectionAddress:setHost(): host="+host);
        this.host = host;
    } 
    else throw new SdpException("ConnectionAddress.setHost() requires  Host object argument");    
}

/**
 * Set the ttl member
 */
ConnectionAddress.prototype.setTtl =function(ttl) {
    if(typeof(ttl)=='number')
    {
        if(logger!=undefined) logger.debug("ConnectionAddress:setTtl()");
        this.ttl = ttl;
    }
    else throw new SdpException("ConnectionAddress.setTtl() requires  number object argument");  
}


/**
 * Set the port member
 */
ConnectionAddress.prototype.setPort =function(port) {
    if(typeof(port)=='number')
    {  
        if(logger!=undefined) logger.debug("ConnectionAddress:setPort()");
        this.port = port;
    }
    else throw new SdpException("ConnectionAddress.setPort() requires  number object argument");  

}

/**
 *  Get the string encoded version of this object
 * @since v1.0
 */
ConnectionAddress.prototype.encode =function() {
    if(logger!=undefined) logger.debug("ConnectionAddress:encode()");
    if(this.host==null) throw  new SdpException("ConnectionAddress.encode() requires host"); 
    var encodedString = this.host.encode();
    //it appears that SDP does not allow square brackets
    //in the connection address (see RFC4566) so make sure
    //we lose them 
    if(Host.prototype.isIPv6Address(encodedString))
    {
        //the isIPv6Reference == true means we have a minimum
        //of 2 symbols, so substring bravely
        encodedString += encodedString.substring(1, encodedString.length()-1);
    }

    if (this.ttl != 0 && this.port != 0) {
        encodedString += Separators.prototype.SLASH + this.ttl + Separators.prototype.SLASH + this.port;
    } else if (this.ttl != 0) {
        encodedString += Separators.prototype.SLASH + this.ttl;
    }
    return encodedString;
}


ConnectionAddress.prototype.clone =function() {
    if(logger!=undefined) logger.debug("ConnectionAddress:clone()");
    var  retval = new ConnectionAddress();
    if (this.address != null)
        retval.address = this.address.clone();
    retval.ttl = this.ttl;
    retval.port = this.port;
    return retval;
}

