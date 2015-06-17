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
 *  Implementation of the JAIN-SIP  SessionDescription.
 *  @see  gov/nist/javax/sdp/SessionDescriptionImpl.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function SessionDescription() {
    if(logger!=undefined) logger.debug("SessionDescription:SessionDescription()");
    this.classname="SessionDescription";
    this.currentTimeDescription=null;
    this.currentMediaDescription=null;
    this.versionField=null;
    this.originField=null;
    this.sessionNameField=null;
    this.informationField=null;
    this.uriField=null;
    this.connectionField=null;
    this.keyField=null;
    this.timeFieldArray=null;
    this.mediaDescriptionArray=null;
    this.zoneAdjustments=null;
    this.emailFieldArray=null;
    this.phoneFieldArray=null;
    this.bandwidthFieldArray=null;
    this.attributeFieldArray=null;
    if(arguments.length==1)
    {
        if (arguments[0] instanceof SessionDescription) {
            this.copy(arguments[0])
        } else throw new SdpException("SessionDescription.SessionDescription() requires SessionDescription object arguments");
    }
}

SessionDescription.prototype = new SDPObject();
SessionDescription.prototype.constructor=SessionDescription; 


/**
 * Copy constructor, creates a deep copy of another SessionDescription.
 *
 * @param otherSessionDescription - the SessionDescription to copy from.
 * @throws SdpException - if there is a problem constructing the SessionDescription.
 */
