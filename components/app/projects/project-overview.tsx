"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { Layers, GitBranch, FileText, TestTube2, Pencil } from "lucide-react";
import { VisionPreview } from "@/components/app/vision/vision-preview";

interface ProjectOverviewProps {
  projectId: Id<"projects">;
  projectSlug: string;
  visionContent: string;
}

export function ProjectOverview({
  projectId,
  projectSlug,
  visionContent,
}: ProjectOverviewProps) {
  const capabilities = useQuery(api.capabilities.listByProject, { projectId });

  const stats =
    capabilities !== undefined
      ? { capabilityCount: capabilities.length }
      : null;

  return (
    <div className="space-y-6">
      {/* Vision */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Vision Statement
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            nativeButton={false}
            render={<Link href={`/projects/${projectSlug}/vision`} />}
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar Vision
          </Button>
        </div>
        {visionContent ? (
          <div className="rounded-lg border bg-muted/30 px-5 py-10">
            <VisionPreview content={visionContent} />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/10 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Sin visión definida. Haz click en &quot;Editar Vision&quot; para
              comenzar.
            </p>
          </div>
        )}
      </section>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={Layers}
          label="Capabilities"
          value={stats?.capabilityCount}
        />
        <StatCard
          icon={GitBranch}
          label="Features"
          value={undefined}
          loading={capabilities === undefined}
        />
        <StatCard
          icon={FileText}
          label="Specs"
          value={undefined}
          loading={capabilities === undefined}
        />
        <StatCard
          icon={TestTube2}
          label="Tests"
          value={undefined}
          loading={capabilities === undefined}
        />
      </div>

      {/* Capabilities preview */}
      {capabilities !== undefined && capabilities.length === 0 && (
        <EmptyState
          icon={Layers}
          title="Sin capabilities"
          description="Agrega tu primera capability para empezar a estructurar el producto."
        />
      )}

      {capabilities !== undefined && capabilities.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Capabilities ({capabilities.length})
          </h3>
          <div className="space-y-2">
            {capabilities.map((cap) => (
              <div
                key={cap._id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="text-sm font-medium">{cap.name}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {cap.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | undefined;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading || value === undefined ? (
          <div className="h-7 w-12 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}
