"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface UserStoryFormValues {
  persona: string;
  action: string;
  benefit: string;
}

interface UserStoryFormProps {
  values: UserStoryFormValues;
  onChange: (values: UserStoryFormValues) => void;
}

export function UserStoryForm({ values, onChange }: UserStoryFormProps) {
  function set(field: keyof UserStoryFormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...values, [field]: e.target.value });
  }

  const hasPreview = values.persona || values.action || values.benefit;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="us-persona">Persona</Label>
        <Input
          id="us-persona"
          placeholder="ej. desarrollador"
          value={values.persona}
          onChange={set("persona")}
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="us-action">Acción</Label>
        <Input
          id="us-action"
          placeholder="ej. ver un historial de cambios"
          value={values.action}
          onChange={set("action")}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="us-benefit">Beneficio</Label>
        <Input
          id="us-benefit"
          placeholder="ej. entender la evolución del proyecto"
          value={values.benefit}
          onChange={set("benefit")}
        />
      </div>

      {hasPreview && (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          Como{" "}
          <strong className="text-foreground">{values.persona || "…"}</strong>,
          quiero{" "}
          <strong className="text-foreground">{values.action || "…"}</strong>{" "}
          para{" "}
          <strong className="text-foreground">{values.benefit || "…"}</strong>
        </p>
      )}
    </div>
  );
}
