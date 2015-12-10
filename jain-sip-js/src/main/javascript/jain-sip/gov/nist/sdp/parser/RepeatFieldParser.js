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
 *  Implementation of the JAIN-SIP RepeatFieldParser .
 *  @see  gov/nist/javax/sdp/parser/RepeatFieldParser.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function RepeatFieldParser() {
    this.classname="RepeatFieldParser";
}

RepeatFieldParser.prototype = new SDPParser();
RepeatFieldParser.prototype.constructor=RepeatFieldParser; 

RepeatFieldParser.prototype.parse =function(repeatFieldString) {
    if(typeof repeatFieldString == 'string')
    {
        if(logger!=undefined) logger.debug("RepeatFieldParser:parse(): repeatFieldString="+repeatFieldString);
        try {
            this.lexer = new LexerCore("charLexer", repeatFieldString);
            this.lexer.match('r');
            this.lexer.SPorHT();
            this.lexer.match('=');
            this.lexer.SPorHT();

            var repeatField = new RepeatField();
            this.lexer.match(LexerCore.prototype.ID);
            var repeatInterval = this.lexer.getNextToken();
            this.lexer.SPorHT();
            var typedTime = this.parseTypedTime(repeatInterval.getTokenValue());
            repeatField.setRepeatInterval(typedTime);
            this.lexer.match(LexerCore.prototype.ID);
            var activeDuration = this.lexer.getNextToken();
            this.lexer.SPorHT();
            typedTime = this.parseTypedTime(activeDuration.getTokenValue());
            repeatField.setActiveDuration(typedTime);

            // The offsets list:
            /*Patch 117 */
            while (this.lexer.hasMoreChars()) {
                var la = this.lexer.lookAhead(0);
                if (la == '\n' || la == '\r')
                    break;
                this.lexer.match(LexerCore.prototype.ID);
                var offsets = this.lexer.getNextToken();
                this.lexer.SPorHT();
                typedTime = this.parseTypedTime(offsets.getTokenValue());
                repeatField.addOffset(typedTime);
            }
            return repeatField;
        } catch(exception) { 
            throw new SdpException("RepeatFieldParser.parse(): parsing exception:"+this.lexer.getBuffer() + "at " + this.lexer.getPtr());
        }
    }
    else throw new SdpException("RepeatFieldParser.parse() requires string object argument");
}


/** Get the typed time.
     *
     * @param  tokenValue to convert into a typed time.
     * @return the typed time
     */
RepeatFieldParser.prototype.parseTypedTime =function(typedTimeString) {
    var typedTime = new TypedTime();
    if (typedTimeString.endsWith("d")) {
        typedTime.setUnit("d");
        var t = typedTimeString.replace('d', ' ');
        typedTime.setTime(parseInt(t.trim()));
    } else if (typedTimeString.endsWith("h")) {
        typedTime.setUnit("h");
        var t = typedTimeString.replace('h', ' ');
        typedTime.setTime(parseInt(t.trim()));
    } else if (typedTimeString.endsWith("m")) {
        typedTime.setUnit("m");
        var t = typedTimeString.replace('m', ' ');
        typedTime.setTime(parseInt(t.trim()));
    } else {
        typedTime.setUnit("s");
        if (typedTimeString.endsWith("s")) {
            var t = typedTimeString.replace('s', ' ');
            typedTime.setTime(parseInt(t.trim()));
        } else
            typedTime.setTime(parseInt(typedTimeString.trim()));
    }
    return typedTime;
}
