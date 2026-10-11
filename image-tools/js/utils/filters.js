// ===================================
// IMAGE FILTERS UTILITY
// Image manipulation and filters
// ===================================

class ImageFilters {
    constructor() {
        this.filterPresets = this.initializePresets();
    }

    /**
     * Apply brightness adjustment
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @param {number} value - Brightness (-100 to 100)
     * @returns {HTMLCanvasElement} Modified canvas
     */
    brightness(canvas, value) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const adjustment = value * 2.55; // Convert to 0-255 range

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, Math.min(255, data[i] + adjustment));     // R
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment)); // G
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment)); // B
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    /**
     * Apply contrast adjustment
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @param {number} value - Contrast (-100 to 100)
     * @returns {HTMLCanvasElement} Modified canvas
     */
    contrast(canvas, value) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const factor = (259 * (value + 255)) / (255 * (259 - value));

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
            data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
            data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    /**
     * Apply saturation adjustment
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @param {number} value - Saturation (-100 to 100)
     * @returns {HTMLCanvasElement} Modified canvas
     */
    saturation(canvas, value) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const saturation = value / 100;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;

            data[i] = Math.max(0, Math.min(255, gray + saturation * (r - gray)));
            data[i + 1] = Math.max(0, Math.min(255, gray + saturation * (g - gray)));
            data[i + 2] = Math.max(0, Math.min(255, gray + saturation * (b - gray)));
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    /**
     * Apply grayscale filter
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @returns {HTMLCanvasElement} Modified canvas
     */
    grayscale(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = data[i + 1] = data[i + 2] = gray;
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    /**
     * Apply sepia filter
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @returns {HTMLCanvasElement} Modified canvas
     */
    sepia(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
            data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
            data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    /**
     * Apply blur effect
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @param {number} radius - Blur radius
     * @returns {HTMLCanvasElement} Modified canvas
     */
    blur(canvas, radius = 3) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Simple box blur
        const blurred = new Uint8ClampedArray(data);
        const kernelSize = radius * 2 + 1;
        const kernelSum = kernelSize * kernelSize;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0;

                for (let ky = -radius; ky <= radius; ky++) {
                    for (let kx = -radius; kx <= radius; kx++) {
                        const px = Math.min(width - 1, Math.max(0, x + kx));
                        const py = Math.min(height - 1, Math.max(0, y + ky));
                        const i = (py * width + px) * 4;

                        r += data[i];
                        g += data[i + 1];
                        b += data[i + 2];
                        a += data[i + 3];
                    }
                }

                const i = (y * width + x) * 4;
                blurred[i] = r / kernelSum;
                blurred[i + 1] = g / kernelSum;
                blurred[i + 2] = b / kernelSum;
                blurred[i + 3] = a / kernelSum;
            }
        }

        const blurredImageData = new ImageData(blurred, width, height);
        ctx.putImageData(blurredImageData, 0, 0);

        return canvas;
    }

    /**
     * Apply sharpen effect
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @param {number} amount - Sharpen amount (0-1)
     * @returns {HTMLCanvasElement} Modified canvas
     */
    sharpen(canvas, amount = 0.5) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Sharpen kernel
        const kernel = [
            0, -amount, 0,
            -amount, 1 + 4 * amount, -amount,
            0, -amount, 0
        ];

        const output = new Uint8ClampedArray(data);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) { // RGB only
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const i = ((y + ky) * width + (x + kx)) * 4 + c;
                            const ki = (ky + 1) * 3 + (kx + 1);
                            sum += data[i] * kernel[ki];
                        }
                    }
                    const i = (y * width + x) * 4 + c;
                    output[i] = Math.max(0, Math.min(255, sum));
                }
            }
        }

        const outputImageData = new ImageData(output, width, height);
        ctx.putImageData(outputImageData, 0, 0);

        return canvas;
    }

    /**
     * Apply edge detection
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @returns {HTMLCanvasElement} Modified canvas
     */
    edgeDetection(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Sobel operator
        const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

        const output = new Uint8ClampedArray(data.length);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0, gy = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const i = ((y + ky) * width + (x + kx)) * 4;
                        const ki = (ky + 1) * 3 + (kx + 1);
                        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

                        gx += gray * sobelX[ki];
                        gy += gray * sobelY[ki];
                    }
                }

                const magnitude = Math.sqrt(gx * gx + gy * gy);
                const i = (y * width + x) * 4;

                output[i] = output[i + 1] = output[i + 2] = Math.min(255, magnitude);
                output[i + 3] = 255;
            }
        }

        const outputImageData = new ImageData(output, width, height);
        ctx.putImageData(outputImageData, 0, 0);

        return canvas;
    }

    /**
     * Apply noise reduction
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @param {number} strength - Reduction strength (1-10)
     * @returns {HTMLCanvasElement} Modified canvas
     */
    noiseReduction(canvas, strength = 3) {
        // Use median filter for noise reduction
        return this.medianFilter(canvas, strength);
    }

    /**
     * Apply median filter
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @param {number} radius - Filter radius
     * @returns {HTMLCanvasElement} Modified canvas
     */
    medianFilter(canvas, radius = 1) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        const output = new Uint8ClampedArray(data);

        for (let y = radius; y < height - radius; y++) {
            for (let x = radius; x < width - radius; x++) {
                for (let c = 0; c < 3; c++) {
                    const values = [];

                    for (let ky = -radius; ky <= radius; ky++) {
                        for (let kx = -radius; kx <= radius; kx++) {
                            const i = ((y + ky) * width + (x + kx)) * 4 + c;
                            values.push(data[i]);
                        }
                    }

                    values.sort((a, b) => a - b);
                    const median = values[Math.floor(values.length / 2)];
                    const i = (y * width + x) * 4 + c;
                    output[i] = median;
                }
            }
        }

        const outputImageData = new ImageData(output, width, height);
        ctx.putImageData(outputImageData, 0, 0);

        return canvas;
    }

    /**
     * Apply multiple filters in sequence
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @param {Array} filters - Array of filter objects {name, params}
     * @returns {HTMLCanvasElement} Modified canvas
     */
    applyFilters(canvas, filters) {
        let result = canvas;

        for (const filter of filters) {
            if (typeof this[filter.name] === 'function') {
                result = this[filter.name](result, ...filter.params);
            }
        }

        return result;
    }

    /**
     * Clone canvas
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @returns {HTMLCanvasElement} Cloned canvas
     */
    cloneCanvas(canvas) {
        const clone = document.createElement('canvas');
        clone.width = canvas.width;
        clone.height = canvas.height;
        const ctx = clone.getContext('2d');
        ctx.drawImage(canvas, 0, 0);
        return clone;
    }

    /**
     * Initialize filter presets
     * @returns {Object} Filter presets
     */
    initializePresets() {
        return {
            vintage: [
                { name: 'sepia', params: [] },
                { name: 'contrast', params: [-10] },
                { name: 'brightness', params: [5] }
            ],
            dramatic: [
                { name: 'contrast', params: [30] },
                { name: 'saturation', params: [20] }
            ],
            cool: [
                { name: 'saturation', params: [-20] },
                { name: 'brightness', params: [10] }
            ],
            warm: [
                { name: 'brightness', params: [15] },
                { name: 'saturation', params: [10] }
            ]
        };
    }

    /**
     * Apply preset filter
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @param {string} presetName - Preset name
     * @returns {HTMLCanvasElement} Modified canvas
     */
    applyPreset(canvas, presetName) {
        const preset = this.filterPresets[presetName];
        if (!preset) {
            throw new Error(`Preset '${presetName}' not found`);
        }

        return this.applyFilters(canvas, preset);
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.ImageFilters = new ImageFilters();
}
