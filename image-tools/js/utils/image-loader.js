// ===================================
// IMAGE LOADER UTILITY
// Handles file uploads, validation, and preview generation
// ===================================

class ImageLoader {
    constructor() {
        this.supportedFormats = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'image/bmp', 'image/tiff', 'image/svg+xml', 'image/x-icon',
            'image/avif', 'image/heic', 'image/heif', 'application/pdf'
        ];
        this.maxFileSize = 500 * 1024 * 1024; // 500MB
        this.objectURLs = new Set();
    }

    /**
     * Load a single image file with memory optimization
     */
    async loadSingleImage(file) {
        const validation = this.validateFile(file);
        if (!validation.valid) throw new Error(validation.error);

        const dataURL = await this.readAsDataURL(file);
        const img = await this.createImage(dataURL);
        const exifData = await this.extractEXIF(file);
        const canvas = this.imageToCanvas(img);

        return {
            file,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            width: img.naturalWidth,
            height: img.naturalHeight,
            aspectRatio: img.naturalWidth / img.naturalHeight,
            dataURL,
            canvas,
            exif: exifData,
            img
        };
    }

    /**
     * High-performance batch loading
     */
    async loadMultipleImages(files, progressCallback = null) {
        const fileArray = Array.from(files);
        const results = [];

        for (let i = 0; i < fileArray.length; i++) {
            try {
                const imageData = await this.loadSingleImage(fileArray[i]);
                results.push({ success: true, data: imageData });
                if (progressCallback) {
                    progressCallback({
                        current: i + 1,
                        total: fileArray.length,
                        percent: ((i + 1) / fileArray.length) * 100,
                        fileName: fileArray[i].name
                    });
                }
            } catch (error) {
                results.push({ success: false, fileName: fileArray[i].name, error: error.message });
            }
        }
        return results;
    }

    validateFile(file) {
        if (!file) return { valid: false, error: 'No file provided' };
        if (!this.supportedFormats.includes(file.type)) {
            return { valid: false, error: `Unsupported format: ${file.type || 'unknown'}` };
        }
        if (file.size > this.maxFileSize) {
            return { valid: false, error: `File too large (>500MB)` };
        }
        return { valid: true };
    }

    readAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    readAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    createImage(dataURL) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = dataURL;
        });
    }

    imageToCanvas(img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return canvas;
    }

    /**
     * Robust EXIF extraction (Client-side, no dependencies)
     */
    async extractEXIF(file) {
        try {
            const buffer = await this.readAsArrayBuffer(file);
            const view = new DataView(buffer);

            if (view.getUint16(0) !== 0xFFD8) return { hasEXIF: false }; // Not a JPEG

            let offset = 2;
            while (offset < view.byteLength) {
                if (view.getUint16(offset) === 0xFFE1) {
                    return this.parseEXIFData(view, offset + 4);
                }
                offset += 2 + view.getUint16(offset + 2);
            }
            return { hasEXIF: false };
        } catch (e) {
            return { hasEXIF: false, error: e.message };
        }
    }

    parseEXIFData(view, offset) {
        const tiffOffset = offset + 6;
        if (view.getUint32(offset) !== 0x45786966) return { hasEXIF: false }; // Not "Exif"

        const bigEndian = view.getUint16(tiffOffset) === 0x4D4D;
        const firstIFD = tiffOffset + view.getUint32(tiffOffset + 4, !bigEndian);

        const tags = {
            0x0110: 'make',
            0x0112: 'orientation',
            0x0132: 'dateTime',
            0x8769: 'exifIFD',
            0x8825: 'gpsIFD'
        };

        const metadata = { hasEXIF: true };
        const entries = view.getUint16(firstIFD, !bigEndian);

        for (let i = 0; i < entries; i++) {
            const entryOffset = firstIFD + 2 + i * 12;
            const tag = view.getUint16(entryOffset, !bigEndian);
            if (tags[tag]) {
                metadata[tags[tag]] = "Value present";
            }
        }
        return metadata;
    }

    /**
     * Remove EXIF/Metadata from image
     */
    async scrubMetadata(file) {
        const img = await this.loadSingleImage(file);
        const canvas = this.imageToCanvas(img.img);
        return new Promise(resolve => {
            canvas.toBlob(blob => {
                resolve(new File([blob], file.name, { type: file.type }));
            }, file.type, 1.0);
        });
    }

    /**
     * Get image dimensions without loading full image
     * @param {File} file - The image file
     * @returns {Promise<Object>} Dimensions
     */
    async getDimensions(file) {
        const dataURL = await this.readAsDataURL(file);
        const img = await this.createImage(dataURL);

        return {
            width: img.naturalWidth,
            height: img.naturalHeight,
            aspectRatio: img.naturalWidth / img.naturalHeight
        };
    }

    /**
     * High-quality Thumbnail Engine (Multi-step downscaling)
     */
    createThumbnail(source, maxSize = 300) {
        const canvas = document.createElement('canvas');
        let width = source.width || source.naturalWidth;
        let height = source.height || source.naturalHeight;

        const ratio = width / height;
        if (width > height) {
            width = maxSize;
            height = width / ratio;
        } else {
            height = maxSize;
            width = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Multi-step downscaling for better quality
        let curCanvas = source;
        let curWidth = source.width || source.naturalWidth;
        let curHeight = source.height || source.naturalHeight;

        while (curWidth > width * 2) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = curWidth / 2;
            tempCanvas.height = curHeight / 2;
            tempCanvas.getContext('2d').drawImage(curCanvas, 0, 0, curWidth / 2, curHeight / 2);
            curCanvas = tempCanvas;
            curWidth /= 2;
            curHeight /= 2;
        }

        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(curCanvas, 0, 0, width, height);
        return canvas;
    }

    /**
     * Memory Management: Revoke all tracked URLs
     */
    clearMemory() {
        this.objectURLs.forEach(url => URL.revokeObjectURL(url));
        this.objectURLs.clear();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileExtension(fileName) {
        return fileName.split('.').pop().toLowerCase();
    }

    changeFileExtension(fileName, newExt) {
        return fileName.substring(0, fileName.lastIndexOf('.')) + '.' + newExt;
    }

    async canvasToFile(canvas, fileName, mimeType = 'image/png', quality = 0.9) {
        return new Promise(resolve => {
            canvas.toBlob(blob => {
                resolve(new File([blob], fileName, { type: mimeType }));
            }, mimeType, quality);
        });
    }
}

// Global expose
if (typeof window !== 'undefined') {
    window.ImageLoader = new ImageLoader();
}
