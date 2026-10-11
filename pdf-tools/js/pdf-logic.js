/**
 * PDFTools - Core Logic for Client-Side PDF Operations
 * Uses pdf-lib for manipulation and pdf.js for rendering/conversion.
 */

const PDFTools = {
    // CDN URLs for dependencies
    LIBS: {
        PDF_LIB: 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js',
        PDF_JS: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
        FONTAWESOME: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
    },

    /**
     * Merge multiple PDF files into one
     */
    async mergePDFs(pdfFiles) {
        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();

        for (const file of pdfFiles) {
            const pdfBytes = await file.arrayBuffer();
            const pdf = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        return await mergedPdf.save();
    },

    /**
     * Split PDF by page ranges
     */
    async splitPDF(pdfFile, ranges) {
        const { PDFDocument } = PDFLib;
        const pdfBytes = await pdfFile.arrayBuffer();
        const results = [];

        for (const range of ranges) {
            const srcDoc = await PDFDocument.load(pdfBytes);
            const newDoc = await PDFDocument.create();
            const indices = this.parseRange(range, srcDoc.getPageCount());
            const copiedPages = await newDoc.copyPages(srcDoc, indices);
            copiedPages.forEach(page => newDoc.addPage(page));
            results.push(await newDoc.save());
        }

        return results;
    },

    /**
     * Rotate pages
     */
    async rotatePDF(pdfFile, degree, pageIndices = null) {
        const { PDFDocument, degrees } = PDFLib;
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();

        const indices = pageIndices || pages.map((_, i) => i);
        indices.forEach(idx => {
            const page = pages[idx];
            if (page) {
                const currentRotation = page.getRotation().angle;
                page.setRotation(degrees(currentRotation + degree));
            }
        });

        return await pdfDoc.save();
    },

    /**
     * Unlock PDF (Remove password)
     */
    async unlockPDF(pdfFile, password) {
        const { PDFDocument } = PDFLib;
        const pdfBytes = await pdfFile.arrayBuffer();
        // Load with password, then save without (pdf-lib saves unprotected by default)
        const pdfDoc = await PDFDocument.load(pdfBytes, { password });
        return await pdfDoc.save();
    },

    /**
     * Convert Image to PDF
     */
    async imagesToPDF(imageFiles) {
        const { PDFDocument } = PDFLib;
        const pdfDoc = await PDFDocument.create();

        for (const file of imageFiles) {
            const imgBytes = await file.arrayBuffer();
            let image;
            if (file.type === 'image/jpeg') {
                image = await pdfDoc.embedJpg(imgBytes);
            } else if (file.type === 'image/png') {
                image = await pdfDoc.embedPng(imgBytes);
            } else {
                continue; // Skip unsupported formats for this quick logic
            }

            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });
        }

        return await pdfDoc.save();
    },

    /**
     * Add text watermark to PDF
     */
    async watermarkPDF(pdfFile, text, options = {}) {
        const { PDFDocument, rgb, degrees, StandardFonts } = PDFLib;
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pages = pdfDoc.getPages();

        const {
            fontSize = 50,
            opacity = 0.3,
            color = rgb(0.9, 0, 0),
            rotation = 45
        } = options;

        pages.forEach(page => {
            const { width, height } = page.getSize();
            page.drawText(text, {
                x: width / 4,
                y: height / 2,
                size: fontSize,
                font: font,
                color: color,
                opacity: opacity,
            });
        });

        return await pdfDoc.save();
    },

    /**
     * Delete specific pages from a PDF
     */
    async deletePages(pdfFile, indicesToDelete) {
        const { PDFDocument } = PDFLib;
        const pdfBytes = await pdfFile.arrayBuffer();
        const srcDoc = await PDFDocument.load(pdfBytes);
        const newDoc = await PDFDocument.create();

        const totalPages = srcDoc.getPageCount();
        const allIndices = Array.from({ length: totalPages }, (_, i) => i);
        const indicesToKeep = allIndices.filter(i => !indicesToDelete.includes(i));

        if (indicesToKeep.length === 0) {
            throw new Error("Cannot delete all pages from a PDF.");
        }

        const copiedPages = await newDoc.copyPages(srcDoc, indicesToKeep);
        copiedPages.forEach(page => newDoc.addPage(page));

        return await newDoc.save();
    },


    /**
     * Compress PDF (Simulated iterative compression)
     */
    async compressPDF(pdfFile, targetSizeKB = null) {
        // High-level strategy:
        // 1. Load PDF
        // 2. Identify images
        // 3. Re-embed images with lower quality scaling if targetSize is set
        // For now returns high-quality optimization
        const { PDFDocument } = PDFLib;
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        return await pdfDoc.save({ useObjectStreams: true });
    },

    /**
     * Helper to parse page ranges (e.g., "1, 3-5, 10")
     */
    /**
     * Helper to trigger browser download
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    parseRange(rangeStr, totalPages) {
        const indices = [];
        const parts = rangeStr.split(',').map(p => p.trim());

        parts.forEach(part => {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(n => parseInt(n));
                for (let i = start; i <= end; i++) {
                    if (i >= 1 && i <= totalPages) indices.push(i - 1);
                }
            } else {
                const n = parseInt(part);
                if (n >= 1 && n <= totalPages) indices.push(n - 1);
            }
        });

        return [...new Set(indices)].sort((a, b) => a - b);
    }
};

window.PDFTools = PDFTools;
