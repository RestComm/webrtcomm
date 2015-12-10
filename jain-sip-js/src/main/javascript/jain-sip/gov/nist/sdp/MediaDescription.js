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
 *  Implementation of the JAIN-SIP MediaDescriptionImpl.
 *  @see  gov/nist/javax/sdp/MediaDescriptionImpl.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function MediaDescription() {
    if(logger!=undefined) logger.debug("MediaDescription:MediaDescription()");
    this.classname="MediaDescription";
    this.mediaField=null;
    this.informationField=null;
    this.connectionField=null;
    this.keyField=null;
    this.bandwidthFieldArray=new Array();
    this.attributeFieldArray=new Array();
}

MediaDescription.prototype.constructor=MediaDescription; 

/**
 * Encode to a canonical form.
 *
 * @since v1.0
 */
MediaDescription.prototype.encode =function() {
    if(logger!=undefined) logger.debug("MediaDescription:encode()");
    var encodedString = "";
    if (this.mediaField != null)
        encodedString+=this.mediaField.encode();
    if (this.informationField != null)
        encodedString+=this.informationField.encode();
    if (this.connectionField != null)
        encodedString+=this.connectionField.encode();
    if (this.bandwidthFieldArray != null) {
        for (var i = 0; i < this.bandwidthFieldArray.length; i++) {
            // issued by Miguel Freitas (IT) PTInovacao
            encodedString+=this.bandwidthFieldArray[i].encode();
        }
    }
    if (this.keyField != null)
        encodedString+=this.keyField.encode();
    if (this.attributeFieldArray!= null) {
        for (var i = 0; i < this.attributeFieldArray.length; i++)
            encodedString+=this.attributeFieldArray[i].encode();
    }
    return encodedString;
}


/**
 * Retun string representation.
 * @public
 * @return string
 */
MediaDescription.prototype.toString=function() {
    if(logger!=undefined) logger.debug("MediaDescription:toString()");
    return this.encode();
}

/**
 * Return media field.
 * @public
 * @return MediaField
 */
MediaDescription.prototype.getMedia=function() {
    if(logger!=undefined) logger.debug("MediaDescription:getMedia()");
    return this.mediaField;
}

/**
 * Return information field.
 * @public
 * @return InformationField
 */
MediaDescription.prototype.getInfo=function() {
    if(logger!=undefined) logger.debug("MediaDescription:getInfo()");
    return this.informationField;
}

/**
 * Return connection field.
 * @public
 * @return ConnectionField
 */
MediaDescription.prototype.getConnection=function() {
    if(logger!=undefined) logger.debug("MediaDescription:getConnection()");
    return this.connectionField;
}

/**
 * Return key field.
 * @public
 * @return KeyField
 */
MediaDescription.prototype.getKey=function() {
    if(logger!=undefined) logger.debug("MediaDescription:getKey()");
    return this.keyField;
}

/**
 * Return attribut fields.
 * @public
 * @return attributeFieldArray
 */
MediaDescription.prototype.getAttributes=function() {
    if(logger!=undefined) logger.debug("MediaDescription:getAttributes()");
    return this.attributeFieldArray;
}


/**
 * Returns the value of the specified attribute.
 *
 * @param name the name of the attribute.
 * @throws SdpParseException
 * @return the value of the named attribute
 */
MediaDescription.prototype.getAttribute=function(name) {
    if(typeof name == 'string')
    {
        if(logger!=undefined) logger.debug("MediaDescription:getAttribute():name="+name);
        for (var i = 0; i < this.attributeFieldArray.length; i++) {
            if (name == this.attributeFieldArray[i].getAttribute().getName())
                return this.attributeFieldArray[i].getAttribute().getValueAsObject();
        }
        return null;
    }
    else throw new SdpException("MediaDescription.getAttribute() requires string object argument");
}

/**
 * Set the mediaField member
 */
