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
 *  Implementation of the JAIN-SIP KeyFieldParser .
 *  @see  gov/nist/javax/sdp/parser/KeyFieldParser.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function KeyFieldParser() {
    this.classname="KeyFieldParser";
}

KeyFieldParser.prototype = new SDPParser();
KeyFieldParser.prototype.constructor=KeyFieldParser; 

KeyFieldParser.prototype.parse =function(keyFieldString) {
    if(typeof keyFieldString == 'string')
    {
        if(logger!=undefined) logger.debug("KeyFieldParser:parse(): keyFieldString="+keyFieldString);
        try {
            this.lexer = new LexerCore("charLexer", keyFieldString);
            this.lexer.match('k');
            this.lexer.SPorHT();
            this.lexer.match('=');
            this.lexer.SPorHT();
            var keyField = new KeyField();
            //Espen: Stealing the approach from AttributeFieldParser from from here...
            var nameValue = new NameValue();
            var ptr = this.lexer.markInputPosition();
            try {
                var name = this.lexer.getNextToken(':');
                this.lexer.consume(1);
                var value = this.lexer.getRest();
                nameValue = new NameValue(name.trim(), value.trim());
            } catch (exception) {
                this.lexer.rewindInputPosition(ptr);
                var rest = this.lexer.getRest();
                if (rest == null) throw SdpException("KeyFieldParser.parse(): parsing exception:"+this.lexer.getBuffer() + "at " +this.lexer.getPtr());
                nameValue = new NameValue(rest.trim(), null);
            }
            keyField.setMethod(nameValue.getName());
            keyField.setKey(nameValue.getValueAsObject());
            this.lexer.SPorHT();
            return keyField;
        } catch(exception) { 
            throw new SdpException("KeyFieldParser.parse(): parsing exception:"+this.lexer.getBuffer() + "at " + this.lexer.getPtr());
        }
    }
    else throw new SdpException("KeyFieldParser.parse() requires string object argument");
}