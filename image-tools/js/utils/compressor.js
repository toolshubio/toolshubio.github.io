// ===================================
// IMAGE COMPRESSOR UTILITY
// Handles image compression with various strategies
// ===================================

class ImageCompressor {
    constructor() {
        this.defaultQuality = 0.92;
        this.minQuality = 0.1;
        this.maxQuality = 1.0;
    }

    /**
     * Compress image to target quality
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @param {string} format - Output format
     * @param {number} quality - Quality (0-1)
     * @returns {Promise<Object>} Compression result
     */
    async compressToQuality(canvas, format = 'jpeg', quality = 0.92) {
        const mimeType = this.formatToMimeType(format);

        const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, mimeType, quality);
        });

        return {
            blob,
            size: blob.size,
            quality,
            dataURL: URL.createObjectURL(blob)
        };
    }

    /**
     * Compress image to target file size using binary search
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @param {number} targetSize - Target size in bytes
     * @param {string} format - Output format
     * @param {number} tolerance - Size tolerance (0-1)
     * @returns {Promise<Object>} Compression result
     */
    async compressToSize(canvas, targetSize, format = 'jpeg', tolerance = 0.05) {
        let minQuality = this.minQuality;
        let maxQuality = this.maxQuality;
        let attempts = 0;
        const maxAttempts = 15;

        let bestResult = null;
        let closestDiff = Infinity;

        while (attempts < maxAttempts) {
            const quality = (minQuality + maxQuality) / 2;
            const result = await this.compressToQuality(canvas, format, quality);

            const diff = result.size - targetSize;
            const relativeDiff = Math.abs(diff) / targetSize;

            // Track best result
            if (Math.abs(diff) < closestDiff) {
                closestDiff = Math.abs(diff);
                bestResult = result;
            }

            // Check if we're within tolerance
            if (relativeDiff <= tolerance && diff <= 0) {
                return {
                    ...result,
                    targetSize,
                    achieved: true,
                    attempts: attempts + 1,
                    difference: diff
                };
            }

            // Adjust quality range
            if (result.size > targetSize) {
                maxQuality = quality;
            } else {
                minQuality = quality;
            }

            attempts++;
        }

        // Return best result if exact match not found
        return {
            ...bestResult,
            targetSize,
            achieved: false,
            attempts,
            difference: bestResult.size - targetSize,
            warning: bestResult.size > targetSize
                ? 'Could not achieve target size. Consider resizing image dimensions.'
                : 'Achieved smaller size than target.'
        };
    }

    /**
     * Lossless compression (optimize without quality loss)
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @param {string} format - Output format (png recommended)
     * @returns {Promise<Object>} Compression result
     */
    async compressLossless(canvas, format = 'png') {
        // For lossless, use PNG with quality 1.0
        const result = await this.compressToQuality(canvas, 'png', 1.0);

        // Additional optimization could be done here with pngquant-like algorithms
        // For now, we return the standard PNG compression

        return {
            ...result,
            lossless: true,
            optimized: false // Would be true if using advanced optimization
        };
    }

    /**
     * Compress with dimension reduction if needed
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @param {number} targetSize - Target size in bytes
     * @param {string} format - Output format
     * @returns {Promise<Object>} Compression result
     */
    async compressWithResize(canvas, targetSize, format = 'jpeg') {
        // First try without resizing
        let result = await this.compressToSize(canvas, targetSize, format);

        if (result.achieved) {
            return { ...result, resized: false };
        }

        // If not achieved, try with dimension reduction
        const reductionSteps = [0.9, 0.8, 0.7, 0.6, 0.5];

        for (const scale of reductionSteps) {
            const scaledCanvas = this.scaleCanvas(canvas, scale);
            result = await this.compressToSize(scaledCanvas, targetSize, format);

            if (result.achieved) {
                return {
                    ...result,
                    resized: true,
                    originalWidth: canvas.width,
                    originalHeight: canvas.height,
                    newWidth: scaledCanvas.width,
                    newHeight: scaledCanvas.height,
                    scaleFactor: scale
                };
            }
        }

        // Return best attempt
        return {
            ...result,
            resized: true,
            warning: 'Target size very aggressive. Further quality/size reduction applied.'
        };
    }

    /**
     * Batch compress multiple images
     * @param {Array} files - Array of files
     * @param {Object} options - Compression options
     * @param {Function} progressCallback - Progress callback
     * @returns {Promise<Array>} Array of compression results
     */
    async batchCompress(files, options = {}, progressCallback = null) {
        const {
            mode = 'quality', // 'quality' or 'size'
            quality = 0.92,
            targetSize = null,
            format = 'jpeg',
            removeMetadata = true
        } = options;

        const results = [];

        for (let i = 0; i < files.length; i++) {
            try {
                const imageData = await window.ImageLoader.loadSingleImage(files[i]);
                let result;

                if (mode === 'quality') {
                    result = await this.compressToQuality(imageData.canvas, format, quality);
                } else if (mode === 'size' && targetSize) {
                    result = await this.compressToSize(imageData.canvas, targetSize, format);
                } else {
                    result = await this.compressLossless(imageData.canvas);
                }

                // Create file
                const newFileName = window.ImageLoader.changeFileExtension(
                    files[i].name,
                    format
                );

                const compressedFile = new File([result.blob], newFileName, {
                    type: result.blob.type
                });

                results.push({
                    success: true,
                    originalFile: files[i],
                    compressedFile,
                    originalSize: files[i].size,
                    compressedSize: result.size,
                    compressionRatio: ((1 - (result.size / files[i].size)) * 100).toFixed(2),
                    savedBytes: files[i].size - result.size,
                    ...result
                });

                if (progressCallback) {
                    progressCallback({
                        current: i + 1,
                        total: files.length,
                        percent: ((i + 1) / files.length) * 100,
                        fileName: files[i].name
                    });
                }
            } catch (error) {
                results.push({
                    success: false,
                    fileName: files[i].name,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Scale canvas by factor
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @param {number} scale - Scale factor (0-1)
     * @returns {HTMLCanvasElement} Scaled canvas
     */
    scaleCanvas(canvas, scale) {
        const newWidth = Math.round(canvas.width * scale);
        const newHeight = Math.round(canvas.height * scale);

        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = newWidth;
        scaledCanvas.height = newHeight;

        const ctx = scaledCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, newWidth, newHeight);

        return scaledCanvas;
    }

    /**
     * Calculate compression statistics
     * @param {number} originalSize - Original file size
     * @param {number} compressedSize - Compressed file size
     * @returns {Object} Statistics
     */
    calculateStats(originalSize, compressedSize) {
        const savedBytes = originalSize - compressedSize;
        const compressionRatio = ((1 - (compressedSize / originalSize)) * 100);

        return {
            originalSize,
            compressedSize,
            savedBytes,
            compressionRatio: compressionRatio.toFixed(2),
            compressionFactor: (originalSize / compressedSize).toFixed(2),
            originalSizeFormatted: window.ImageLoader.formatFileSize(originalSize),
            compressedSizeFormatted: window.ImageLoader.formatFileSize(compressedSize),
            savedBytesFormatted: window.ImageLoader.formatFileSize(savedBytes)
        };
    }

    /**
     * Format to MIME type
     * @param {string} format - Format
     * @returns {string} MIME type
     */
    formatToMimeType(format) {
        const mimeMap = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'webp': 'image/webp'
        };

        return mimeMap[format.toLowerCase()] || 'image/jpeg';
    }

    /**
     * Estimate final compressed size (rough approximation)
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {string} format - Format
     * @param {number} quality - Quality
     * @returns {number} Estimated size in bytes
     */
    estimateSize(canvas, format, quality) {
        // Rough estimation based on pixel count and quality
        const pixels = canvas.width * canvas.height;
        const bytesPerPixel = format === 'png' ? 3 : 1.5;
        const qualityFactor = quality || 1;

        return Math.round(pixels * bytesPerPixel * qualityFactor);
    }

    /**
     * Get recommended quality for target size
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {number} targetSize - Target size in bytes
     * @param {string} format - Format
     * @returns {number} Recommended quality
     */
    recommendQuality(canvas, targetSize, format) {
        const estimatedFullSize = this.estimateSize(canvas, format, 1.0);
        const ratio = targetSize / estimatedFullSize;

        // Clamp between min and max quality
        return Math.max(this.minQuality, Math.min(this.maxQuality, ratio));
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.ImageCompressor = new ImageCompressor();
}
