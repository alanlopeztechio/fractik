"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserStoryForm, type UserStoryFormValues } from "./user-story-form";
import { Pencil, Trash2, Plus, X, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface UserStoryCardProps {
  story: Doc<"userStories">;
}

export function UserStoryCard({ story }: UserStoryCardProps) {
  const updateStory = useMutation(api.userStories.update);
  const removeStory = useMutation(api.userStories.remove);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editValues, setEditValues] = useState<UserStoryFormValues>({
    persona: story.persona,
    action: story.action,
    benefit: story.benefit,
  });
  const [editLoading, setEditLoading] = useState(false);

  // Criteria state
  const [newCriterion, setNewCriterion] = useState("");
  const [addingCriterion, setAddingCriterion] = useState(false);

  async function handleEditSave() {
    if (
      !editValues.persona.trim() ||
      !editValues.action.trim() ||
      !editValues.benefit.trim()
    ) {
      toast.error("Todos los campos son requeridos");
      return;
    }
    setEditLoading(true);
    try {
      await updateStory({ storyId: story._id, ...editValues });
      toast.success("Historia actualizada");
      setEditOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    try {
      await removeStory({ storyId: story._id });
      toast.success("Historia eliminada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar");
    }
  }

  async function handleAddCriterion() {
    const text = newCriterion.trim();
    if (!text) return;
    const updated = [
      ...story.criteria,
      {
        id: crypto.randomUUID(),
        text,
        sortOrder: story.criteria.length,
      },
    ];
    try {
      await updateStory({ storyId: story._id, criteria: updated });
      setNewCriterion("");
      setAddingCriterion(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al agregar criterio");
    }
  }

  async function handleRemoveCriterion(id: string) {
    const updated = story.criteria
      .filter((c) => c.id !== id)
      .map((c, i) => ({ ...c, sortOrder: i }));
    try {
      await updateStory({ storyId: story._id, criteria: updated });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Error al eliminar criterio"
      );
    }
  }

  const sortedCriteria = [...story.criteria].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <div className="rounded-lg border p-3 space-y-3">
      {/* Summary */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm">
          Como <strong>{story.persona}</strong>, quiero{" "}
          <strong>{story.action}</strong> para <strong>{story.benefit}</strong>
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Editar historia"
                />
              }
            >
              <Pencil className="h-3.5 w-3.5" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar historia</DialogTitle>
              </DialogHeader>
              <UserStoryForm values={editValues} onChange={setEditValues} />
              <DialogFooter showCloseButton>
                <Button
                  onClick={handleEditSave}
                  disabled={editLoading}
                  size="sm"
                >
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="icon-sm"
            title="Eliminar historia"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Acceptance criteria */}
      <div className="space-y-1">
        {sortedCriteria.length > 0 && (
          <p className="text-xs font-medium text-muted-foreground">
            Acceptance Criteria ({sortedCriteria.length})
          </p>
        )}
        <ul className="space-y-1">
          {sortedCriteria.map((criterion) => (
            <li
              key={criterion.id}
              className="flex items-center gap-2 group text-sm"
            >
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
              <span className="flex-1">{criterion.text}</span>
              <button
                type="button"
                onClick={() => handleRemoveCriterion(criterion.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar criterio"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </li>
          ))}
        </ul>

        {addingCriterion ? (
          <div className="flex items-center gap-2 mt-1">
            <Input
              className="h-7 text-sm"
              placeholder="Nuevo criterio..."
              value={newCriterion}
              onChange={(e) => setNewCriterion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCriterion();
                if (e.key === "Escape") {
                  setAddingCriterion(false);
                  setNewCriterion("");
                }
              }}
              autoFocus
            />
            <Button size="sm" variant="outline" onClick={handleAddCriterion}>
              Agregar
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => {
                setAddingCriterion(false);
                setNewCriterion("");
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingCriterion(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar criterio
          </button>
        )}
      </div>
    </div>
  );
}