MediaDescription.prototype.setMedia=function(mediaField) {
    if(mediaField instanceof MediaField) 
    {
        if(logger!=undefined) logger.debug("MediaDescription:setMedia(): mediaField="+mediaField);
        this.mediaField = mediaField;
    }
    else throw new SdpException("MediaDescription.setMedia() requires Mediafield object argument")
}

/**
 * Set the informationField member
 */
MediaDescription.prototype.setInfo=function(informationField) {
    if(informationField instanceof InformationField)
    {
        if(logger!=undefined) logger.debug("MediaDescription:setInfo(): informationField="+informationField);
        this.informationField = informationField;
    }
    else throw new SdpException("MediaDescription.setInfo() requires InformationField object argument")
}

/**
 * Set the connectionField member
 */
MediaDescription.prototype.setConnection=function(connectionField) {
    if(connectionField instanceof ConnectionField) 
    {
        if(logger!=undefined) logger.debug("MediaDescription:setConnection():connectionField="+connectionField);
        this.connectionField = connectionField;
    }
    else throw new SdpException("MediaDescription.setConnection() requires ConnectionField object argument")
}

/**
 * Set the bandwidthField member
 */
MediaDescription.prototype.addBandwidth=function(bandwidthField) {  
    if(bandwidthField instanceof BandwidthField) 
    { 
        if(logger!=undefined) logger.debug("MediaDescription:addBandwidth():bandwidthField="+bandwidthField);
        this.bandwidthFieldArray.push(bandwidthField);
    }
    else throw new SdpException("MediaDescription.addBandwidth() requires BandwidthField object argument") 
}

/**
 * Set the keyField member
 */
MediaDescription.prototype.setKey=function(keyField) {
    if(keyField instanceof KeyField) 
    {
        if(logger!=undefined) logger.debug("MediaDescription:setKey(): keyField="+keyField);
        this.keyField=keyField;
    }
    else throw new SdpException("MediaDescription.setKey() requires KeyField object argument")
}

/**
 * Set the attributeFieldArray member
 */
MediaDescription.prototype.setAttributes=function(attributeFieldArray) {
    if(attributeFieldArray instanceof Array) 
    {
        if(logger!=undefined) logger.debug("MediaDescription:setAttributes(): attributeFieldArray="+attributeFieldArray);
        for (var i = 0; i < attributeFieldArray.length; i++) {
            var attributeField = attributeFieldArray[i];
            if (! (attributeField instanceof AttributeField)) {
                throw new SdpException("MediaDescription.setAttributes() requires Array of AttributeField object argument");
            }
        }
        this.attributeFieldArray= attributeFieldArray;
    }
    else throw new SdpException("MediaDescription.setAttributes() requires Array object argument"); 
}


// issued by Miguel Freitas //
MediaDescription.prototype.addAttribute=function(attributField) {
    if(attributField instanceof AttributeField)
    {
        if(logger!=undefined) logger.debug("MediaDescription:addAttribute():attributField="+attributField);
        this.attributeFieldArray.push(attributField);
    }
    else throw new SdpException("MediaDescription.addAttribute()requires AttributeField object argument");  
}

MediaDescription.prototype.hasAttribute=function(name) {
    if(typeof name == 'string')
    {
        if(logger!=undefined) logger.debug("MediaDescription:hasAttribute():name="+name);
        for (var i = 0; i < this.attributeFieldArray.length; i++) {
            if (this.attributeFieldArray[i].getName()==name)
                return true;
        }
        return false;
    }
    else throw new SdpException("MediaDescription.hasAttribute()requires string object name argument");  
}

/**
 * Sets the value of the specified attribute
 *
 * @param name
 *            the name of the attribute.
 * @param value
 *            the value of the named attribute.
 * @throws SdpException
 *             if the parameters are null
 */
