class ImageConverter {
    constructor() {
        this.supportedConversions = {
            'png': ['jpg', 'jpeg', 'webp', 'bmp', 'svg'],
            'jpg': ['png', 'webp', 'bmp', 'svg'],
            'jpeg': ['png', 'webp', 'bmp', 'svg'],
            'webp': ['png', 'jpg', 'jpeg', 'svg'],
            'bmp': ['png', 'jpg', 'jpeg', 'webp', 'svg'],
            'svg': ['png', 'jpg', 'jpeg']
        };
    }

    /**
     * Advanced Canvas Conversion with algorithms
     */
    async convertCanvas(canvas, targetFormat, options = {}) {
        const {
            quality = 0.92,
            backgroundColor = '#FFFFFF',
            dither = false,
            quantize = false,
            colors = 256,
            preserveTransparency = true
        } = options;

        let finalCanvas = canvas;

        // Handle transparency
        const format = (targetFormat || 'png').toString().toLowerCase();
        if (['jpg', 'jpeg', 'bmp'].includes(format) && !preserveTransparency) {
            finalCanvas = this.addBackground(canvas, backgroundColor);
        }

        // Apply advanced algorithms if requested
        if (quantize || dither) {
            finalCanvas = this.applyAlgorithms(finalCanvas, { dither, quantize, colors });
        }

        const mimeType = this.formatToMimeType(targetFormat);
        return new Promise(resolve => finalCanvas.toBlob(resolve, mimeType, quality));
    }

    async convertFile(file, targetFormat, options = {}) {
        const imageData = await window.ImageLoader.loadSingleImage(file);
        const blob = await this.convertCanvas(imageData.canvas, targetFormat, options);
        const newFileName = window.ImageLoader.changeFileExtension(file.name, targetFormat);

        return {
            originalFile: file,
            convertedFile: new File([blob], newFileName, { type: this.formatToMimeType(targetFormat) }),
            originalSize: file.size,
            convertedSize: blob.size,
            compressionRatio: ((1 - (blob.size / file.size)) * 100).toFixed(2),
            dataURL: URL.createObjectURL(blob)
        };
    }

    /**
     * Floyd-Steinberg Dithering & Basic Quantization
     */
    applyAlgorithms(canvas, { dither, quantize, colors }) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        if (dither) {
            this.floydSteinbergDither(data, canvas.width, canvas.height);
        } else if (quantize) {
            this.simpleQuantize(data, colors);
        }

        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        newCanvas.getContext('2d').putImageData(imageData, 0, 0);
        return newCanvas;
    }

    floydSteinbergDither(data, w, h) {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                for (let c = 0; c < 3; c++) {
                    const oldP = data[i + c];
                    const newP = oldP < 128 ? 0 : 255;
                    data[i + c] = newP;
                    const err = oldP - newP;

                    if (x + 1 < w) data[i + 4 + c] += (err * 7) >> 4;
                    if (y + 1 < h) {
                        if (x > 0) data[i + (w - 1) * 4 + c] += (err * 3) >> 4;
                        data[i + w * 4 + c] += (err * 5) >> 4;
                        if (x + 1 < w) data[i + (w + 1) * 4 + c] += (err * 1) >> 4;
                    }
                }
            }
        }
    }

    simpleQuantize(data, colors) {
        // Simplified Posterization as a base for quantization
        const step = Math.floor(256 / Math.pow(colors, 1 / 3));
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.floor(data[i] / step) * step;
            data[i + 1] = Math.floor(data[i + 1] / step) * step;
            data[i + 2] = Math.floor(data[i + 2] / step) * step;
        }
    }

    addBackground(canvas, color) {
        const nc = document.createElement('canvas');
        nc.width = canvas.width; nc.height = canvas.height;
        const ctx = nc.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, nc.width, nc.height);
        ctx.drawImage(canvas, 0, 0);
        return nc;
    }

    formatToMimeType(format) {
        const map = {
            'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
            'webp': 'image/webp', 'bmp': 'image/bmp', 'gif': 'image/gif',
            'svg': 'image/svg+xml', 'ico': 'image/x-icon'
        };
        const f = (format || 'png').toString().toLowerCase();
        return map[f] || 'image/png';
    }

    /**
     * Placeholder for future Vectorization (Phase 1)
     */
    async vectorize(canvas) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
            <!-- Vectorization logic will be implemented in specific tool -->
        </svg>`;
    }
}

// Global expose
if (typeof window !== 'undefined') {
    window.ImageConverter = new ImageConverter();
}