SessionDescription.prototype.copy=function(otherSessionDescription)
{
    if(logger!=undefined) logger.debug("SessionDescription:copy(): otherSessionDescription="+otherSessionDescription.toString());
    
    // If the other session description is null there's nothing to initialize
    if (otherSessionDescription == null) return;

    // OK to clone the version field, no deep copy required
    var otherVersion = otherSessionDescription.getVersion();
    if (otherVersion != null) {
        this.setVersion(otherVersion.clone());
    }

    // OK to clone the origin field, class already does a deep copy
    var otherOrigin = otherSessionDescription.getOrigin();
    if (otherOrigin != null) {
        this.setOrigin(otherOrigin.clone());
    }

    // OK to clone the session name, no deep copy required
    var otherSessionName = otherSessionDescription.getSessionName();
    if (otherSessionName != null) {
        this.setSessionName(otherSessionName.clone());
    }

    // OK to clone the information field, just a string, no deep copy required
    var otherInfo = otherSessionDescription.getInfo();
    if (otherInfo != null) {
        this.setInfo(otherInfo.clone());
    }

    // URI field requires deep copy
    var otherUriField = otherSessionDescription.getURI();
    if (otherUriField != null) {
        var newUF = new URIField();
        newUF.setURI(otherUriField.toString());
        this.setURI(newUF);
    }

    // OK to clone the connection field, class already does a deep copy
    var otherConnection = otherSessionDescription.getConnection();
    if (otherConnection != null) {
        this.setConnection(otherConnection.clone());
    }

    // OK to clone the key field, just a couple of strings
    var otherKey = otherSessionDescription.getKey();
    if (otherKey != null) {
        this.setKey(otherKey.clone());
    }

    // Deep copy each vector, starting with time descriptions
    var otherTimeDescriptions = otherSessionDescription.getTimeDescriptions(false);
    if (otherTimeDescriptions != null) {
        var newTDs = new Array();
        for (var i = 0; i <  otherTimeDescriptions.length; i++) {
            var otherTimeDescription = otherTimeDescriptions[i];
            var otherTimeField = otherTimeDescription.getTime().clone();
            var newTD = new TimeDescription(otherTimeField);
            var otherRepeatTimes = otherTimeDescription.getRepeatTimes(false);
            if (otherRepeatTimes != null) {
                for (var j = 0; j <  otherRepeatTimes.length; j++) {
                    var otherRepeatField = otherRepeatTimes[j];
                    // RepeatField clone is a deep copy
                    var  newRF = otherRepeatField.clone();
                    newTD.addRepeatField(newRF);
                }
            }
            newTDs.push(newTD);
        }
        this.setTimes(newTDs);
    }

    // Deep copy the email list
    var otherEmails = otherSessionDescription.getEmails(false);
    if (otherEmails != null) {
        var newEmails = new Array();
        for (var i = 0; i <  otherEmails.length; i++) 
        {
            var otherEmailField = otherEmails[i];
            // Email field clone is a deep copy
            var newEF = otherEmailField.clone();
            newEmails.push(newEF);
        }
        this.setEmails(newEmails);
    }


    // Deep copy the phone list
    var otherPhones = otherSessionDescription.getPhones(false);
    if (otherPhones != null) {
        var  newPhones = new Array();
        for (var i = 0; i <  otherPhones.length; i++) 
        {
            var otherPhoneField = otherPhones[i];
            // Phone field clone is a deep copy
            var newPF = otherPhoneField.clone();
            newPhones.push(newPF);
        }
        this.setPhones(newPhones);
    }


    // Deep copy the zone adjustments list
    var otherZAs = otherSessionDescription.getZoneAdjustments(false);
    if (otherZAs != null) {
        var newZAs = new Array();
        for (var i = 0; i <  newZAs.length; i++) 
        {
            var otherZoneField = newZAs[i];
            // Zone field clone is a deep copy
            var newZF = otherZoneField.clone();
            newZAs.push(newZF);
        }
        this.setZoneAdjustments(newZAs);
    }

    // Deep copy the bandwidth list
    var otherBandwidths = otherSessionDescription.getBandwidths(false);
    if (otherBandwidths != null) {
        var newBandwidths = new Array();
        for (var i = 0; i <  otherBandwidths.length; i++) 
        {
            var  otherBandwidthField = otherBandwidths[i];
            // Bandwidth field clone() is a shallow copy but object is not deep
            var newBF = otherBandwidthField.clone();
            newBandwidths.push(newBF);
        }
        this.setBandwidths(newBandwidths);
    }

    // Deep copy the attribute list
    var otherAttributes = otherSessionDescription.getAttributes(false);
    if (otherAttributes != null) {
        var newAttributes = new Array();
        for (var i = 0; i <  otherAttributes.length; i++) 
        {
            var otherAttributeField =  otherAttributes[i];
            // Attribute field clone() makes a deep copy but be careful: it may use reflection to copy one of its members
            var newBF = otherAttributeField.clone();
            newAttributes.push(newBF);
        }
        this.setAttributes(newAttributes);
    }

    // Deep copy the media descriptions
    var otherMediaDescriptions = otherSessionDescription.getMediaDescriptions(false);
    if (otherMediaDescriptions != null) {
        var newMDs = new Array();
        for (var i = 0; i <  otherMediaDescriptions.length; i++) 
        {
            var otherMediaDescription = otherMediaDescriptions[i];
            var  newMD = new MediaDescription();

            // Copy the media field
            var otherMediaField = otherMediaDescription.getMedia();
            if (otherMediaField != null) {
                // Media field clone() makes a shallow copy, so don't use clone()
                var newMF = new MediaField();
                newMF.setType(otherMediaField.getType());
                newMF.setPort(otherMediaField.getPort());
                newMF.setNports(otherMediaField.getNports());
                newMF.setProto(otherMediaField.getProto());
                var otherFormats = otherMediaField.getFormats();
                if (otherFormats != null) {
                    var newFormats = new Array();
                    for (var j = 0; j <  otherFormats.length; j++) 
                    {
                        var otherFormat = otherFormats[j];
                        // Convert all format objects to strings in order to avoid reflection
                        newFormats.push(String.valueOf(otherFormat));
                    }
                    newMF.setFormats(newFormats);
                }
                newMD.setMedia(newMF);
            }

            // Copy the information field (it's a shallow object, ok to clone)
            var otherInfoField = otherMediaDescription.getInformation();
            if (otherInfoField != null) {
                newMD.setInformation(otherInfoField.clone());
            }

            // Copy the connection field. OK to use clone(), already does a deep copy.
            var otherConnectionField = otherMediaDescription.getConnection();
            if (otherConnectionField != null) {
                newMD.setConnection(otherConnectionField.clone());
            }

            // Copy the bandwidth fields
            var otherBFs = otherMediaDescription.getBandwidths(false);
            if (otherBFs != null) {
                var newBFs = new Array();
                for (var j = 0; j <  otherBFs.length; j++) 
                {
                    var otherBF = otherBFs[j];
                    // BandwidthField is a shallow object, ok to use clone
                    newBFs.push(otherBF.clone());
                }
                newMD.setBandwidths(newBFs);
            }

            // Copy the key field (shallow object)
            var otherKeyField = otherMediaDescription.getKey();
            if (otherKeyField != null) {
                newMD.setKey(otherKeyField.clone());
            }

            // Copy the attributes
            var otherAFs = otherMediaDescription.getAttributeFields();
            if (otherAFs != null) {
                var newAFs = new Array();
                for (var j = 0; j <  otherAFs.length; j++) 
                {
                    var otherAF = otherAFs[j];
                    // AttributeField clone() already makes a deep copy, but be careful. It will use reflection
                    // unless the attribute is a String or any other immutable object.
                    newAFs.push(otherAF.clone());
                }
                newMD.setAttribute(newAFs);
            }
            newMDs.push(newMD);
        }
        this.setMediaDescriptions(newMDs);
    }
}


