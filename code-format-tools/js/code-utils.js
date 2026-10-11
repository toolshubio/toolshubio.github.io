/**
 * CodeUtils - Core logic for Code & Format Tools
 * 100% Client-side, high-performance utilities
 */
const CodeUtils = {
    /**
     * Minify HTML using simple rules (not full parser to maintain speed)
     */
    minifyHTML: (code) => {
        return code
            .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
            .replace(/\s+/g, ' ')           // Collapse whitespace
            .replace(/>\s+</g, '><')        // Remove space between tags
            .trim();
    },

    /**
     * Minify CSS
     */
    minifyCSS: (code) => {
        return code
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s*([{}|:;,])\s*/g, '$1') // Remove spaces around delimiters
            .replace(/\s+/g, ' ')            // Collapse whitespace
            .trim();
    },

    /**
     * Minify JavaScript (Basic)
     */
    minifyJS: (code) => {
        // Simple regex-based minifier (Advanced would use an AST library like Terser)
        return code
            .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1') // Remove comments
            .replace(/\s+/g, ' ')                                // Collapse whitespace
            .trim();
    },

    /**
     * Format / Beautify (Placeholders for 3rd party libs integration)
     * Note: In production, these should call js-beautify or similar
     */
    beautifyHTML: (code) => {
        // Basic indentation if library not available
        let indent = 0;
        return code.replace(/(<[^>]+>)/g, (match) => {
            if (match.match(/^<\//)) indent--;
            let res = '  '.repeat(Math.max(0, indent)) + match + '\n';
            if (match.match(/^<[^/!][^>]*[^/]>$/)) indent++;
            return res;
        }).trim();
    },

    /**
     * Encoding / Decoding
     */
    base64Encode: (str) => btoa(unescape(encodeURIComponent(str))),
    base64Decode: (str) => decodeURIComponent(escape(atob(str))),

    urlEncode: (str) => encodeURIComponent(str),
    urlDecode: (str) => decodeURIComponent(str),

    /**
     * Analysis
     */
    getStats: (code) => {
        return {
            chars: code.length,
            lines: code.split('\n').filter(l => l.trim()).length,
            size: (new Blob([code]).size / 1024).toFixed(2) + ' KB'
        };
    }
};

if (typeof module !== 'undefined') module.exports = CodeUtils;
