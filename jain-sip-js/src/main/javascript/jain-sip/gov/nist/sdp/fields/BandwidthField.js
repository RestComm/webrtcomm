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
 *  Implementation of the JAIN-SIP BandwidthField .
 *  @see  gov/nist/javax/sdp/fields/BandwidthField.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function BandwidthField() {
    if(logger!=undefined) logger.debug("BandwidthField:BandwidthField()");
    this.classname="BandwidthField";
    this.fieldName=this.BANDWDTH_FIELD;
    this.type="AS"; // AS as default
    this.bandwidth=null;
}
 
BandwidthField.prototype = new SDPField();
BandwidthField.prototype.constructor=BandwidthField; 

BandwidthField.prototype.getType =function() {
    if(logger!=undefined) logger.debug("BandwidthField:getType()");
    return this.type;
}

BandwidthField.prototype.getBandwidth =function() {
    if(logger!=undefined) logger.debug("BandwidthField:getBandwidth()");
    return this.bandwidth;
}

/**
 * Set the bwtype member
 */
BandwidthField.prototype.setType =function(type) {
    if( typeof(type)=='string')
    {
        if(logger!=undefined) logger.debug("BandwidthField:setType():type="+type);
        this.type = type;
    }
    else throw new SdpException("BandwidthField.setType() requires string object argument")
}

/**
 * Set the bandwidth member
 */
BandwidthField.prototype.setBandwidth =function(bandwidth) {
     if(typeof(bandwidth)=='number')
    {
        if(logger!=undefined) logger.debug("BandwidthField:setBandwidth():bandwidth="+bandwidth);
        this.bandwidth = bandwidth;
    }
    else throw new SdpException("BandwidthField.setBandwidth() requires number object argument")
}

/**
 *  Get the string encoded version of this object
 * @since v1.0
 */
BandwidthField.prototype.encode =function() {
    if(logger!=undefined) logger.debug("BandwidthField:encode()");
    if(this.bandwidth==null) throw  new SdpException("BandwidthField.encode() requires valid bandwidth value");
    var encodedString = this.BANDWIDTH_FIELD;
    encodedString += this.type;
    encodedString += Separators.prototype.COLON;
    encodedString += this.bandwidth;
    encodedString += Separators.prototype.NEWLINE;
    return encodedString;
}