SessionDescription.prototype.addField=function(sdpField){
    if(sdpField!=null && SDPField.prototype.isPrototypeOf(sdpField)==true)
    {
        if(logger!=undefined) logger.debug("SessionDescription:addField(): sdpField="+sdpField.toString());
        if (sdpField instanceof VersionField) {
            this.versionField = sdpField;
        } else if (sdpField instanceof OriginField) {
            this.originField = sdpField;
        } else if (sdpField instanceof SessionNameField) {
            this.sessionNameField =  sdpField;
        } else if (sdpField instanceof InformationField) {
            if (this.currentMediaDescription != null)
                this.currentMediaDescription.setInformation(sdpField);
            else
                this.informationField = sdpField;
        } else if (sdpField instanceof URIField) {
            this.uriField = sdpField;
        } else if (sdpField instanceof ConnectionField) {
            if (this.currentMediaDescription != null)
                this.currentMediaDescription.setConnection(sdpField);
            else
                this.connectionField = sdpField;
        } else if (sdpField instanceof KeyField) {
            if (this.currentMediaDescription != null)
                this.currentMediaDescription.setKey(sdpField);
            else
                this.keyField = sdpField;
        } else if (sdpField instanceof EmailField) {
            this.getEmails(true).push(sdpField);
        } else if (sdpField instanceof PhoneField) {
            this.getPhones(true).push(sdpField);
        } else if (sdpField instanceof TimeField) {
            this.currentTimeDescription = new TimeDescription(sdpField);
            this.getTimeDescriptions(true).push(this.currentTimeDescription);
        } else if (sdpField instanceof RepeatField) {
            if (this.currentTimeDescription == null) {
                throw new new SdpException("SessionDescription.addField(): parsing error, no time atttribut specified"); 
            } else {
                this.currentTimeDescription.addRepeat(sdpField);
            }
        } else if (sdpField instanceof BandwidthField) {
            if (this.currentMediaDescription != null)
                this.currentMediaDescription.addBandwidth(sdpField);
            else
                this.getBandwidths(true).push(sdpField);
        } else if (sdpField instanceof AttributeField) {
            if (this.currentMediaDescription != null) {
                var af = sdpField;
                var s = af.getName();
                // Bug report from Andreas Bystrom
                this.currentMediaDescription.addAttribute(sdpField);
            } else {
                this.getAttributes(true).push(sdpField);
            }

        } else if (sdpField instanceof MediaField) {
            this.currentMediaDescription = new MediaDescription();
            this.getMediaDescriptions(true).push(this.currentMediaDescription);
            // Bug report from Andreas Bystrom
            this.currentMediaDescription.setMedia(sdpField);
        }
    }
    else throw new SdpException("SessionDescription.addField() requires SDPField object arguments");
}

/**
 * Creates and returns a deep copy of this object
 *
 * @return     a clone of this instance.
 * @exception  CloneNotSupportedException  if this instance cannot be cloned.
 */
SessionDescription.prototype.clone=function() {
    if(logger!=undefined) logger.debug("SessionDescription:clone()");
    try {
        return new SessionDescription(this);
    } catch (exception) {
        // throw this exception to indicate that this instance cannot be cloned
        throw new CloneNotSupportedException();
    }
}

/**
 * Returns the version of SDP in use. This corresponds to the v= field of
 * the SDP data.
 *
 * @return the integer version (-1 if not set).
 */
SessionDescription.prototype.getVersion=function() {
    if(logger!=undefined) logger.debug("SessionDescription:getVersion()");
    return this.versionField;
}

/**
 * Sets the version of SDP in use. This corresponds to the v= field of the
 * SDP data.
 *
 * @param versionField version - the integer version.
 * @throws SdpException if the version is null
 */
SessionDescription.prototype.setVersion=function(versionField) {
    if(versionField instanceof VersionField)
    {
        if(logger!=undefined) logger.debug("SessionDescription:setVersion():versionField="+versionField.toString().replace(/\r\n$/g,""));
        this.versionField = versionField;
    } else
        throw new SdpException("SessionDescription.setVersion() requires VersionField object argument");
}

