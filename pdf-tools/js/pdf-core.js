/**
 * PDF Tools Core Library
 * Shared functionality for client-side PDF processing
 */

const PDFCore = {
    // Initialize and load dependencies if needed
    init: async () => {
        if (typeof PDFLib === 'undefined') {
            console.error('PDF-Lib not loaded');
            return false;
        }
        return true;
    },

    // Load PDF file into PDFDocument
    loadPDF: async (file) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            return pdfDoc;
        } catch (error) {
            console.error('Error loading PDF:', error);
            throw new Error('Invalid or corrupted PDF file');
        }
    },

    // Save PDFDocument to blob and trigger download
    saveAndDownload: async (pdfDoc, filename) => {
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Utility: Format bytes
    formatSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Utility: Get page count
    getPageCount: async (file) => {
        const doc = await PDFCore.loadPDF(file);
        return doc.getPageCount();
    }
};

window.PDFCore = PDFCore;
