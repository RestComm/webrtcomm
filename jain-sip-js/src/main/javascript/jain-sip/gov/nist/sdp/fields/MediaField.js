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
 *  Implementation of the JAIN-SIP MediaField .
 *  @see  gov/nist/javax/sdp/fields/MediaField.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function MediaField() {
    if(logger!=undefined) logger.debug("MediaField:MediaField()");
    this.classname="MediaField";
    this.fieldName=this.MEDIA_FIELD;
    this.type=null;
    this.port=-1;
    this.nports=0;
    this.protocol=null;
    this.formatArray=new Array();
}
 
MediaField.prototype = new SDPField();
MediaField.prototype.constructor=MediaField; 

/** Returns the type (audio,video etc) of the
 * media defined by this description.
 * @throws SdpParseException
 * @return the string media type.
 */
MediaField.prototype.getType =function() {
    if(logger!=undefined) logger.debug("MediaField:getType()");
    return this.type;
}

/** Returns the protocol over which this media should be transmitted.
 * @throws SdpParseException
 * @return the String protocol, e.g. RTP/AVP.
 */
MediaField.prototype.getPort =function() {
    if(logger!=undefined) logger.debug("MediaField:getPort()");
    return this.port;
}


/** Returns the number of ports associated with this media description
 * @throws SdpParseException
 * @return the integer port count.
 */
MediaField.prototype.getNports =function() {
    if(logger!=undefined) logger.debug("MediaField:getNports()");
    return this.nports;
}

MediaField.prototype.getProtocol =function() {
    if(logger!=undefined) logger.debug("MediaField:getProtocol()");
    return this.protocol;
}

MediaField.prototype.getFormats =function() {
    if(logger!=undefined) logger.debug("MediaField:getFormats()");
    return this.formatArray;
}

/**
 * Set the media member
 */
MediaField.prototype.setType =function(type) {
    if(typeof(type)=='string')
    {
        if(logger!=undefined) logger.debug("MediaField:setMedia(): type="+type);
        this.type=type.toLowerCase();
    }
    else throw new SdpException("MediaField.setMedia() requires string object argument");
}


/**
 * Set the port member
 */
MediaField.prototype.setPort =function(port) {
    if(typeof(port)=='number')
    {
        if(port<0) throw new SdpException("MediaField.setPort() requires number > 0 object argument");
        if(logger!=undefined) logger.debug("MediaField:setPort(): port="+port);
        this.port=port;
    }
    else throw new SdpException("MediaField.setPort() requires number object argument");
}

/**
 * Set the nports member
 */
MediaField.prototype.setNports =function(nports) {
    if(typeof(nports)=='number')
    {      
        if(nports<0) throw new SdpException("MediaField.setNports() requires number > 0 object argument");
        if(logger!=undefined) logger.debug("MediaField:setNports(): nports="+nports);
        this.nports=nports;
    }
    else throw new SdpException("MediaField.setNports() requires number object argument"); 
}

/**
 * Set the proto member
 */
MediaField.prototype.setProtocol =function(protocol) {
    if(typeof(protocol)=='string')
    {
        if(logger!=undefined) logger.debug("MediaField:setProtocol(): protocol="+protocol);
        this.protocol=protocol;
    }
    else throw new SdpException("MediaField.setProtocol() requires string object argument");
}

/**
 * Set the fmt member
 */
MediaField.prototype.setFormats =function(formatArray) {
    if(formatArray instanceof Array)
    {
        if(logger!=undefined) logger.debug("MediaField:setFormats(): formats="+formatArray);
        this.formatArray=formatArray;
    }
    else throw new SdpException("MediaField.setFormats() requires Array object argument");
}


/** Returns an Vector of the media formats supported by this description.
 * Each element in this Vector will be an String value which matches one of
 * the a=rtpmap: attribute fields of the media description.
 * @param create to set
 * @throws SdpException
 * @return the Vector.
 */
MediaField.prototype.getFormats =function(create) {
    if(typeof(create)=='boolean')
    {
        if(logger!=undefined) logger.debug("MediaField:getFormats():create="+create);
        if (create && this.formatArray==null) this.formatArray = new Array();
        return this.formatArray;
    }
    else throw new SdpException("MediaField.getFormats() requires boolean object argument");
}


MediaField.prototype.encodeFormats =function() {
    if(logger!=undefined) logger.debug("MediaField:encodeFormats()");
    var encodedString = "";
    for (var i = 0; i < this.formatArray.length; i++) {
        encodedString+=this.formatArray[i];
        if (i < (this.formatArray.length - 1))
            encodedString+=Separators.prototype.SP;
    }
    return encodedString;
}

/**
 *  Get the string encoded version of this object
 * @since v1.0
 */
MediaField.prototype.encode =function() {
    if(logger!=undefined) logger.debug("MediaField:encode()");
    if(this.type==null) throw  new SdpException("MediaField.encode() requires type");
    if(this.protocol==null) throw  new SdpException("MediaField.encode() requires protocol");
    if(this.formatArray==null) throw  new SdpException("MediaField.encode() requires format");
    var encodedString=this.MEDIA_FIELD;
    encodedString += this.type + Separators.prototype.SP + this.port;
    // Workaround for Microsoft Messenger contributed by Emil Ivov
    // Leave out the nports parameter as this confuses the messenger.
    if (this.nports > 1)
        encodedString += Separators.prototype.SLASH + this.nports;
    encodedString += Separators.prototype.SP + this.protocol;
    encodedString += Separators.prototype.SP + this.encodeFormats();
    encodedString += Separators.prototype.NEWLINE;
    return encodedString;
}

MediaField.prototype.clone =function() {
    if(logger!=undefined) logger.debug("MediaField:clone()");
    var retval = new MediaField();
    retval.media = this.type;
    retval.port = this.port;
    retval.nports = this.nports;
    retval.proto = this.protocol;
    retval.formats=new Array();
    if (this.formatArray != null)
    {
        for(var i=0;i<this.formatArray.length;i++)
        {
            retval.formats[i]=this.formatArray[i];      
        }
    }
    return retval;
}