/**
 * Returns information about the originator of the session. This corresponds
 * to the o= field of the SDP data.
 *
 * @return the originator data.
 */
SessionDescription.prototype.getOrigin=function() {
    if(logger!=undefined) logger.debug("SessionDescription:getOrigin()");
    return this.originField;
}

/**
 * Sets information about the originator of the session. This corresponds to
 * the o= field of the SDP data.
 *
 * @param originField origin - the originator data.
 * @throws SdpException if the origin is null
 */
SessionDescription.prototype.setOrigin=function(originField){
    if(originField instanceof OriginField)
    {
        if(logger!=undefined) logger.debug("SessionDescription:setOrigin():originField="+originField.toString().replace(/\r\n$/g,""));
        this.originField = originField;
    } else
        throw new SdpException("SessionDescription.setOrigin() requires OriginField object argument");
}


/**
 * Returns the name of the session. This corresponds to the s= field of the
 * SDP data.
 *
 * @return the session name.
 */
SessionDescription.prototype.getSessionName=function() {
    if(logger!=undefined) logger.debug("SessionDescription:getSessionName()");
    return this.sessionNameField;
}

/**
 * Sets the name of the session. This corresponds to the s= field of the SDP
 * data.
 *
 * @param sessionNameField name - the session name.
 * @throws SdpException if the sessionName is null
 */
SessionDescription.prototype.setSessionName=function(sessionNameField){
    if(sessionNameField instanceof SessionNameField)
    {
        if(logger!=undefined) logger.debug("SessionDescription:setSessionName():sessionNameField="+sessionNameField.toString().replace(/\r\n$/g,""));
        this.sessionNameField = sessionNameField;
    } else
        throw new SdpException("SessionDescription.setSessionName() requires SessionNameField object argument");
}

/**
 * Returns value of the info field (i=) of this object.
 *
 * @return info
 */
SessionDescription.prototype.getInfo=function() {
    if(logger!=undefined) logger.debug("SessionDescription:getInfo()");
    return this.informationField;
}

/**
 * Sets the i= field of this object.
 *
 * @param informationField s - new i= value; if null removes the field
 * @throws SdpException if the info is null
 */
SessionDescription.prototype.setInfo=function(informationField) {
    if(informationField instanceof InformationField)
    {
        if(logger!=undefined) logger.debug("SessionDescription:setInfo():informationField="+informationField.toString().replace(/\r\n$/g,""));
        this.informationField = informationField;
    } else
        throw new SdpException("SessionDescription.setInfo() requires InformationField object argument");
}

/**
 * Returns a uri to the location of more details about the session. This
 * corresponds to the u= field of the SDP data.
 *
 * @return the uri.
 */
SessionDescription.prototype.getURI=function() {
    if(logger!=undefined) logger.debug("SessionDescription:getURI()");
    return this.uriField;
}

/**
 * Sets the uri to the location of more details about the session. This
 * corresponds to the u= field of the SDP data.
 *
 * @param uriField uri - the uri.
 * @throws SdpException
 *             if the uri is null
 */
SessionDescription.prototype.setURI=function(uriField)  {
    if(uriField instanceof URIField)
    {
        if(logger!=undefined) logger.debug("SessionDescription:setURI():uriField="+uriField.toString().replace(/\r\n$/g,""));
        this.uriField = uriField;
    } else
        throw new SdpException("SessionDescription.setURI() requires URIField object argument");
}


/**
 * Returns an email address to contact for further information about the
 * session. This corresponds to the e= field of the SDP data.
 *
 * @param create
 *            boolean to set
 * @throws SdpParseException
 * @return the email address.
 */
SessionDescription.prototype.getEmails=function(create)  {
    if(logger!=undefined) logger.debug("SessionDescription:getEmails(): create="+create);
    if (this.emailFieldArray == null && create) {
        this.emailFieldArray = new Array();
    }
    return this.emailFieldArray;
}

/**
 * Sets a an email address to contact for further information about the
 * session. This corresponds to the e= field of the SDP data.
 *
 * @param emailFieldArray email - the email address.
 * @throws SdpException
 *             if the vector is null
 */
