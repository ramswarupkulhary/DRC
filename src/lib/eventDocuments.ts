export const MAX_EVENT_PDF_BYTES = 10 * 1024 * 1024;

export function validateEventPdf(filename: string, content: Uint8Array): string | null {
    if (!filename.toLowerCase().endsWith(".pdf")) return "Select a PDF file.";
    if (content.byteLength > MAX_EVENT_PDF_BYTES) return "PDF files must be 10 MB or smaller.";
    if (content.byteLength < 5 || Buffer.from(content.subarray(0, 5)).toString("ascii") !== "%PDF-") return "The uploaded file is not a valid PDF.";
    return null;
}