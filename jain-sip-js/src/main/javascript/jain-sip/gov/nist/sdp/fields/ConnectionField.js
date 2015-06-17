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
 *  Implementation of the JAIN-SIP ConnectionField .
 *  @see  gov/nist/javax/sdp/fields/ConnectionField.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function ConnectionField() {
    if(logger!=undefined) logger.debug("ConnectionField:ConnectionField()");
    this.classname="ConnectionField";
    this.fieldName=this.CONNECTION_FIELD;
    this.networkType=SDPField.prototype.IN;
    this.addressType=SDPField.prototype.IPV4;
    this.address=null;
}
 
ConnectionField.prototype = new SDPField();
ConnectionField.prototype.constructor=ConnectionField; 


ConnectionField.prototype.getNetworkType =function() {
    if(logger!=undefined) logger.debug("ConnectionField:getNetworkType()");
    return this.networkType;
}

ConnectionField.prototype.getAddressType =function() {
    if(logger!=undefined) logger.debug("ConnectionField:getAddressType()");
    return this.addressType;
}

ConnectionField.prototype.getAddress =function() {
    if(logger!=undefined) logger.debug("ConnectionField:getAddress()");
    if (this.address == null)
        return null;
    else {
        var host = this.address.getAddress();
        if (host == null)
            return null;
        else
            return host.getAddress();
    }
} 

/**
 * Set the nettype member
 */
ConnectionField.prototype.setNetworkType =function(networkType) {
    if(typeof networkType ==  'string')
    {
        if(logger!=undefined) logger.debug("ConnectionField:setNetworkType():networkType="+networkType);   
        this.networkType = networkType;
    }
    else throw new SdpException("ConnectionField.setNetworkType() requires string type argument");  
}

/**
 * Set the addrtype member
 */
ConnectionField.prototype.setAddressType =function(addressType) {
    if(typeof addressType ==  'string')
    {
        if(logger!=undefined) logger.debug("ConnectionField:setAddressType():addressType="+addressType);   
        this.addressType = addressType;
    }
    else throw new SdpException("ConnectionField.setAddressType() requires string type argument");  
}


/**
 * Set the address member
 */
ConnectionField.prototype.setAddress =function(address) {
    if(address instanceof ConnectionAddress)
    {
        if(logger!=undefined) logger.debug("ConnectionField:setAddress():address="+address);   
        this.address = address;
    }
    else if(typeof address == 'string')
    {
        if(logger!=undefined) logger.debug("ConnectionField:setAddress():address="+address);   
        if (this.address == null) {
            this.address = new ConnectionAddress();
            var host = new Host(address);
            this.address.setHost(host);
        } else {
            var host = this.address.getHost();
            if (host == null) {
                host = new Host(address);
                this.address.setAddress(host);
            } else
                host.setAddress(address);
        }
    }
    else throw new SdpException("ConnectionField.setAddress() requires ConnectionAddress object or string argument");  
}


/**
 * Get the string encoded version of this object
 * @since v1.0
 */
ConnectionField.prototype.encode =function() {
    if(logger!=undefined) logger.debug("ConnectionField:encode()");
    if(this.address == null) throw  new SdpException("ConnectionField.encode() requires address"); 
    var encoded_string = this.CONNECTION_FIELD;
    encoded_string += this.networkType;
    encoded_string += Separators.prototype.SP;
    encoded_string += this.addressType;
    encoded_string += Separators.prototype.SP;
    encoded_string += this.address.encode();
    encoded_string += Separators.prototype.NEWLINE;
    return encoded_string; 
}


ConnectionField.prototype.clone =function() {
    if(logger!=undefined) logger.debug("ConnectionField:clone()");
    var retval = new ConnectionField();
    if (this.address != null)
        retval.address = this.address.clone();
    retval.networkType=this.networkType;
    retval.addressType=this.addressType;
    return retval;
}
