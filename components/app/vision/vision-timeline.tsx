"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Clock, Eye, GitCompareArrows, StickyNote } from "lucide-react";

interface VisionTimelineProps {
  projectId: Id<"projects">;
  currentVersionNumber: number;
  onSelectVersion: (versionId: string) => void;
  onDiffVersion: (versionId: string) => void;
  selectedVersionId: string | null;
}

export function VisionTimeline({
  projectId,
  currentVersionNumber,
  onSelectVersion,
  onDiffVersion,
  selectedVersionId,
}: VisionTimelineProps) {
  const versions = useQuery(api.projects.listVisionVersions, { projectId });

  return (
    <div className="rounded-lg border bg-background">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Historial de versiones
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Versión actual: v{currentVersionNumber}
        </p>
      </div>
      <ScrollArea className="h-[500px]">
        {versions === undefined && (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        )}

        {versions !== undefined && versions.length === 0 && (
          <div className="p-4">
            <p className="text-sm text-muted-foreground text-center py-8">
              Sin historial de versiones.
            </p>
          </div>
        )}

        {versions !== undefined && versions.length > 0 && (
          <div className="p-2 space-y-1">
            {versions.map((version) => {
              const isSelected = selectedVersionId === (version._id as string);
              return (
                <div
                  key={version._id as string}
                  className={`rounded-md border p-3 transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">
                      v{version.versionNumber}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(version.changedAt)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    {new Date(version.changedAt).toLocaleDateString("es", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {version.changeNote && (
                    <div className="flex items-start gap-1.5 mb-2">
                      <StickyNote className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground italic line-clamp-2">
                        {version.changeNote}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={() => onSelectVersion(version._id as string)}
                    >
                      <Eye className="h-3 w-3" />
                      Ver
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={() => onDiffVersion(version._id as string)}
                    >
                      <GitCompareArrows className="h-3 w-3" />
                      Diff
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes}m`;
  if (hours < 24) return `hace ${hours}h`;
  if (days < 7) return `hace ${days}d`;
  return new Date(timestamp).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
  });
}
