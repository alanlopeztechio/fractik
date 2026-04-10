"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SpecMarkdownEditor } from "./spec-markdown-editor";
import type { SpecType } from "./spec-type-badge";

const SPEC_TYPES: { value: SpecType; label: string }[] = [
  { value: "NF", label: "NF – Non-Functional" },
  { value: "BE", label: "BE – Backend" },
  { value: "FE", label: "FE – Frontend" },
  { value: "DA", label: "DA – Data" },
];

export interface SpecFormValues {
  title: string;
  type: SpecType;
  content: string;
  technicalNotes: string;
  constraints: string;
  dependencies: string;
}

export const EMPTY_SPEC_FORM: SpecFormValues = {
  title: "",
  type: "FE",
  content: "",
  technicalNotes: "",
  constraints: "",
  dependencies: "",
};

interface SpecFormProps {
  values: SpecFormValues;
  onChange: (values: SpecFormValues) => void;
}

export function SpecForm({ values, onChange }: SpecFormProps) {
  function set<K extends keyof SpecFormValues>(
    field: K,
    value: SpecFormValues[K]
  ) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="spec-title">
          Título <span className="text-destructive">*</span>
        </Label>
        <Input
          id="spec-title"
          placeholder="ej. Autenticación con JWT"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          autoFocus
        />
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <Label htmlFor="spec-type">
          Tipo <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {SPEC_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => set("type", value)}
              className={[
                "rounded border px-3 py-1 text-sm transition-colors",
                values.type === value
                  ? "border-foreground bg-foreground text-background font-semibold"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <Label>Contenido (Markdown)</Label>
        <SpecMarkdownEditor
          value={values.content}
          onChange={(v) => set("content", v)}
          minHeight="200px"
        />
      </div>

      {/* Optional fields */}
      <details className="group">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground select-none">
          Campos opcionales (notas técnicas, constraints, dependencias)
        </summary>
        <div className="mt-3 space-y-3 pl-1">
          <div className="space-y-1.5">
            <Label htmlFor="spec-notes">Notas técnicas</Label>
            <Textarea
              id="spec-notes"
              placeholder="Consideraciones de implementación..."
              value={values.technicalNotes}
              onChange={(e) => set("technicalNotes", e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="spec-constraints">Constraints</Label>
            <Textarea
              id="spec-constraints"
              placeholder="Restricciones técnicas o de negocio..."
              value={values.constraints}
              onChange={(e) => set("constraints", e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="spec-deps">Dependencias</Label>
            <Textarea
              id="spec-deps"
              placeholder="Specs o sistemas de los que depende..."
              value={values.dependencies}
              onChange={(e) => set("dependencies", e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </details>
    </div>
  );
}
