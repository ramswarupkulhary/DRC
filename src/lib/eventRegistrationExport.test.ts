import assert from "node:assert/strict";
import { test } from "node:test";
import { Workbook, ValueType } from "exceljs";
import JSZip from "jszip";
import { buildCategoryWorkbooks, buildRegistrationWorkbook, type RegistrationExportRow } from "./eventRegistrationExport";

const categories = [{ slug: "class-one", name: "One", classLabel: "Class 1" }, { slug: "class-two", name: "Two", classLabel: "Class 2" }];
const rows: RegistrationExportRow[] = [
    { id: "rider-one", category: "class-one,class-two", name: "=SUM(1,2)", email: "rider@example.com", phone: "0012345678", createdAt: new Date("2026-10-19T00:00:00Z"), registrationType: "rider", status: "cancelled", paymentStatus: "paid", amount: 5000 },
    { id: "spectator-one", category: "spectator", name: "Spectator", email: "spectator@example.com", phone: "0098765432", createdAt: new Date("2026-10-19T00:00:00Z"), registrationType: "spectator", status: "active", paymentStatus: "paid", amount: 0 },
];

test("Excel keeps cancelled payment data, phone formatting and names as text", async () => {
    const bytes = await buildRegistrationWorkbook("Test Event", rows, categories);
    const workbook = new Workbook();
    await workbook.xlsx.load(new Uint8Array(bytes).buffer);
    const sheet = workbook.worksheets[0];
    assert.equal(sheet.rowCount, 3);
    assert.equal(sheet.getCell("E2").value, "=SUM(1,2)");
    assert.equal(sheet.getCell("E2").type, ValueType.String);
    assert.equal(sheet.getCell("G2").value, "0012345678");
    assert.equal(sheet.getCell("N2").value, "cancelled");
    assert.equal(sheet.getCell("O2").value, "paid");
});

test("category archive puts multi-category riders in each category and spectators separately", async () => {
    const archive = await JSZip.loadAsync(await buildCategoryWorkbooks("Test Event", rows, categories));
    const files = Object.keys(archive.files);
    assert.equal(files.length, 3);
    for (const filename of files) {
        const workbook = new Workbook();
        await workbook.xlsx.load(new Uint8Array(await archive.file(filename)!.async("uint8array")).buffer);
        const sheet = workbook.worksheets[0];
        assert.equal(sheet.rowCount, 2);
        assert.equal(sheet.getCell("A2").value, filename === "spectator-passes.xlsx" ? "spectator-one" : "rider-one");
    }
});

test("a selected category does not export a multi-category rider's other classes", async () => {
    const archive = await JSZip.loadAsync(await buildCategoryWorkbooks("Test Event", [rows[0]], [categories[0]], "class-one"));
    assert.deepEqual(Object.keys(archive.files), ["Class-1-class-one-registrations.xlsx"]);
});