SessionDescription.prototype.setEmails=function(emailFieldArray){
    if(emailFieldArray instanceof Array)
    {
        if(logger!=undefined) logger.debug("SessionDescription:setEmails():emailFieldArray="+emailFieldArray.toString().replace(/\r\n$/g,""));
        for (var i = 0; i < emailFieldArray.length; i++) {
            var emailField = emailFieldArray[i];
            if (! (emailField instanceof EmailField)) {
                throw new SdpException("SessionDescription.setEmails() requires Array of EmailField object argument");
            }
        }
        this.emailFieldArray = emailFieldArray;
    } else throw new SdpException("SessionDescription.setEmails() requires Array object argument");
}

/**
 * Returns a phone number to contact for further information about the
 * session. This corresponds to the p= field of the SDP data.
 *
 * @param create
 *            boolean to set
 * @throws SdpException
 * @return the phone number.
 */
SessionDescription.prototype.getPhones=function(create) {
    if(logger!=undefined) logger.debug("SessionDescription:getPhones(): create="+create);
    if (this.phoneFieldArray == null) {
        if (create) this.phoneFieldArray = new Array();
    }
    return this.phoneFieldArray;
}

/**
 * Sets a phone number to contact for further information about the session.
 * This corresponds to the p= field of the SDP data.
 *
 * @param phoneFieldArray phone - the phone number.
 * @throws SdpException
 *             if the vector is null
 */
SessionDescription.prototype.setPhones=function(phoneFieldArray)  {
    if(phoneFieldArray instanceof Array)
    {
        if(logger!=undefined) logger.debug("SessionDescription:setPhones():phoneFieldArray="+phoneFieldArray.toString().replace(/\r\n$/g,""));
        for (var i = 0; i < phoneFieldArray.length; i++) {
            var phoneField = phoneFieldArray[i];
            if (! (phoneField instanceof PhoneField)) {
                throw new SdpException("SessionDescription.setPhones() requires Array of PhoneField object argument");
            }
        }
        this.phoneFieldArray = phoneFieldArray;
    } else throw new SdpException("SessionDescription.setPhones() requires Array object argument");
}

/**
 * Returns a TimeField indicating the start, stop, repetition and time zone
 * information of the session. This corresponds to the t= field of the SDP
 * data.
 *
 * @param create
 *            boolean to set
 * @throws SdpException
 * @return the Time Field.
 */
SessionDescription.prototype.getTimeDescriptions=function(create) {
    if(logger!=undefined) logger.debug("SessionDescription:getTimeDescriptions(): create="+create);
    if (this.timeFieldArray == null) {
        if (create) this.timeFieldArray = new Array();
    }
    return this.timeFieldArray;
}

/**
 * Sets a TimeField indicating the start, stop, repetition and time zone
 * information of the session. This corresponds to the t= field of the SDP
 * data.
 *
 * @param timeFieldArray time - the TimeField.
 * @throws SdpException
 *             if the vector is null
 */
SessionDescription.prototype.setTimes=function(timeFieldArray) {
    if(timeFieldArray instanceof Array)
    {
        if(logger!=undefined) logger.debug("SessionDescription:setTimes():timeFieldArray="+timeFieldArray.toString().replace(/\r\n$/g,""));
        for (var i = 0; i < timeFieldArray.length; i++) {
            var timeField = timeFieldArray[i];
            if (! (timeField instanceof TimeField)) {
                throw new SdpException("SessionDescription.setTimes() requires Array of TimeField object argument");
            }
        }
       this.timeFieldArray = timeFieldArray;
    } else throw new SdpException("SessionDescription.setTimes() requires Array object argument");
}

/**
 * Returns the time zone adjustments for the Session
 *
 * @param create
 *            boolean to set
 * @throws SdpException
 * @return a Hashtable containing the zone adjustments, where the key is the
 *         Adjusted Time Zone and the value is the offset.
 */
SessionDescription.prototype.getZoneAdjustments=function(create) {
    if(logger!=undefined) logger.debug("SessionDescription:getZoneAdjustments(): create="+create);
    if (this.zoneAdjustments == null) {
        if (create) this.zoneAdjustments = new Array();
    }
    return this.zoneAdjustments;
}

/**
 * Sets the time zone adjustment for the TimeField.
 *
 * @param zoneAdjustmentFieldArray
 *            zoneAdjustments - a Hashtable containing the zone adjustments,
 *            where the key is the Adjusted Time Zone and the value is the
 *            offset.
 * @throws SdpException
 *             if the vector is null
 */
