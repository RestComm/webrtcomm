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
 *  Implementation of the JAIN-SIP SessionNameField .
 *  @see  gov/nist/javax/sdp/fields/SessionNameField.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function TimeField() {
    if(logger!=undefined) logger.debug("TimeField:TimeField()");
    this.classname="TimeField";
    this.fieldName=this.TIME_FIELD;
    this.startTime=0;
    this.stopTime=0;
}
 
TimeField.prototype = new SDPField();
TimeField.prototype.constructor=TimeField; 

TimeField.prototype.getStartTime =function() {
    if(logger!=undefined) logger.debug("TimeField:getStartTime()");
    return this.startTime;
}

TimeField.prototype.getStopTime =function() {
    if(logger!=undefined) logger.debug("TimeField:getStopTime()");
    return this.stopTime;
}

/**
 * Set the startTime member
 */
TimeField.prototype.setStartTime =function(startTime) {
    if(typeof(startTime) == 'number') 
    {
        if(logger!=undefined) logger.debug("SessionNameField:setStartTime():startTime="+startTime);
        this.startTime=startTime;
    }
    else throw new SdpException("TimeField.setStartTime() requires string type argument");
}

/**
 * Set the stopTime member
 */
TimeField.prototype.setStopTime =function(stopTime) {
     if(typeof(stopTime) == 'number') 
    {
        if(logger!=undefined) logger.debug("TimeField:setStopTime():stopTime="+stopTime);
        this.startTime=stopTime;
    }
    else throw new SdpException("TimeField.setStopTime() requires string type argument");
}


/** Returns whether the field will be output as a typed time
 * or a integer value.
 *
 *     Typed time is formatted as an integer followed by a unit character.
 * The unit indicates an appropriate multiplier for
 *     the integer.
 *
 *     The following unit types are allowed.
 *          d - days (86400 seconds)
 *          h - hours (3600 seconds)
 *          m - minutes (60 seconds)
 *          s - seconds ( 1 seconds)
 * @return true, if the field will be output as a
 * typed time; false, if as an integer value.
 */
TimeField.prototype.getTypedTime =function() {
    if(logger!=undefined) logger.debug("TimeField:getTypedTime()");
    return false;
}

/** Sets whether the field will be output as a typed time or a integer value.
 *
 *     Typed time is formatted as an integer followed by a unit character.
 * The unit indicates an appropriate multiplier for
 *     the integer.
 *
 *     The following unit types are allowed.
 *          d - days (86400 seconds)
 *          h - hours (3600 seconds)
 *          m - minutes (60 seconds)
 *          s - seconds ( 1 seconds)
 * @param typedTime typedTime - if set true, the start and stop times will
 * be output in an optimal typed time format; if false, the
 *          times will be output as integers.
 */
TimeField.prototype.setTypedTime =function(typedTime) {
    if(logger!=undefined) logger.debug("TimeField:setTypedTime()");
}


/** Returns whether the start and stop times were set to zero (in NTP).
 * @return boolean
 */
TimeField.prototype.isZero =function() {
    if(logger!=undefined) logger.debug("TimeField:isZero()");
    return (this.getStartTime()==0 && this.getStopTime()==0);
}

/** Sets the start and stop times to zero (in NTP).
 */
TimeField.prototype.setZero =function() {
    if(logger!=undefined) logger.debug("TimeField:setZero()");
    this.setStopTime(0);
    this.setStartTime(0);
}

/**
 *  Get the string encoded version of this object
 * @since v1.0
 */
TimeField.prototype.encode =function() {
    if(logger!=undefined) logger.debug("TimeField:encode()");
    var encodedString=this.TIME_FIELD;
    encodedString+=this.startTime;
    encodedString+=Separators.prototype.SP;
    encodedString+=this.stopTime;
    encodedString+=Separators.prototype.NEWLINE;
    return encodedString; 
}

