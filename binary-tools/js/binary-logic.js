const BinaryLogic = {
    // String to Binary
    textToBinary: (text) => {
        return text.split('').map(char => {
            return char.charCodeAt(0).toString(2).padStart(8, '0');
        }).join(' ');
    },

    // Binary to String
    binaryToText: (binary) => {
        const cleanBinary = binary.replace(/[^01]/g, '');
        const bytes = cleanBinary.match(/.{1,8}/g) || [];
        return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
    },

    // String to HEX
    textToHex: (text) => {
        return text.split('').map(char => {
            return char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
        }).join(' ');
    },

    // HEX to String
    hexToText: (hex) => {
        const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
        const bytes = cleanHex.match(/.{1,2}/g) || [];
        return bytes.map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
    },

    // Text to ASCII
    textToAscii: (text) => {
        return text.split('').map(char => char.charCodeAt(0)).join(' ');
    },

    // ASCII to Text
    asciiToText: (ascii) => {
        const codes = ascii.split(/[\s,]+/).filter(x => x.length > 0);
        return codes.map(code => String.fromCharCode(parseInt(code))).join('');
    },

    // Binary to HEX
    binaryToHex: (binary) => {
        const decimal = parseInt(binary.replace(/\s/g, ''), 2);
        if (isNaN(decimal)) return '';
        return decimal.toString(16).toUpperCase();
    },

    // HEX to Binary
    hexToBinary: (hex) => {
        const decimal = parseInt(hex.replace(/0x/g, ''), 16);
        if (isNaN(decimal)) return '';
        return decimal.toString(2);
    },

    // Binary to Decimal
    binaryToDecimal: (binary) => {
        return parseInt(binary.replace(/\s/g, ''), 2).toString();
    },

    // Decimal to Binary
    decimalToBinary: (decimal) => {
        return parseInt(decimal).toString(2);
    },

    // HEX to Decimal
    hexToDecimal: (hex) => {
        return parseInt(hex.replace(/0x/g, ''), 16).toString();
    },

    // Decimal to HEX
    decimalToHex: (decimal) => {
        return parseInt(decimal).toString(16).toUpperCase();
    },

    // ASCII to Binary
    asciiToBinary: (ascii) => {
        const codes = ascii.split(/[\s,]+/).filter(x => x.length > 0);
        return codes.map(code => parseInt(code).toString(2).padStart(8, '0')).join(' ');
    },

    // Binary to ASCII
    binaryToAscii: (binary) => {
        const cleanBinary = binary.replace(/[^01]/g, '');
        const bytes = cleanBinary.match(/.{1,8}/g) || [];
        return bytes.map(byte => parseInt(byte, 2)).join(' ');
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BinaryLogic;
} else {
    window.BinaryLogic = BinaryLogic;
}