MediaDescription.prototype.setAttribute=function(name,value) {
    if(logger!=undefined) logger.debug("MediaDescription:setAttribute():name="+name+", value="+value);
    if(typeof name == 'string')
    { 
        var newAttributeField = new AttributeField();
        newAttributeField.setName(name);
        newAttributeField.setValue(value);
        // Bug fix by Emil Ivov.
        this.attributeFieldArray.push(newAttributeField);
    } else  throw new SdpException("MediaDescription.setAttribute()requires string object name argument"); 
}


/**
 * Returns the integer value of the specified bandwidth name.
 *
 * @param name the name of the bandwidth type.
 * @throws SdpParseException
 * @return the value of the named bandwidth
 */
MediaDescription.prototype.getBandwidth=function(name)  {
    if(logger!=undefined) logger.debug("MediaDescription:getBandwidth(): name="+name);
    if(typeof name == 'string')
    {
        if (this.bandwidthFieldArray == null) return -1;
        else {
            for (var i = 0; i < this.bandwidthFieldArray.length; i++) {
                if (this.bandwidthFieldArray[i].getType()==name)
                    return this.bandwidthFieldArray.getBandwidth();
            }
            return -1;
        }
    }
    else throw new SdpException("MediaDescription.getBandwidth() requires string object name argument");
}

/**
 * Sets the value of the specified bandwidth type.
 *
 * @param name
 *            the name of the bandwidth type.
 * @param value
 *            the value of the named bandwidth type.
 * @throws SdpException
 *             if the name is null
 */
MediaDescription.prototype.setBandwidth=function(name, value) {
    if(logger!=undefined) logger.debug("MediaDescription:setBandwidth(): name="+name+", value="+value);
    if(typeof name == 'string')
    {
        if(typeof value == 'number')
        {
            for (var i = 0; i < this.bandwidthFieldArray.length; i++) {
                if ( this.bandwidthFieldArray[i].getType()==name) {
                    this.bandwidthFieldArray[i].setBandwidth(value);
                    return; // issued by Miguel Freitas (IT) PTInovacao
                }
            }
            var newBandwidthField = new BandwidthField();
            newBandwidthField.setType(name);
            newBandwidthField.setBandwidth(value);
            this.bandwidthFieldArray.push(newBandwidthField);
        }
        else throw new SdpException("MediaDescription.setBandwidth() requires number object value argument");
    }
    else throw new SdpException("MediaDescription.setBandwidth() requires string object name argument");
}

/**
 * Removes the specified bandwidth type.
 *
 * @param name the name of the bandwidth type.
 * @throws NullPointerException
 */
MediaDescription.prototype.removeBandwidth=function(name) {
    if(typeof(name) == 'string')
    {
        if(logger!=undefined) logger.debug("SessionDescription:removeBandwidth(): name="+name);
        if(this.bandwidthFieldArray != null) {
            for (var i = 0; i < this.bandwidthFieldArray.length; i++) {
                if (this.bandwidthFieldArray[i].getType() == name) {
                    this.bandwidthFieldArray.splice(i,1);
                    break;
                }
            }
        }
    }
}

MediaDescription.prototype.getDuplexity=function() {
    if(logger!=undefined) logger.debug("MediaDescription:getDuplexity()");
    for (var i = 0; i < this.attributeFieldArray.length; i++) {
        var afvlc = this.attributeFieldArray[i].getAttribute().getName().toLowerCase();
        if ((afvlc=="sendrecv") ||(afvlc=="recvonly") ||(afvlc=="sendonly") ||(afvlc=="inactive")) {
            return afvlc;
        }
    }
    return null;
         
}
    
    
MediaDescription.prototype.setDuplexity=function(duplexity) {
    if(typeof duplexity == 'string')
    {
        if(logger!=undefined) logger.debug("MediaDescription:setDuplexity():duplexity="+duplexity);
        for (var i = 0; i < this.attributeFieldArray.length; i++) {
            var afvlc = this.attributeFieldArray[i].getName().toLowerCase();
            if ((afvlc=="sendrecv") ||(afvlc=="recvonly") ||(afvlc=="sendonly") ||(afvlc=="inactive")) {
                return;
            }
        }
        var newAttributeField = new AttributeField();
        newAttributeField.setName(duplexity);
        newAttributeField.setValue(null);
        this.attributeFieldArray.push(newAttributeField);
    }
    else throw new SdpException("MediaDescription.setDuplexity() requires string object duplexity argument");
}