SessionDescription.prototype.setZoneAdjustments=function(zoneAdjustmentFieldArray) {
    if(zoneAdjustmentFieldArray instanceof Array)
    {
        if(logger!=undefined) logger.debug("SessionDescription:setZoneAdjustments(): zoneAdjustmentFieldArray="+zoneAdjustmentFieldArray.toString().replace(/\r\n$/g,""));
        for (var i = 0; i < zoneAdjustmentFieldArray.length; i++) {
            var zoneAdjustmentField = zoneAdjustmentFieldArray[i];
            if (! (zoneAdjustmentField instanceof ZoneAdjustmentField)) {
                throw new SdpException("SessionDescription.setZoneAdjustments() requires Array of ZoneAdjustmentField object argument");
            }
        }
        this.zoneAdjustments = zoneAdjustmentFieldArray;
    }
    else throw new SdpException("SessionDescription.setZoneAdjustments() requires Array object argument");
}


/**
 * Returns the connection information associated with this object. This may
 * be null for SessionDescriptions if all Media objects have a connection
 * object and may be null for Media objects if the corresponding session
 * connection is non-null.
 *
 * @return connection
 */
SessionDescription.prototype.getConnection=function() {
    if(logger!=undefined) logger.debug("SessionDescription:getConnection()");
    return this.connectionField;
}

/**
 * Set the connection data for this entity.
 *
 * @param connectionField to set
 * @throws SdpException if the parameter is null
 */
SessionDescription.prototype.setConnection=function(connectionField){
    if(connectionField instanceof ConnectionField)
    {
        if(logger!=undefined) logger.debug("SessionDescription:setConnection(): connectionField="+connectionField.toString().replace(/\r\n$/g,""));
        this.connectionField = connectionField;
    }
    else throw new SdpException("SessionDescription.setConnection() requires ConnectionField object argument");
}

/**
 * Returns the Bandwidth of the specified type.
 *
 * @param create
 *            type - type of the Bandwidth to return
 * @return the Bandwidth or null if undefined
 */
SessionDescription.prototype.getBandwidths=function(create) {
    if(logger!=undefined) logger.debug("SessionDescription:getBandwidths(): create="+create);
    if (this.bandwidthFieldArray == null) {
        if (create) this.bandwidthFieldArray = new Array();
    }
    return this.bandwidthFieldArray;
}

/**
 * set the value of the Bandwidth with the specified type.
 *
 * @param bandwidthFieldArray
 *            to set
 * @throws SdpException
 *             if the vector is null
 */
SessionDescription.prototype.setBandwidths=function(bandwidthFieldArray) {
    if(bandwidthFieldArray instanceof Array)
    {
        if(logger!=undefined) logger.debug("SessionDescription:setBandwidths(): bandwidthFieldArray="+bandwidthFieldArray.toString().replace(/\r\n$/g,""));
        for (var i = 0; i < bandwidthFieldArray.length; i++) {
            var bandwidthField = bandwidthFieldArray[i];
            if (! (bandwidthField instanceof BandwidthField)) {
                throw new SdpException("SessionDescription.setBandwidths() requires Array of BandwidthField object argument");
            }
        }
        this.bandwidthFieldArray = bandwidthFieldArray;
    }
    else throw new SdpException("SessionDescription.setBandwidths() requires Array object argument");
}


/**
 * Returns the integer value of the specified bandwidth name.
 *
 * @param name
 *            name - the name of the bandwidth type
 * @throws SdpParseException
 * @return the value of the named bandwidth
 */
SessionDescription.prototype.getBandwidth=function(name){
    if(typeof(name) == 'string')
    {
        if(logger!=undefined) logger.debug("SessionDescription:getBandwidth(): name="+name);
        if( this.bandwidthFieldArray != null)
            for (var i = 0; i < this.bandwidthFieldArray.length; i++) {
                if (this.bandwidthFieldArray[i].getType() == name) {
                    return this.bandwidthFieldArray[i].getValue();
                }
            }
    } else throw new SdpException("SessionDescription.getBandwidth() requires string object argument");
    return -1;
}


/**
 * Sets the value of the specified bandwidth type.
 *
 * @param name  name - the name of the bandwidth type.
 * @param value value - the value of the named bandwidth type.
 * @throws SdpException
 *             if the name is null
 */
