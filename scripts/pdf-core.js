/**
 * PDF Core Library
 * Shared common functionality for all PDF tools.
 * Handles loading, saving, rendering, and processing of PDF files using pdf-lib and pdf.js.
 */

const PDFCore = {
    // --- Configuration ---
    config: {
        pdfLibUrl: 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
        pdfJsUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
        pdfJsWorkerUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
        downloadFileUrl: 'https://cdnjs.cloudflare.com/ajax/libs/downloadjs/1.4.8/download.min.js',
        jszipUrl: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
    },

    // --- State ---
    state: {
        files: [], // Array of { file, arrayBuffer, pdfDoc, name, size }
        isProcessing: false
    },

    // --- Initialization ---
    async init() {
        console.log('PDF Core Initializing...');
        await this.loadDependencies();

        // Setup PDF.js worker
        if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = this.config.pdfJsWorkerUrl;
        }

        console.log('PDF Core Initialized.');
    },

    async loadDependencies() {
        const loadScript = (url) => {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${url}"]`)) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = url;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        };

        try {
            await Promise.all([
                loadScript(this.config.pdfLibUrl),
                loadScript(this.config.pdfJsUrl),
                loadScript(this.config.downloadFileUrl),
                loadScript(this.config.jszipUrl)
            ]);
        } catch (error) {
            console.error('Failed to load PDF dependencies:', error);
            alert('Failed to load necessary PDF libraries. Please check your internet connection.');
        }
    },

    // --- File Handling ---

    /**
     * Reads a File object and returns ArrayBuffer
     */
    async readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Parse PDF file and return PDFDocument
     */
    async loadPDF(arrayBuffer) {
        const { PDFDocument } = window.PDFLib;
        return await PDFDocument.load(arrayBuffer);
    },

    /**
     * Render a page of a PDF to a canvas/image data URL
     * pageIndex is 1-based index (pdf-lib style) or 0-based? 
     * pdf-lib uses 0-based index for getPage, but 1-based for humans.
     * pdf.js uses 1-based index.
     */
    async renderPageToImage(arrayBuffer, pageNumber, scale = 1.0) {
        if (!window.pdfjsLib) await this.loadDependencies();

        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(pageNumber);

        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        return canvas.toDataURL('image/png');
    },

    // --- Utility Functions ---

    /**
     * Format bytes to human readable string
     */
    formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    },

    /**
     * Download data as file
     */
    downloadFile(data, filename, mimeType) {
        window.download(data, filename, mimeType);
    },

    /**
     * Create a ZIP file from multiple files
     * files: Array of { name: string, data: Blob/ArrayBuffer/String }
     */
    async createZip(files, zipFilename = 'files.zip') {
        const zip = new window.JSZip();
        files.forEach(f => {
            zip.file(f.name, f.data);
        });
        const content = await zip.generateAsync({ type: 'blob' });
        this.downloadFile(content, zipFilename, 'application/zip');
    }
};

// Auto-init specific components if needed, or wait for tools to call init()
