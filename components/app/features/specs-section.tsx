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
import { ChevronRightIcon, FileText, Plus, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import TestCaseFrom, {
  TestCaseFormValues,
} from "@/components/app/features/test-case-from";

interface SpecRowProps {
  spec: Doc<"specs">;
}

function SpecRow({ spec }: SpecRowProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [testCaseOpen, setTestCaseOpen] = useState(false);
  const tests = useQuery(api.testCases.listBySpec, { specId: spec._id });

  return (
    <div className="border rounded-lg bg-background">
      <Collapsible className="group">
        <div className="flex flex-row items-center px-2 gap-2">
          <CollapsibleTrigger>
            <Button
              variant="ghost"
              size="sm"
              className="group w-full justify-start transition-none hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronRightIcon className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
            </Button>
          </CollapsibleTrigger>

          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className="flex w-full items-center justify-between py-3 pr-4 text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <SpecTypeBadge type={spec.type} />
              <span className="text-sm truncate font-medium">{spec.title}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                v{spec.versionNumber}
              </span>
            </div>
            <StatusBadge status={spec.status} className="shrink-0 ml-2" />
          </button>
        </div>

        <CollapsibleContent className="border-t bg-muted/30">
          <div className="p-4">
            {tests && tests.length > 0 ? (
              <>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Test Cases
                </h2>
                <ul className="space-y-1">
                  {tests.map((test) => (
                    <li
                      key={test._id}
                      className="text-sm text-foreground/80 bg-background/50 p-2 rounded border border-white/5"
                    >
                      {test.title}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-2">
                <button
                  type="button"
                  onClick={() => setTestCaseOpen(true)}
                  className="group flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/20 p-6 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 group-hover:bg-emerald-500/20">
                    <PlusIcon className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground group-hover:text-emerald-500">
                      No hay test cases
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Haz clic para agregar el primero
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <SpecDetailDialog
        spec={spec}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <TestCaseFrom
        specId={spec._id}
        open={testCaseOpen}
        openChange={setTestCaseOpen}
      />
    </div>
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
