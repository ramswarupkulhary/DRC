import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_EVENT_PDF_BYTES, validateEventPdf } from "./eventDocuments";

test("event documents accept only bounded PDF uploads", () => {
    assert.equal(validateEventPdf("brief.pdf", Buffer.from("%PDF-1.7\n%%EOF")), null);
    assert.equal(validateEventPdf("brief.PDF", Buffer.from("%PDF-1.7\n%%EOF")), null);
    assert.ok(validateEventPdf("brief.html", Buffer.from("%PDF-1.7")));
    assert.ok(validateEventPdf("brief.pdf", Buffer.from("<html>not a PDF</html>")));
    assert.ok(validateEventPdf("brief.pdf", Buffer.alloc(MAX_EVENT_PDF_BYTES + 1)));
});