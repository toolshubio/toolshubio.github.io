/* ============================================
   Text Utilities - Core Text Manipulation Functions
   ============================================ */

const TextUtils = {
    // === CASE TRANSFORMATIONS ===
    toUpperCase: (text) => text.toUpperCase(),
    toLowerCase: (text) => text.toLowerCase(),

    toTitleCase: (text) => {
        return text.replace(/\w\S*/g, txt =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    },

    toSentenceCase: (text) => {
        return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
    },

    toCamelCase: (text) => {
        return text.toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
    },

    toPascalCase: (text) => {
        const camel = TextUtils.toCamelCase(text);
        return camel.charAt(0).toUpperCase() + camel.slice(1);
    },

    toSnakeCase: (text) => {
        return text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    },

    toKebabCase: (text) => {
        return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    },

    toAlternatingCase: (text) => {
        return text.split('').map((char, i) =>
            i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
        ).join('');
    },

    toInverseCase: (text) => {
        return text.split('').map(char =>
            char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
        ).join('');
    },

    toConstantCase: (text) => {
        return text.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
    },

    toDotCase: (text) => {
        return text.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    },

    toPathCase: (text) => {
        return text.toLowerCase().replace(/\s+/g, '/').replace(/[^a-z0-9/]/g, '');
    },

    // === TEXT STATISTICS ===
    countWords: (text) => {
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        return words.length;
    },

    countCharacters: (text, includeSpaces = true) => {
        return includeSpaces ? text.length : text.replace(/\s/g, '').length;
    },

    countSentences: (text) => {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        return sentences.length;
    },

    countParagraphs: (text) => {
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
        return paragraphs.length;
    },

    countLines: (text) => {
        return text.split('\n').length;
    },

    estimateReadingTime: (text) => {
        const wordsPerMinute = 200;
        const words = TextUtils.countWords(text);
        const minutes = Math.ceil(words / wordsPerMinute);
        return minutes;
    },

    // === UNICODE TEXT GENERATORS ===
    toBoldText: (text) => {
        const boldMap = {
            'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴',
            'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻',
            'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂',
            'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
            'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚',
            'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡',
            'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨',
            'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
            '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰',
            '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
        };
        return text.split('').map(c => boldMap[c] || c).join('');
    },

    toSmallCaps: (text) => {
        const smallCapsMap = {
            'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ',
            'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ',
            'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ',
            'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
        };
        return text.toLowerCase().split('').map(c => smallCapsMap[c] || c).join('');
    },

    toSuperscript: (text) => {
        const superMap = {
            'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ',
            'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ',
            'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ',
            'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
            '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
            '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
        };
        return text.toLowerCase().split('').map(c => superMap[c] || c).join('');
    },

    toSubscript: (text) => {
        const subMap = {
            'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ',
            'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ',
            'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ',
            '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
            '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
        };
        return text.toLowerCase().split('').map(c => subMap[c] || c).join('');
    },

    toUpsideDown: (text) => {
        const upsideDownMap = {
            'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ',
            'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u',
            'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n',
            'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
            'A': '∀', 'B': 'B', 'C': 'Ɔ', 'D': 'D', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': '⅁',
            'H': 'H', 'I': 'I', 'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N',
            'O': 'O', 'P': 'Ԁ', 'Q': 'Q', 'R': 'ᴚ', 'S': 'S', 'T': '⊥', 'U': '∩',
            'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
            '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ',
            '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0',
            '.': '˙', ',': "'", "'": ',', '"': '„', '!': '¡', '?': '¿',
            '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{'
        };
        return text.split('').map(c => upsideDownMap[c] || c).reverse().join('');
    },

    // === TEXT REVERSAL ===
    reverseByCharacter: (text) => text.split('').reverse().join(''),

    reverseByWord: (text) => text.split(/\s+/).reverse().join(' '),

    reverseByLine: (text) => text.split('\n').reverse().join('\n'),

    // === LINE OPERATIONS ===
    sortLines: (text, ascending = true) => {
        const lines = text.split('\n');
        lines.sort((a, b) => ascending ? a.localeCompare(b) : b.localeCompare(a));
        return lines.join('\n');
    },

    shuffleLines: (text) => {
        const lines = text.split('\n');
        for (let i = lines.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [lines[i], lines[j]] = [lines[j], lines[i]];
        }
        return lines.join('\n');
    },

    removeDuplicateLines: (text) => {
        const lines = text.split('\n');
        const unique = [...new Set(lines)];
        return unique.join('\n');
    },

    removeEmptyLines: (text) => {
        return text.split('\n').filter(line => line.trim() !== '').join('\n');
    },

    // === TEXT CLEANING ===
    removeExtraSpaces: (text) => text.replace(/\s+/g, ' ').trim(),

    removeAllSpaces: (text) => text.replace(/\s/g, ''),

    trimLines: (text) => text.split('\n').map(line => line.trim()).join('\n'),

    removeHtmlTags: (text) => text.replace(/<[^>]*>/g, ''),

    removeNumbers: (text) => text.replace(/[0-9]/g, ''),

    removeSpecialChars: (text) => text.replace(/[^a-zA-Z0-9\s]/g, ''),

    // === INVISIBLE CHARACTERS ===
    insertZeroWidthSpace: (text, afterEvery = 1) => {
        const zwsp = '\u200B';
        return text.split('').map((c, i) => (i + 1) % afterEvery === 0 ? c + zwsp : c).join('');
    },

    detectInvisibleChars: (text) => {
        const invisibleChars = {
            '\u200B': 'Zero Width Space',
            '\u200C': 'Zero Width Non-Joiner',
            '\u200D': 'Zero Width Joiner',
            '\uFEFF': 'Byte Order Mark',
            '\u00A0': 'Non-Breaking Space',
            '\u2060': 'Word Joiner'
        };
        const found = [];
        for (const [char, name] of Object.entries(invisibleChars)) {
            const count = (text.match(new RegExp(char, 'g')) || []).length;
            if (count > 0) found.push({ char, name, count });
        }
        return found;
    },

    // === TEXT SUMMARIZATION (Frequency-based) ===
    summarize: (text, sentenceCount = 3) => {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        if (sentences.length <= sentenceCount) return text;

        // Calculate word frequency
        const wordFreq = {};
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        words.forEach(word => {
            if (word.length > 3) wordFreq[word] = (wordFreq[word] || 0) + 1;
        });

        // Score sentences
        const scored = sentences.map(sentence => {
            const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
            const score = sentenceWords.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
            return { sentence: sentence.trim(), score };
        });

        // Sort by score and take top sentences
        scored.sort((a, b) => b.score - a.score);
        const topSentences = scored.slice(0, sentenceCount);

        // Reorder by original position
        const result = sentences.filter(s => topSentences.some(t => t.sentence === s.trim()));
        return result.join(' ');
    },

    // === SPELL CHECK SIMULATION (Basic dictionary) ===
    commonMisspellings: {
        'teh': 'the', 'recieve': 'receive', 'occured': 'occurred',
        'seperate': 'separate', 'definately': 'definitely', 'accomodate': 'accommodate',
        'occassion': 'occasion', 'wierd': 'weird', 'untill': 'until',
        'becuase': 'because', 'thier': 'their', 'freind': 'friend'
    },

    spellCheck: (text) => {
        let corrected = text;
        const corrections = [];
        for (const [wrong, right] of Object.entries(TextUtils.commonMisspellings)) {
            const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
            if (regex.test(corrected)) {
                corrections.push({ wrong, right });
                corrected = corrected.replace(regex, right);
            }
        }
        return { text: corrected, corrections };
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextUtils;
}
