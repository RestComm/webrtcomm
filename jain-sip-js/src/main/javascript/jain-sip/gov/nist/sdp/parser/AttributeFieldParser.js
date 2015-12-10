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
 *  Implementation of the JAIN-SIP AttributeFieldParser .
 *  @see  gov/nist/javax/sdp/parser/AttributeFieldParser.java 
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

/**
 * constructor
 */
function AttributeFieldParser() {
    this.classname="AttributeFieldParser";
}

AttributeFieldParser.prototype = new SDPParser();
AttributeFieldParser.prototype.constructor=AttributeFieldParser; 

AttributeFieldParser.prototype.parse =function(attributeFieldString) {
    if(typeof attributeFieldString == 'string')
    {
        if(logger!=undefined) logger.debug("AttributeFieldParser:parse(): attributeFieldString="+attributeFieldString);
        this.lexer = new LexerCore("charLexer", attributeFieldString);
        try {
            var attributeField = new AttributeField();
            this.lexer.match('a');
            this.lexer.SPorHT();
            this.lexer.match('=');
            this.lexer.SPorHT();
            var ptr = this.lexer.markInputPosition();
            try {
                var name = this.lexer.getNextToken(':');
                this.lexer.consume(1);
                var value = this.lexer.getRest();
                if(value!=null) value.trim();
                attributeField.setName(name);
                attributeField.setValue(value)
            } catch (exception) {
                this.lexer.rewindInputPosition(ptr);
                var name = this.lexer.getRest();
                if (name == null) throw new ParseException(this.lexer.getBuffer(),this.lexer.getPtr());
                attributeField.setName(name);
                attributeField.setValue(null)
            };
            this.lexer.SPorHT();
            return attributeField;
        } catch(exception) { 
            throw new SdpException("AttributeFieldParser.parse(): parsing exception:"+this.lexer.getBuffer(), this.lexer.getPtr());
        }
    }
    else throw new SdpException("AttributeFieldParser.parse() requires string object argument");
}
