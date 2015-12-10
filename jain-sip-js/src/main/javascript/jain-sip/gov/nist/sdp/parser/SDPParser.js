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
 *  Implementation of the JAIN-SIP SDPParser .
 *  @see  gov/nist/javax/sdp/parser/SDPParser.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function SDPParser() {
    if(logger!=undefined) logger.debug("SDPParser:SDPParser()");
    this.classname="SDPParser";
}

SDPParser.prototype.constructor=SDPParser; 

SDPParser.prototype.parse =function(sdpString) {
    if(typeof sdpString == 'string')
    {
        if(logger!=undefined) logger.debug("SDPParser:parse():sdpString="+sdpString);
        var sessionDescription = new SessionDescription();
        var start = 0;
        var line = null;
        // Return trivially if there is no sdp announce message
        // to be parsed. Bruno Konik noticed this bug.
        // Strip off leading and trailing junk.
        var trimedSdpString = sdpString.trim() + "\r\n";
        // Bug fix by Andreas Bystrom.
        while (start < trimedSdpString.length) {
            // Major re-write by Ricardo Borba.
            var lfPos = trimedSdpString.indexOf("\n", start);
            var crPos = trimedSdpString.indexOf("\r", start);
            if (lfPos > 0 && crPos < 0) {
                // there are only "\n" separators
                line = trimedSdpString.substring(start, lfPos);
                start = lfPos + 1;
            } else if (lfPos < 0 && crPos > 0) {
                //bug fix: there are only "\r" separators
                line = trimedSdpString.substring(start, crPos);
                start = crPos + 1;
            } else if (lfPos > 0 && crPos > 0) {
                // there are "\r\n" or "\n\r" (if exists) separators
                if (lfPos > crPos) {
                    // assume "\r\n" for now
                    line = trimedSdpString.substring(start, crPos);
                    // Check if the "\r" and "\n" are close together
                    if (lfPos == crPos + 1) {
                        start = lfPos + 1; // "\r\n"
                    } else {
                        start = crPos + 1; // "\r" followed by the next record and a "\n" further away
                    }
                } else {
                    // assume "\n\r" for now
                    line = trimedSdpString.substring(start, lfPos);
                    // Check if the "\n" and "\r" are close together
                    if (crPos == lfPos + 1) {
                        start = crPos + 1; // "\n\r"
                    } else {
                        start = lfPos + 1; // "\n" followed by the next record and a "\r" further away
                    }
                }
            } else if (lfPos < 0 && crPos < 0) { // end
                break;
            }
                       
            var sdpFieldParser = SDPParserFactory.prototype.createParser(line);
            var sdpField = sdpFieldParser.parse(line);
            sessionDescription.addField(sdpField);
        }
        return sessionDescription;
    }
    else throw new SdpException("SDPParser.parse() requires string object argument");
}


SDPParser.prototype.parseNameValue =function(separator){ 
    if(logger!=undefined) logger.debug("SDPParser:parseNameValue(): separator="+separator);
    if(separator==null)
    {
        var nameValue=this.parseNameValue("=")
        return nameValue;
    }
    else
    {
        this.lexer.match(LexerCore.prototype.ID);
        var name = this.lexer.getNextToken();
        this.lexer.SPorHT();
        try {
            var quoted = false;
            var la = this.lexer.lookAhead(0);
            if (la == separator) {
                this.lexer.consume(1);
                this.lexer.SPorHT();
                var str = null;
                var isFlag = false;
                if (this.lexer.lookAhead(0) == '\"') {
                    str = this.lexer.quotedString();
                    quoted = true;
                } else {
                    this.lexer.match(LexerCore.prototype.ID);
                    var value = this.lexer.getNextToken();
                    str = value.tokenValue;
                    if (str == null) {
                        str = "";
                        isFlag = true;
                    }
                }
                var nameValue = new NameValue(name.tokenValue, str, isFlag);
                if (quoted) {
                    nameValue.setQuotedValue();
                }
                return nameValue;
            } else {
                nameValue=new NameValue(name.tokenValue, "", true);
                return nameValue;
            }
        } catch(exception) {    
            console.error("SDPParser:parseNameValue(): catched exception:"+exception);
            nameValue=new NameValue(name.tokenValue, null, false);
            return nameValue;
        }
    }
    return nameValue;
}

