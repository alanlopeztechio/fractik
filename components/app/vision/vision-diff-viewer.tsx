"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { diffLines, type Change } from "diff";

interface VisionDiffViewerProps {
  versionId: string;
  currentContent: string;
}

export function VisionDiffViewer({
  versionId,
  currentContent,
}: VisionDiffViewerProps) {
  const version = useQuery(api.projects.getVisionVersion, {
    versionId: versionId as Id<"visionVersions">,
  });

  const changes = useMemo(() => {
    if (!version) return null;
    return diffLines(version.content, currentContent);
  }, [version, currentContent]);

  if (version === undefined) {
    return <div className="h-48 animate-pulse rounded-lg bg-muted" />;
  }

  if (version === null) {
    return (
      <p className="text-sm text-muted-foreground">Versión no encontrada.</p>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="border-b bg-muted/50 px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          v{version.versionNumber} → v actual
        </span>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500/20 border border-red-500/40" />
            Eliminado
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500/20 border border-green-500/40" />
            Añadido
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm font-mono leading-relaxed">
          {changes?.map((change: Change, i: number) => (
            <DiffLine key={i} change={change} />
          ))}
          {changes && changes.length === 0 && (
            <span className="text-muted-foreground italic">
              Sin diferencias
            </span>
          )}
        </pre>
      </div>
    </div>
  );
}

function DiffLine({ change }: { change: Change }) {
  if (change.added) {
    return (
      <span className="block bg-green-500/10 text-green-700 dark:text-green-400 border-l-2 border-green-500 pl-3 -ml-4">
        {formatLines(change.value, "+")}
      </span>
    );
  }
  if (change.removed) {
    return (
      <span className="block bg-red-500/10 text-red-700 dark:text-red-400 border-l-2 border-red-500 pl-3 -ml-4">
        {formatLines(change.value, "-")}
      </span>
    );
  }
  return <span className="block pl-4">{formatLines(change.value, " ")}</span>;
}

function formatLines(text: string, prefix: string): string {
  const lines = text.replace(/\n$/, "").split("\n");
  return lines.map((line) => `${prefix} ${line}`).join("\n") + "\n";
}
