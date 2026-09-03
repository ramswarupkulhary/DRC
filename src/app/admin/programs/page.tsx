"use client";

import { ProgramCatalogManager } from "@/components/admin/ProgramCatalogManager";

export default function AdminProgramsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading text-2xl font-bold">Programs</h1>
                <p className="text-muted mt-1 text-sm">Family &amp; Friends experiences. Add more here as you grow.</p>
            </div>
            <ProgramCatalogManager
                categories={["special"]}
                defaultCategory="special"
                title="Family & Friends"
                subtitle="Overnighter and group experiences with per-person and per-kid pricing."
                newLabel="New Program"
            />
        </div>
    );
}