/**
 * Removes the attribute specified by the value parameter.
 *
 * @param name
 *            the name of the attribute.
 */
MediaDescription.prototype.removeAttribute=function(name) {
     if(typeof(name)=='string')
    {
        if(logger!=undefined) logger.debug("MediaDescription:removeAttribute(): name="+name);
        if (this.attributeFieldArray != null) 
        {
            for (var i = 0; i < this.attributeFieldArray.length; i++) {
                if (this.attributeFieldArray[i].getName()==name) {
                    this.attributeFieldArray.slice(i,1);
                    break;
                }
            } 
        }
    }
    else throw new SdpException("MediaDescription.removeAttribute() requires string object argument");
}


/**
 * Returns a Vector containing a string indicating the MIME type for each of
 * the codecs in this description.
 *
 * A MIME value is computed for each codec in the media description.
 *
 * The MIME type is computed in the following fashion: The type is the
 * mediaType from the media field. The subType is determined by the
 * protocol.
 *
 * The result is computed as the string of the form:
 *
 * type + '/' + subType
 *
 * The subType portion is computed in the following fashion. RTP/AVP the
 * subType is returned as the codec name. This will either be extracted from
 * the rtpmap attribute or computed. other the protocol is returned as the
 * subType.
 *
 * If the protocol is RTP/AVP and the rtpmap attribute for a codec is
 * absent, then the codec name will be computed in the following fashion.
 * String indexed in table SdpConstants.avpTypeNames if the value is an int
 * greater than or equal to 0 and less than AVP_DEFINED_STATIC_MAX, and has
 * been assigned a value. SdpConstant.RESERVED if the value is an int
 * greater than or equal to 0 and less than AVP_DEFINED_STATIC_MAX, and has
 * not been assigned a value. SdpConstant.UNASSIGNED An int greater than or
 * equal to AVP_DEFINED_STATIC_MAX and less than AVP_DYNAMIC_MIN - currently
 * unassigned. SdpConstant.DYNAMIC Any int less than 0 or greater than or
 * equal to AVP_DYNAMIC_MIN
 *
 * @throws SdpException
 *             if there is a problem extracting the parameters.
 * @return a Vector containing a string indicating the MIME type for each of
 *         the codecs in this description
 */
MediaDescription.prototype.getMimeTypes=function()  {
    if(logger!=undefined) logger.debug("MediaDescription:getMimeTypes()");
    var mediaField = this.getMedia();
    if(mediaField!=null)
    {
        var type = mediaField.getMediaType();
        var protocol = mediaField.getProtocol();
        var formats = mediaField.getMediaFormats(false);
        var resultArray = new Array();
        for (var i = 0; i < formats.length; i++) {
            var result = null;
            if (protocol=="RTP/AVP") {
                if (this.getAttribute(SdpConstants.RTPMAP) != null)
                    result = type + "/" + protocol;
                else {
                }
            } else
                result = type + "/" + protocol;
            resultArray.push(result);
        }
        return resultArray;
    }
    else return null;
}

/**
 * Returns a Vector containing a string of parameters for each of the codecs
 * in this description.
 *
 * A parameter string is computed for each codec.
 *
 * The parameter string is computed in the following fashion.
 *
 * The rate is extracted from the rtpmap or static data.
 *
 * The number of channels is extracted from the rtpmap or static data.
 *
 * The ptime is extracted from the ptime attribute.
 *
 * The maxptime is extracted from the maxptime attribute.
 *
 * Any additional parameters are extracted from the ftmp attribute.
 *
 * @throws SdpException
 *             if there is a problem extracting the parameters.
 * @return a Vector containing a string of parameters for each of the codecs
 *         in this description.
 */
