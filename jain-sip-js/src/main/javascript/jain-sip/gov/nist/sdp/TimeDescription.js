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
 *  Implementation of the JAIN-SIP  TimeDescription.
 *  @see  gov/nist/javax/sdp/TimeDescriptionImpl.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
 
 
/**
 * constructor
 *
 * @param timeField (optional)  time field to create this descrition from
 */
function TimeDescription() {
    if(logger!=undefined) logger.debug("TimeDescription:TimeDescription()");
    this.classname="TimeDescription";
    if(arguments.length==1)
    {
        if (arguments[0] instanceof TimeField) {
            this.timeField=arguments[0];
        } else throw new SdpException("TimeDescription():TimeDescription() requires TimeField object in argument");

    }
    else this.timeField=new TimeField();
    this.repeatList=new Array();
}

/**
 * Returns the Time field.
 *
 * @return Time
 */
TimeDescription.prototype.getTime =function(){
    if(logger!=undefined) logger.debug("TimeDescription:getTime()");
    return this.timeField;
}

/**
 * Sets the Time field.
 *
 * @public
 * @param timeField Time to set
 * @throws SdpException if the time is null
 */
TimeDescription.prototype.setTime =function(timeField) {
    if(timeField instanceof TimeField) 
    {
        if(logger!=undefined) logger.debug("TimeDescription:setTime():timeField="+timeField);
        this.timeField= timeField;
    }
    else throw new SdpException("TimeDescription.setTime() requires TimeField object argument") 
}


/**
 * Returns the list of repeat times (r= fields) specified in the
 * SessionDescription.
 *
 * @public
 * @param create boolean to set
 * @return Vector
 */
TimeDescription.prototype.getRepeatTimes=function(create) {
    if(logger!=undefined) logger.debug("TimeDescription:getRepeatTimes()");
    if(create) this.repeatList=new Array();
    return this.repeatList;
}

/**
 * Returns the list of repeat times (r= fields) specified in the
 * SessionDescription.
 *
 * @public
 * @param repeatTimes Vector to set
 * @throws SdpExceptionif the parameter is null
 */
TimeDescription.prototype.setRepeatTimes=function(repeatTimes) {
    if(logger!=undefined) logger.debug("TimeDescription:setRepeatTimes(): repeatTimes="+repeatTimes);
    this.repeatList = repeatTimes;
}

/**
 * Add a repeat field.
 *
 * @public
 * @param repeatField -- repeat field to add.
 */
TimeDescription.prototype.addRepeat=function(repeatField) {
    if(repeatField instanceof RepeatField) 
    {
        if(logger!=undefined) logger.debug("TimeDescription:addRepeat():repeatField="+repeatField);
        this.repeatList.push(repeatField);
    }
    else throw new SdpException("TimeDescription.addRepeat() requires RepeatField object argument") 
}

/**
 * Retun string representation.
 * @public
 * @return string
 */
TimeDescription.prototype.encode=function() {
    if(logger!=undefined) logger.debug("TimeDescription:encode()");
    var retval = this.timeField.encode();
    for (var i = 0; i < this.repeatList.length; i++) {
        var repeatField = this.repeatList[i];
        retval += repeatField.encode();
    }
    return retval;
}

