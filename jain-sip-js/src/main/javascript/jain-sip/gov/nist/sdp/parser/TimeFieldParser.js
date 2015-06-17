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
 *  Implementation of the JAIN-SIP TimeFieldParser .
 *  @see  gov/nist/javax/sdp/parser/TimeFieldParser.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function TimeFieldParser() {
    this.classname="TimeFieldParser";
}

TimeFieldParser.prototype = new SDPParser();
TimeFieldParser.prototype.constructor=TimeFieldParser; 

TimeFieldParser.prototype.parse =function(timeFieldString) {
    if(typeof timeFieldString == 'string')
    {
        if(logger!=undefined) logger.debug("TimeFieldParser:parse(): timeFieldString="+timeFieldString);
        try {
            this.lexer = new LexerCore("charLexer", timeFieldString);
            this.lexer.match('t');
            this.lexer.SPorHT();
            this.lexer.match('=');
            this.lexer.SPorHT();
            var timeField = new TimeField();
            timeField.setStartTime(this.parseTime());
            this.lexer.SPorHT();
            timeField.setStopTime(this.parseTime());
            return timeField;
        } catch(exception) { 
            throw new SdpException("TimeFieldParser.parse(): parsing exception:"+this.lexer.getBuffer() + "at " + this.lexer.getPtr());
        }
    }
    else throw new SdpException("TimeFieldParser.parse() requires string object argument");
}


TimeFieldParser.prototype.parseTime =function() {
        var time = this.lexer.number();
        if ( time.length > 18)
            time = time.substring( time.length - 18);
        return parseInt(time);
} 