MediaDescription.prototype.getMimeParameters=function() {
    if(logger!=undefined) logger.debug("MediaDescription:getMimeParameters()");
    var result = new Array();
    var rate = this.getAttribute("rate");
    if(rate!=null) result.push(rate);
    var ptime = this.getAttribute("ptime");
    if(ptime!=null) result.push(ptime);
    var maxptime = this.getAttribute("maxptime");
    if(maxptime!=null) result.push(maxptime);
    var ftmp = this.getAttribute("ftmp");
    if(ftmp!=null) result.push(ftmp);
    return result;
}

/**
 * Adds dynamic media types to the description.
 *
 * @param payloadNames
 *            a Vector of String - each one the name of a dynamic payload to
 *            be added (usually an integer larger than
 *            SdpConstants.AVP_DYNAMIC_MIN).
 * @param payloadValues
 *            a Vector of String - each contains the value describing the
 *            correlated dynamic payloads to be added
 * @throws SdpException
 *             if either vector is null or empty. if the vector sizes are
 *             unequal.
 */
MediaDescription.prototype.addDynamicPayloads=function(payloadNames, payloadValues){
    if(payloadNames instanceof Array && payloadValues instanceof Array) 
    {
        if ((payloadNames.length==0) || (payloadValues.length==0))
            throw new SdpException("MediaDescription:addDynamicPayloads(): no dynamic payload");
        else {
            if (payloadNames.length != payloadValues.length)
                throw new SdpException("MediaDescription:addDynamicPayloads(): missing payload parameters");
            else {
                if(logger!=undefined) logger.debug("MediaDescription:addDynamicPayloads():payloadNames="+payloadNames+", payloadValues="+payloadValues);
                for (var i = 0; i < payloadNames.length; i++) {
                    var name = payloadNames[i];
                    var  value = payloadValues[i];
                    this.setAttribute(name, value);
                }
            }
        }
    }
    else throw new SdpException("MediaDescription.addDynamicPayloads() requires Array object arguments");
}

// /////////////////////////////////////////////////////////////////
// Precondition Mechanism
// based in 3GPP TS 24.229 and precondition mechanism (RFC 3312)
// issued by Miguel Freitas (IT) PTinovacao
// /////////////////////////////////////////////////////////////////
/**
 * <p>
 * Set the Media Description's Precondition Fields
 * </p>
 * <p>
 * issued by Miguel Freitas (IT) PTInovacao
 * </p>
 *
 * @param precondition
 *            Vector containing PreconditionFields
 * @throws SdpException
 */
MediaDescription.prototype.setPreconditionFields=function(precondition) {
    if(logger!=undefined) logger.debug("MediaDescription:setPreconditionFields():precondition="+precondition);
    this.preconditionFields.setPreconditions(precondition);
}

/**
 * <p>
 * Set the Media Description's Precondition Fields
 * </p>
 * <p>
 * issued by Miguel Freitas (IT) PTInovacao
 * </p>
 *
 * @param precondition
 *            PreconditionFields parameter
 */
MediaDescription.prototype.setPreconditions=function(precondition) {
    if(logger!=undefined) logger.debug("MediaDescription:setPreconditionFields():precondition="+precondition);
    this.preconditionFields = precondition;
}

/**
 * <p>
 * Get attribute fields of segmented precondition
 * </p>
 * <p>
 * issued by Miguel Freitas (IT) PTInovacao
 * </p>
 *
 * @return Vector of attribute fields (segmented precondition)
 */
MediaDescription.prototype.getPreconditionFields=function() {
    if(logger!=undefined) logger.debug("MediaDescription:getPreconditionFields()");
    return this.preconditionFields.getPreconditions();
}

