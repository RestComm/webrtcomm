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
 *  Implementation of the JAIN-SIP SDPObject .
 *  @see  gov/nist/javax/sdp/fields/SDPObject.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function SDPObject() {
    if(logger!=undefined) logger.debug("SDPObject:SDPObject()");
    this.classname="SDPObject";
    
}
 
SDPObject.prototype = new GenericObject();
SDPObject.prototype.constructor=SDPObject; 

SDPObject.prototype.encode =function() {
    if(logger!=undefined) logger.debug("SDPObject:encode()");
    throw new SdpException("SDPObject:encode() not implemented");
}

SDPObject.prototype.toString =function() {
    if(logger!=undefined) logger.debug("SDPObject:toString()");
    return this.encode();
}

SDPObject.prototype.equals =function(that) {
    if(logger!=undefined) logger.debug("SDPObject:equals()");
    throw new SdpException("SDPObject:equals() not implemented");
}

SDPObject.prototype.match =function(other) {
    if(logger!=undefined) logger.debug("SDPObject:other()");
    throw new SdpException("SDPObject:other() not implemented");
}

SDPObject.prototype.clone =function(other) {
    if(logger!=undefined) logger.debug("SDPObject:clone()");
     var objClone;
    if (this.constructor == Object){
        objClone = new this.constructor(); 
    }else{
        objClone = new this.constructor(this.valueOf()); 
    }
    for(var key in this){
        if ( objClone[key] != this[key] ){ 
            if ( typeof(this[key]) == 'object' ){ 
                objClone[key] = this[key].clone();
            }else{
                objClone[key] = this[key];
            }
        }
    }
    objClone.toString = this.toString;
    objClone.valueOf = this.valueOf;
    return objClone; 
}
