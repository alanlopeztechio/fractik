"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/app/status-badge";
import { SpecTypeBadge } from "./spec-type-badge";
import { SpecForm, EMPTY_SPEC_FORM, type SpecFormValues } from "./spec-form";
import { SpecDetailDialog } from "./spec-detail-dialog";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";

interface SpecRowProps {
  spec: Doc<"specs">;
}

function SpecRow({ spec }: SpecRowProps) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setDetailOpen(true)}
        className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-2 min-w-0">
          <SpecTypeBadge type={spec.type} />
          <span className="text-sm truncate">{spec.title}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            v{spec.versionNumber}
          </span>
        </div>
        <StatusBadge status={spec.status} className="shrink-0 ml-2" />
      </button>

      <SpecDetailDialog
        spec={spec}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}

interface SpecsSectionProps {
  featureId: Id<"features">;
}

export function SpecsSection({ featureId }: SpecsSectionProps) {
  const specs = useQuery(api.specs.listByFeature, { featureId });
  const createSpec = useMutation(api.specs.create);

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<SpecFormValues>(EMPTY_SPEC_FORM);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!values.title.trim()) {
      toast.error("El título es requerido");
      return;
    }
    setLoading(true);
    try {
      await createSpec({
        featureId,
        type: values.type,
        title: values.title.trim(),
        content: values.content || undefined,
      });
      toast.success("Spec creada");
      setValues(EMPTY_SPEC_FORM);
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear spec");
    } finally {
      setLoading(false);
    }
  }

  const count = specs?.length ?? 0;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <FileText className="h-4 w-4" />
          Specs{count > 0 ? ` (${count})` : ""}
        </h3>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" />}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Nueva spec
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Spec</DialogTitle>
            </DialogHeader>
            <SpecForm values={values} onChange={setValues} />
            <DialogFooter showCloseButton className="items-center">
              <Button onClick={handleCreate} disabled={loading} size="sm">
                Crear spec
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {specs === undefined ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : specs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No hay specs aún. Crea la primera.
        </p>
      ) : (
        <div className="space-y-2">
          {specs.map((spec) => (
            <SpecRow key={spec._id} spec={spec} />
          ))}
        </div>
      )}
    </section>
  );
}
