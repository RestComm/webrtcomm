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
 *  Implementation of the JAIN-SIP InformationFieldParser .
 *  @see  gov/nist/javax/sdp/parser/InformationFieldParser.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function InformationFieldParser() {
    this.classname="InformationFieldParser";
}

InformationFieldParser.prototype = new SDPParser();
InformationFieldParser.prototype.constructor=InformationFieldParser; 

InformationFieldParser.prototype.parse =function(informationFieldString) {
    if(typeof informationFieldString == 'string')
    {
        if(logger!=undefined) logger.debug("InformationFieldParser:parse(): informationFieldString="+informationFieldString);
        try {
            this.lexer = new LexerCore("charLexer", informationFieldString);
            this.lexer.match('i');
            this.lexer.SPorHT();
            this.lexer.match('=');
            this.lexer.SPorHT();
            var informationField = new InformationField();
            informationField.setInformation(this.lexer.getRest().trim());
            return informationField;
        } catch(exception) { 
            throw new SdpException("InformationFieldParser.parse(): parsing exception:"+this.lexer.getBuffer(), this.lexer.getPtr());
        }
    }
    else throw new SdpException("InformationFieldParser.parse() requires string object argument");
}
