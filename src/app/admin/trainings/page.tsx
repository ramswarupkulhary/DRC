export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function AdminTrainingsPage() {
  const trainings = await prisma.training.findMany({
    orderBy: { createdAt: "desc" },
    include: { registrations: { where: { status: { not: "cancelled" } } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Training Programs</h1>
          <p className="text-muted mt-1">Manage training programs</p>
        </div>
        <Link href="/admin/trainings/new">
          <Button size="sm"><Plus className="w-4 h-4" /> New Training</Button>
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-light text-left text-muted text-xs uppercase tracking-wider">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Enrolled</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {trainings.map((t) => (
                <tr key={t.id} className="hover:bg-surface-light/50">
                  <td className="px-5 py-3 font-medium">{t.title}</td>
                  <td className="px-5 py-3">
                    <Badge variant={t.level === "beginner" ? "success" : t.level === "intermediate" ? "warning" : "orange"}>
                      {t.level}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-muted">{t.duration || "—"}</td>
                  <td className="px-5 py-3 text-orange font-semibold">{formatPrice(t.price)}</td>
                  <td className="px-5 py-3">{t.registrations.length}/{t.totalSlots}</td>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
