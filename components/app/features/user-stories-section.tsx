"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserStoryForm, type UserStoryFormValues } from "./user-story-form";
import { UserStoryCard } from "./user-story-card";
import { BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";

interface UserStoriesSectionProps {
  featureId: Id<"features">;
}

const EMPTY_FORM: UserStoryFormValues = {
  persona: "",
  action: "",
  benefit: "",
};

export function UserStoriesSection({ featureId }: UserStoriesSectionProps) {
  const userStories = useQuery(api.userStories.listByFeature, { featureId });
  const createStory = useMutation(api.userStories.create);

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<UserStoryFormValues>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (
      !values.persona.trim() ||
      !values.action.trim() ||
      !values.benefit.trim()
    ) {
      toast.error("Todos los campos son requeridos");
      return;
    }
    setLoading(true);
    try {
      await createStory({ featureId, ...values });
      toast.success("Historia creada");
      setValues(EMPTY_FORM);
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear historia");
    } finally {
      setLoading(false);
    }
  }

  const count = userStories?.length ?? 0;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" />
          User Stories{count > 0 ? ` (${count})` : ""}
        </h3>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" />}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Nueva historia
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva User Story</DialogTitle>
            </DialogHeader>
            <UserStoryForm values={values} onChange={setValues} />
            <DialogFooter showCloseButton className="items-center">
              <Button onClick={handleCreate} disabled={loading} size="sm">
                Crear historia
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {userStories === undefined ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : userStories.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No hay user stories aún. Crea la primera.
        </p>
      ) : (
        <div className="space-y-2">
          {userStories.map((story) => (
            <UserStoryCard key={story._id} story={story} />
          ))}
        </div>
      )}
    </section>
  );
}
