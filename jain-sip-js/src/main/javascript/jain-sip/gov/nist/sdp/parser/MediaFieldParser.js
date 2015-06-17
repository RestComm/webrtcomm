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
 *  Implementation of the JAIN-SIP MediaFieldParser .
 *  @see  gov/nist/javax/sdp/parser/MediaFieldParser.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function MediaFieldParser() {
    this.classname="MediaFieldParser";
}

MediaFieldParser.prototype = new SDPParser();
MediaFieldParser.prototype.constructor=MediaFieldParser; 

MediaFieldParser.prototype.parse =function(mediaFieldString) {
    if(typeof mediaFieldString == 'string')
    {
        if(logger!=undefined) logger.debug("MediaFieldParser:parse(): mediaFieldString="+mediaFieldString);
        try {
            this.lexer = new LexerCore("charLexer", mediaFieldString);
            var mediaField = new MediaField();
            this.lexer.match('m');
            this.lexer.SPorHT();
            this.lexer.match('=');
            this.lexer.SPorHT();
            this.lexer.match(LexerCore.prototype.ID);
            var media = this.lexer.getNextToken();
            mediaField.setType(media.getTokenValue());
            this.lexer.SPorHT();
            this.lexer.match(LexerCore.prototype.ID);
            var port = this.lexer.getNextToken();
            mediaField.setPort(parseInt(port.getTokenValue()));
            this.lexer.SPorHT();
            // Some strange media formatting from Sun Ray systems with media
            // reported by Emil Ivov and Iain Macdonnell at Sun
            if (this.lexer.hasMoreChars() && this.lexer.lookAhead(1) == '\n')
                return mediaField;
            if (this.lexer.lookAhead(0) == '/') {
                // The number of ports is present:
                this.lexer.consume(1);
                this.lexer.match(LexerCore.prototype.ID);
                var portsNumber = this.lexer.getNextToken();
                mediaField.setNports(parseInt(portsNumber.getTokenValue()));
                this.lexer.SPorHT();
            }
            // proto = token *("/" token)
            this.lexer.match(LexerCore.prototype.ID);
            var token = this.lexer.getNextToken();
            var transport = token.getTokenValue();
            while (this.lexer.lookAhead(0) == '/') {
                this.lexer.consume(1);
                this.lexer.match(LexerCore.prototype.ID);
                var transportTemp = this.lexer.getNextToken();
                transport = transport + "/" + transportTemp.getTokenValue();
            }
            mediaField.setProtocol(transport);
            this.lexer.SPorHT();

            // The formats list:
            var formatList = new Array();
            while (this.lexer.hasMoreChars()) {
                var la = this.lexer.lookAhead(0);
                if (la == '\n' || la == '\r')
                    break;
                this.lexer.SPorHT();
                //while(lexer.lookAhead(0) == ' ') lexer.consume(1);
                this.lexer.match(LexerCore.prototype.ID);
                var tok = this.lexer.getNextToken();
                this.lexer.SPorHT();
                var format = tok.getTokenValue().trim();
                if(!format=="")
                    formatList.push(format);
            }
            mediaField.setFormats(formatList);
            return mediaField;
        } catch(exception) { 
            throw new SdpException("MediaFieldParser.parse(): parsing exception:"+this.lexer.getBuffer() + "at " + this.lexer.getPtr());
        }
    }
    else throw new SdpException("MediaFieldParser.parse() requires string object argument");
}
