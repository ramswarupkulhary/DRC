export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgramCatalogManager } from "@/components/admin/ProgramCatalogManager";

export default async function AdminTrainingsPage() {
  const trainings = await prisma.training.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      {/* Core off-road training & trail programs (Off-Road, Private 1:1, guided trails) */}
      <ProgramCatalogManager
        categories={["foundation", "trail", "skill", "adventure", "multiday", "practice"]}
        defaultCategory="foundation"
        title="Off-Road Training & Trails"
        subtitle="Off-Road training, Private 1:1 coaching and guided trails shown on the Training page."
        newLabel="New Training / Trail"
      />

      <div className="border-t border-border pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold">Special Trails</h2>
            <p className="text-muted mt-1 text-sm">Location-based trail sessions (any location — Kanakapura, Krishnagiri, etc.).</p>
          </div>
          <Link href="/admin/trainings/new">
            <Button size="sm"><Plus className="w-4 h-4" /> New Special Trail</Button>
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-sm overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-light text-left text-muted text-xs uppercase tracking-wider">
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {trainings.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-light/50">
                    <td className="px-5 py-3 font-medium">{t.title}</td>
                    <td className="px-5 py-3">
                      <Badge variant={t.category === "training" ? "orange" : "success"}>
                        {t.category === "training" ? "Training" : "Special Trail"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-muted">{t.location || "—"}</td>
                    <td className="px-5 py-3 text-orange font-semibold">{formatPrice(t.price)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={t.status === "published" ? "success" : "muted"}>{t.status}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/trainings/${t.id}/edit`} className="text-orange hover:underline inline-flex items-center gap-1 text-xs">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {trainings.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-6 text-center text-muted">No special trails yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