SessionDescription.prototype.setBandwidth=function(name, value) {
    if((typeof(name) == 'string') && (typeof(value) == 'number'))
    {
        if(logger!=undefined) logger.debug("SessionDescription:setBandwidth(): name="+name+", value="+value); 
        if (this.bandwidthFieldArray != null) {
            for (var i = 0; i < this.bandwidthFieldArray.length; i++) {
                if (this.bandwidthFieldArray[i].getType() == name) {
                    this.bandwidthFieldArray[i].setBandwidth(value);
                    return;
                }
            }
        } else this.bandwidthFieldArray= new Array();
        var bandwidthField = new BandwidthField();
        bandwidthField.setType(name);
        bandwidthField.setBandwidth(value);
        this.bandwidthFieldArray.push(bandwidthField);
    } else throw new SdpException("SessionDescription:setBandwidth() requires string and number arguments");
}

/**
 * Removes the specified bandwidth type.
 *
 * @param name: the name of the bandwidth type
 */
SessionDescription.prototype.removeBandwidth=function(name) {
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
    else throw new SdpException("SessionDescription:setBandwidth() removeBandwidth require string argument");
}


/**
 * Returns the key data.
 *
 * @return key
 */
SessionDescription.prototype.getKey=function() {
    if(logger!=undefined) logger.debug("SessionDescription:getKey()");
    return this.keyField;
}

/**
 * Sets encryption key information. This consists of a method and an
 * encryption key included inline.
 *
 * @param keyField
 *            key - the encryption key data; depending on method may be null
 * @throws SdpException
 *             if the parameter is null
 */
SessionDescription.prototype.setKey=function(keyField) {
    if(keyField instanceof KeyField)
    {
        if(logger!=undefined) logger.debug("SessionDescription:setKey(): keyField="+keyField);
        this.keyField = keyField;
    }
    else throw new SdpException("SessionDescription.setKey() requires KeyField object argument");
}


/**
 * Returns the value of the specified attribute.
 *
 * @param name
 *            name - the name of the attribute
 * @throws SdpParseException
 * @return the value of the named attribute
 */
SessionDescription.prototype.getAttribute=function(name) {
    if(typeof(name)=='string')
    {
        if(logger!=undefined) logger.debug("SessionDescription:getAttribute(): name="+name); 
        if(this.attributeFieldArray == null) return null;
        for (var i = 0; i < this.attributeFieldArray.length; i++) {
            if (this.attributeFieldArray[i].getName()==name) {
                return this.attributeFieldArray[i].getValue();
            }
        }
        return null;
    }
    else throw new SdpException("SessionDescription.getAttribute() requires string object argument");
}


/**
 * Returns the set of attributes for this Description as a Vector of
 * Attribute objects in the order they were parsed.
 *
 * @param create
 *            create - specifies whether to return null or a new empty
 *            Vector in case no attributes exists for this Description
 * @return attributes for this Description
 */
SessionDescription.prototype.getAttributes=function(create) {
    if(logger!=undefined) logger.debug("SessionDescription:getAttributes(): create="+create);
    if (this.attributeFieldArray == null) {
        if (create)  this.attributeFieldArray = new Array();
    }
    return this.attributeFieldArray;
}


/**
 * Removes the attribute specified by the value parameter.
 *
 * @param name
 *            name - the name of the attribute
 */
