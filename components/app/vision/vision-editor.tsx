"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Pencil, Save, History, X } from "lucide-react";
import { toast } from "sonner";
import { VisionPreview } from "@/components/app/vision/vision-preview";
import { VisionTimeline } from "@/components/app/vision/vision-timeline";
import { VisionDiffViewer } from "@/components/app/vision/vision-diff-viewer";

interface VisionEditorProps {
  project: Doc<"projects">;
}

type ViewMode = "edit" | "preview" | "version-detail" | "version-diff";

export function VisionEditor({ project }: VisionEditorProps) {
  const [mode, setMode] = useState<ViewMode>(
    project.visionContent ? "preview" : "edit"
  );
  const [content, setContent] = useState(project.visionContent);
  const [changeNote, setChangeNote] = useState("");
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const updateVision = useMutation(api.projects.updateVision);
  const versions = useQuery(api.projects.listVisionVersions, {
    projectId: project._id,
  });

  const handleSave = useCallback(async () => {
    if (content === project.visionContent) {
      toast.info("Sin cambios");
      return;
    }
    setSaving(true);
    try {
      await updateVision({
        projectId: project._id,
        content,
        changeNote: changeNote || undefined,
      });
      setChangeNote("");
      setMode("preview");
      toast.success("Vision guardada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [content, changeNote, project._id, project.visionContent, updateVision]);

  const handleEdit = useCallback(() => {
    setContent(project.visionContent);
    setSelectedVersionId(null);
    setMode("edit");
  }, [project.visionContent]);

  const handleCancelEdit = useCallback(() => {
    setContent(project.visionContent);
    setChangeNote("");
    setMode("preview");
  }, [project.visionContent]);

  const handleVersionSelect = useCallback((versionId: string) => {
    setSelectedVersionId(versionId);
    setMode("version-detail");
  }, []);

  const handleVersionDiff = useCallback((versionId: string) => {
    setSelectedVersionId(versionId);
    setMode("version-diff");
  }, []);

  const handleBackToPreview = useCallback(() => {
    setSelectedVersionId(null);
    setMode("preview");
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Vision Statement</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTimeline(!showTimeline)}
            className="gap-1.5"
          >
            <History className="h-4 w-4" />
            Historial
            {versions && versions.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                {versions.length}
              </span>
            )}
          </Button>

          {mode === "edit" ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="gap-1.5"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || content === project.visionContent}
                className="gap-1.5"
              >
                <Save className="h-4 w-4" />
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="gap-1.5"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          {mode === "edit" && (
            <div className="space-y-3">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe la visión del proyecto en Markdown…&#10;&#10;Puedes usar diagramas Mermaid con bloques ```mermaid"
                className="min-h-[400px] font-mono text-sm resize-y"
              />
              <div>
                <Input
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  placeholder="Nota de cambio (opcional)"
                  className="max-w-md"
                />
              </div>
            </div>
          )}

          {mode === "preview" && (
            <div className="rounded-lg border bg-muted/30 p-6 min-h-50">
              {project.visionContent ? (
                <VisionPreview content={project.visionContent} />
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Sin visión definida. Haz click en &quot;Editar&quot; para
                  comenzar.
                </p>
              )}
            </div>
          )}

          {mode === "version-detail" && selectedVersionId && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToPreview}
                  className="gap-1.5"
                >
                  <X className="h-4 w-4" />
                  Volver
                </Button>
                <span className="text-sm text-muted-foreground">
                  Vista de versión anterior (solo lectura)
                </span>
              </div>
              <VersionDetailView versionId={selectedVersionId} />
            </div>
          )}

          {mode === "version-diff" && selectedVersionId && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToPreview}
                  className="gap-1.5"
                >
                  <X className="h-4 w-4" />
                  Volver
                </Button>
                <span className="text-sm text-muted-foreground">
                  Comparando versión seleccionada con la actual
                </span>
              </div>
              <VisionDiffViewer
                versionId={selectedVersionId}
                currentContent={project.visionContent}
              />
            </div>
          )}
        </div>

        {/* Timeline sidebar */}
        {showTimeline && (
          <div className="w-80 shrink-0">
            <VisionTimeline
              projectId={project._id}
              currentVersionNumber={project.visionVersionNumber}
              onSelectVersion={handleVersionSelect}
              onDiffVersion={handleVersionDiff}
              selectedVersionId={selectedVersionId}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function VersionDetailView({ versionId }: { versionId: string }) {
  const version = useQuery(api.projects.getVisionVersion, {
    versionId: versionId as Id<"visionVersions">,
  });

  if (version === undefined) {
    return <div className="h-48 animate-pulse rounded-lg bg-muted" />;
  }

  if (version === null) {
    return (
      <p className="text-sm text-muted-foreground">Versión no encontrada.</p>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-6">
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Eye className="h-3.5 w-3.5" />
        <span>Versión {version.versionNumber}</span>
        <span>·</span>
        <span>{new Date(version.changedAt).toLocaleString()}</span>
        {version.changeNote && (
          <>
            <span>·</span>
            <span className="italic">{version.changeNote}</span>
          </>
        )}
      </div>
      <VisionPreview content={version.content} />
    </div>
  );
}
