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
 *  Implementation of the JAIN-SIP RepeatField .
 *  @see  gov/nist/javax/sdp/fields/RepeatField.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function RepeatField() {
    if(logger!=undefined) logger.debug("RepeatField:RepeatField()");
    this.classname="RepeatField";
    this.fieldName=this.REPEAT_FIELD;
    this.repeatInterval=null;
    this.activeDuration=null;
    this.offsets= new Array();
}
 
RepeatField.prototype = new SDPField();
RepeatField.prototype.constructor=RepeatField; 

RepeatField.prototype.setRepeatInterval =function(repeatInterval) {
    if(repeatInterval instanceof TypedTime) 
    {
        if(logger!=undefined) logger.debug("RepeatField:setRepeatInterval(): repeatInterval="+repeatInterval);
        this.repeatInterval = repeatInterval;
    }
    else if(typeof(repeatInterval)=='number') 
    {
        if(logger!=undefined) logger.debug("RepeatField:setRepeatInterval(): repeatInterval="+repeatInterval);
        if (repeatInterval < 0)
            throw new SdpException("RepeatField.setRepeatInterval() requires positive number object argument");
        else {
            if (this.repeatInterval == null)
                this.repeatInterval = new TypedTime();
            this.repeatInterval.setTime(repeatInterval);
        }
    }
    else throw SdpException("RepeatField.setRepeatInterval() requires number or TypedTime object argument")  
}

RepeatField.prototype.setActiveDuration =function(activeDuration) {
    if(activeDuration instanceof TypedTime)
    {
        if(logger!=undefined) logger.debug("RepeatField:setActiveDuration(): activeDuration="+activeDuration);
        this.activeDuration = activeDuration;
    }
    else  if(typeof(activeDuration)=='number') 
    {
        if(logger!=undefined) logger.debug("RepeatField:setActiveDuration(): activeDuration="+activeDuration);
        if (activeDuration < 0)
            throw new SdpException("RepeatField.setActiveDuration() requires positive number object argument");
        else {
            if (this.activeDuration == null)
                this.activeDuration = new TypedTime();
            this.activeDuration.setTime(activeDuration);
        }
    }
    else throw SdpException("RepeatField.setActiveDuration() requires number or TypedTime object argument");  
}

RepeatField.prototype.addOffset =function(offset) {
    if(offset instanceof TypedTime) 
    {
        if(logger!=undefined) logger.debug("RepeatField:addOffset(): offset="+offset);
        this.offsets.push(offset);
    }
    else throw SdpException("RepeatField.addOffset() requires TypedTime object argument")
}

RepeatField.prototype.getOffsets =function() {
    if(logger!=undefined) logger.debug("RepeatField:getOffsets()");
    return this.offsets;
}

/** Returns the "repeat interval" in seconds.
 * @throws SdpParseException
 * @return the "repeat interval" in seconds.
 */
RepeatField.prototype.getRepeatInterval =function() {
    if(logger!=undefined) logger.debug("RepeatField:getRepeatInterval()");
    if (this.repeatInterval == null)
        return -1;
    else {
        return this.repeatInterval.getTime();
    }
}

/** Returns the "active duration" in seconds.
 * @throws SdpParseException
 * @return the "active duration" in seconds.
 */
RepeatField.prototype.getActiveDuration =function() {
    if(logger!=undefined) logger.debug("RepeatField:getActiveDuration()");
    if (this.activeDuration == null)
        return -1;
    else {
        return this.activeDuration.getTime();
    }
}

/** Returns the list of offsets. These are relative to the start-time given
     * in the Time object (t=
     *     field) with which this RepeatTime is associated.
     * @throws SdpParseException
     * @return the list of offsets
     */
RepeatField.prototype.getOffsetArray =function() {
    if(logger!=undefined) logger.debug("RepeatField:getOffsetArray()");
    var result = new Array()
    for (var i = 0; i < this.offsets.length; i++) {
        var typedTime = this.offsets[i];
        result[i] = typedTime.getTime();
    }
    return result;
}

/** Set the list of offsets. These are relative to the start-time given in the
     * Time object (t=
     *     field) with which this RepeatTime is associated.
     * @param offsets array of repeat time offsets
     * @throws SdpException
     */
RepeatField.prototype.setOffsetArray =function(offsets) {
    if(logger!=undefined) logger.debug("RepeatField:setOffsetArray()");
    if(offsets instanceof Array) 
    {
        for (var i = 0; i < this.offsets.length; i++) {
            var typedTime = new TypedTime();
            typedTime.setTime(offsets[i]);
            this.addOffset(typedTime);
        }
    }
    else throw SdpException("RepeatField.setOffsetArray() requires Array object argument")
}

/** Returns whether the field will be output as a typed time or a integer value.
     *
     *     Typed time is formatted as an integer followed by a unit character. The unit indicates an
     *     appropriate multiplier for the integer.
     *
     *     The following unit types are allowed.
     *          d - days (86400 seconds)
     *          h - hours (3600 seconds)
     *          m - minutes (60 seconds)
     *          s - seconds ( 1 seconds)
     * @throws SdpParseException
     * @return true, if the field will be output as a typed time; false, if as an integer value.
     */
RepeatField.prototype.getTypedTime =function() {
    if(logger!=undefined) logger.debug("RepeatField:getTypedTime()");
    return true;
}

/** Sets whether the field will be output as a typed time or a integer value.
     *
     *     Typed time is formatted as an integer followed by a unit character. The unit indicates an
     *     appropriate multiplier for the integer.
     *
     *     The following unit types are allowed.
     *          d - days (86400 seconds)
     *          h - hours (3600 seconds)
     *          m - minutes (60 seconds)
     *          s - seconds ( 1 seconds)
     * @param typedTime typedTime - if set true, the start and stop times will be output in an optimal typed
     *          time format; if false, the times will be output as integers.
     */
RepeatField.prototype.setTypedTime =function(typedTime) {
    if(logger!=undefined) logger.debug("RepeatField:setTypedTime():typedTime="+typedTime);
}

RepeatField.prototype.encode =function(typedTime) {
    if(logger!=undefined) logger.debug("RepeatField:encode()");
    var encodedString =this.REPEAT_FIELD;
    encodedString += this.repeatInterval.encode();
    encodedString += Separators.prototype.SP
    encodedString +=this.activeDuration.encode();
    
    for (var i = 0; i < this.offsets.length; i++) {
        var offset = this.offsets[i];
        encodedString+=Separators.prototype.SP
        encodedString+=offset.encode();
    }
    encodedString+=Separators.prototype.NEWLINE;
    return encodedString;
}

RepeatField.prototype.clone =function() {
    if(logger!=undefined) logger.debug("RepeatField:clone()");
    var retval = new RepeatField();
    if (this.repeatInterval != null)
        retval.repeatInterval = this.repeatInterval.clone();
    if (this.activeDuration != null)
        retval.activeDuration =  this.activeDuration.clone();
    if (this.offsets != null)
        retval.offsets = this.offsets.clone();
    return retval;
}