SessionDescription.prototype.removeAttribute=function(name) {
    if(typeof(name)=='string')
    {
        if(logger!=undefined) logger.debug("SessionDescription:removeAttribute(): name="+name);
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
    else throw new SdpException("SessionDescription.removeAttribute() requires string object argument");
}

/**
 * Sets the value of the specified attribute.
 *
 * @param name
 *            name - the name of the attribute.
 * @param value
 *            value - the value of the named attribute.
 * @throws SdpException
 *             if the name or the value is null
 */
SessionDescription.prototype.setAttribute=function(name, value)  {
    if(typeof(name)=='string') 
    {
        if(value==null) throw new SdpException("SessionDescription.setAttribute() requires not null value object argument");
        if(logger!=undefined) logger.debug("SessionDescription:setAttribute(): name="+name,", value="+value);
        if(this.attributeFieldArray == null) this.attributeFieldArray= new Array();
        for (var i = 0; i < this.attributeFieldArray.length; i++) {
            if (this.attributeFieldArray[i].getName()==name) {
            {
                this.attributeFieldArray[i].setValue(value);
                return;
            }
            }
        }
        var newAttributeField = new AttributeField();
        newAttributeField.setName(name);
        newAttributeField.setValue(value);
        this.attributeFieldArray.push(newAttributeField);
    }
    else throw new SdpException("SessionDescription.setAttribute() requires string argument for name");     
}

/**
 * Adds the specified Attribute to this Description object.
 *
 * @param attributesFieldArray - the attribute to add
 * @throws SdpException
 *             if the vector is null
 */
SessionDescription.prototype.setAttributes=function(attributeFieldArray) {
    if(attributeFieldArray instanceof Array)
    {
        if(logger!=undefined) logger.debug("SessionDescription:setAttributes(): attributes="+attributeFieldArray.toString().replace(/\r\n$/g,""));
        for (var i = 0; i < attributeFieldArray.length; i++) {
            var attributeField = attributeFieldArray[i];
            if (! (attributeField instanceof AttributeField)) {
                throw new SdpException("SessionDescription.setAttributes() requires Array of AttributeField object argument");
            }
        }
        this.attributeFieldArray = attributeFieldArray;
    }
    else throw new SdpException("SessionDescription.setAttributes() requires Array object argument");
}

/**
 * Adds a MediaDescription to the session description. These correspond to
 * the m= fields of the SDP data.
 *
 * @param create
 *            boolean to set
 * @throws SdpException
 * @return media - the field to add.
 */
SessionDescription.prototype.getMediaDescriptions=function(create) {
    if(logger!=undefined) logger.debug("SessionDescription:getMediaDescriptions(): create="+create);
    if (this.mediaDescriptionArray == null) {
        if (create) this.mediaDescriptionArray = new Array();
    }
    return this.mediaDescriptionArray;
}

/**
 * Removes all MediaDescriptions from the session description.
 *
 * @param mediaDescriptionArray
 *            to set
 * @throws SdpException
 *             if the parameter is null
 */
SessionDescription.prototype.setMediaDescriptions=function(mediaDescriptionArray) {
    if(mediaDescriptionArray instanceof Array)
    {
        if(logger!=undefined) logger.debug("SessionDescription:setMediaDescriptions(): attributes="+mediaDescriptionArray.toString().replace(/\r\n$/g,""));
        for (var i = 0; i < mediaDescriptionArray.length; i++) {
            var attributeField = mediaDescriptionArray[i];
            if (! (attributeField instanceof MediaDescription)) {
                throw new SdpException("SessionDescription.setMediaDescriptions() requires Array of MediaDescription object argument");
            }
        }
        this.mediaDescriptionArray = mediaDescriptionArray;
    }
    else throw new SdpException("SessionDescription.setAttributes() requires Array of MediaDescription object argument");
}


SessionDescription.prototype.encodeSDPFieldArray=function(array) {
    var encBuff = "";
    for (var i = 0; i < array.length; i++) encBuff+=array[i].encode();
    return encBuff;
}

/**
 * Returns the canonical string representation of the current
 * SessionDescrption. Acknowledgement - this code was contributed by Emil
 * Ivov.
 *
 * @return Returns the canonical string representation of the current SessionDescrption.
 */

SessionDescription.prototype.encode=function() {
    if(logger!=undefined) logger.debug("SessionDescription:encode()");
    var encodedString = "";
    encodedString+=this.versionField == null ? "" : this.versionField.encode();
    encodedString+=(this.originField == null) ? "" : this.originField.encode();
    encodedString+=this.sessionNameField == null ? "" : this.sessionNameField.encode();
    encodedString+=this.informationField == null ? "" : this.informationField.encode();
    encodedString+=this.uriField == null ? "" : this.uriField.encode();
    encodedString+=this.emailFieldArray == null ? "": this.encodeSDPFieldArray(this.emailFieldArray);
    encodedString+=this.phoneFieldArray == null ? "": this.encodeSDPFieldArray(this.phoneFieldArray);
    encodedString+=this.connectionField == null ? "" : this.connectionField.encode();
    encodedString+=this.bandwidthFieldArray == null ? "": this.encodeSDPFieldArray(this.bandwidthFieldArray);
    encodedString+=this.timeFieldArray == null ? "": this.encodeSDPFieldArray(this.timeFieldArray);
    encodedString+=this.zoneAdjustments == null ? "": this.encodeSDPFieldArray(this.zoneAdjustments);
    encodedString+=this.keyField == null ? "" : this.keyField.encode();
    encodedString+=this.attributeFieldArray == null ? "": this.encodeSDPFieldArray(this.attributeFieldArray);
    encodedString+=this.mediaDescriptionArray == null ? "": this.encodeSDPFieldArray(this.mediaDescriptionArray);
    return encodedString;
}


