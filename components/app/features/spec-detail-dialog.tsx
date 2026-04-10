"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/app/status-badge";
import { SpecTypeBadge } from "./spec-type-badge";
import { SpecMarkdownEditor } from "./spec-markdown-editor";
import { ChevronRight, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type SpecStatus = Doc<"specs">["status"];

const STATUS_FLOW: SpecStatus[] = [
  "draft",
  "reviewed",
  "approved",
  "implemented",
];

const STATUS_TRANSITIONS: Record<string, SpecStatus[]> = {
  draft: ["reviewed"],
  reviewed: ["approved"],
  approved: ["implemented", "deprecated"],
  implemented: ["deprecated"],
  deprecated: [],
};

interface SpecDetailDialogProps {
  spec: Doc<"specs">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SpecDetailDialog({
  spec,
  open,
  onOpenChange,
}: SpecDetailDialogProps) {
  const updateContent = useMutation(api.specs.updateContent);
  const updateStatus = useMutation(api.specs.updateStatus);
  const updateMeta = useMutation(api.specs.updateMeta);
  const removeSpec = useMutation(api.specs.remove);

  // Content editing
  const [content, setContent] = useState(spec.content);
  const [contentDirty, setContentDirty] = useState(false);
  const [savingContent, setSavingContent] = useState(false);

  // Meta editing
  const [title, setTitle] = useState(spec.title);
  const [technicalNotes, setTechnicalNotes] = useState(
    spec.technicalNotes ?? ""
  );
  const [constraints, setConstraints] = useState(spec.constraints ?? "");
  const [dependencies, setDependencies] = useState(spec.dependencies ?? "");
  const [savingMeta, setSavingMeta] = useState(false);

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleContentChange(v: string) {
    setContent(v);
    setContentDirty(v !== spec.content);
  }

  async function handleSaveContent() {
    setSavingContent(true);
    try {
      await updateContent({ specId: spec._id, content });
      setContentDirty(false);
      toast.success(`v${spec.versionNumber + 1} guardada`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSavingContent(false);
    }
  }

  async function handleSaveMeta() {
    if (!title.trim()) {
      toast.error("El título es requerido");
      return;
    }
    setSavingMeta(true);
    try {
      await updateMeta({
        specId: spec._id,
        title: title.trim(),
        technicalNotes: technicalNotes || undefined,
        constraints: constraints || undefined,
        dependencies: dependencies || undefined,
      });
      toast.success("Metadata actualizada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSavingMeta(false);
    }
  }

  async function handleStatusChange(status: SpecStatus) {
    try {
      await updateStatus({ specId: spec._id, status });
      toast.success(`Status: ${status}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transición inválida");
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await removeSpec({ specId: spec._id });
      toast.success("Spec eliminada");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const nextTransitions = STATUS_TRANSITIONS[spec.status] ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto ">
        <DialogHeader className="pr-10">
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <SpecTypeBadge type={spec.type} />
            <span className="truncate">{title}</span>
            <StatusBadge status={spec.status} className="ml-auto" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status workflow */}
          <section className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Status
            </p>
            {/* Visual flow */}
            <div className="flex items-center gap-1 flex-wrap text-xs text-muted-foreground">
              {STATUS_FLOW.map((s, i) => (
                <span key={s} className="flex items-center gap-1">
                  <span
                    className={
                      s === spec.status ? "font-bold text-foreground" : ""
                    }
                  >
                    {s}
                  </span>
                  {i < STATUS_FLOW.length - 1 && (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </span>
              ))}
            </div>
            {/* Transition buttons */}
            {nextTransitions.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {nextTransitions.map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={s === "deprecated" ? "destructive" : "outline"}
                    onClick={() => handleStatusChange(s)}
                    className="h-7 text-xs"
                  >
                    → {s}
                  </Button>
                ))}
              </div>
            )}
          </section>

          {/* Title */}
          <section className="space-y-1.5">
            <Label htmlFor="detail-title">Título</Label>
            <div className="flex gap-2">
              <Input
                id="detail-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1"
              />
            </div>
          </section>

          {/* Content editor */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Contenido{" "}
                <span className="normal-case font-normal">
                  (v{spec.versionNumber})
                </span>
              </p>
              {contentDirty && (
                <Button
                  size="sm"
                  onClick={handleSaveContent}
                  disabled={savingContent}
                  className="h-7 text-xs"
                >
                  Guardar versión
                </Button>
              )}
            </div>
            <SpecMarkdownEditor
              value={content}
              onChange={handleContentChange}
              minHeight="250px"
            />
          </section>

          {/* Optional fields */}
          <details className="group">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground select-none">
              Notas técnicas · Constraints · Dependencias
            </summary>
            <div className="mt-3 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="detail-notes">Notas técnicas</Label>
                <Textarea
                  id="detail-notes"
                  value={technicalNotes}
                  onChange={(e) => setTechnicalNotes(e.target.value)}
                  rows={3}
                  placeholder="Consideraciones de implementación..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="detail-constraints">Constraints</Label>
                <Textarea
                  id="detail-constraints"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  rows={3}
                  placeholder="Restricciones técnicas o de negocio..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="detail-deps">Dependencias</Label>
                <Textarea
                  id="detail-deps"
                  value={dependencies}
                  onChange={(e) => setDependencies(e.target.value)}
                  rows={3}
                  placeholder="Specs o sistemas de los que depende..."
                />
              </div>
            </div>
          </details>
        </div>
        {/* end scrollable body */}

        <DialogFooter className="sticky bottom-0 bg-popover flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {/* Delete */}
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm">
                ¿Eliminar con todos los test cases?
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                Confirmar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDelete(false)}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Eliminar
            </Button>
          )}

          {/* Save meta */}
          <Button size="sm" onClick={handleSaveMeta} disabled={savingMeta}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
