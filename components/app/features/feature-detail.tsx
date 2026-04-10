"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { InlineEdit } from "@/components/app/inline-edit";
import { StatusBadge } from "@/components/app/status-badge";
import { AcceptanceCriteriaEditor } from "@/components/app/features/acceptance-criteria-editor";
import { Breadcrumbs } from "@/components/app/breadcrumbs";
import { UserStoriesSection } from "./user-stories-section";
import { SpecsSection } from "./specs-section";
import { toast } from "sonner";

interface FeatureDetailProps {
  feature: Doc<"features">;
}

const statusFlow = [
  "draft",
  "defined",
  "spec_ready",
  "in_progress",
  "done",
] as const;

export function FeatureDetail({ feature }: FeatureDetailProps) {
  const updateFeature = useMutation(api.features.update);
  const capability = useQuery(api.capabilities.get, {
    capabilityId: feature.capabilityId,
  });
  async function handleNameSave(name: string) {
    try {
      await updateFeature({ featureId: feature._id, name });
      toast.success("Nombre actualizado");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar"
      );
    }
  }

  async function handleDescriptionSave(description: string) {
    try {
      await updateFeature({ featureId: feature._id, description });
      toast.success("Descripción actualizada");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar"
      );
    }
  }

  async function handleStatusAdvance() {
    const currentIndex = statusFlow.indexOf(
      feature.status as (typeof statusFlow)[number]
    );
    if (currentIndex < 0 || currentIndex >= statusFlow.length - 1) return;
    const nextStatus = statusFlow[currentIndex + 1];
    try {
      await updateFeature({ featureId: feature._id, status: nextStatus });
      toast.success(`Status: ${nextStatus}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Transición inválida"
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      {capability && (
        <Breadcrumbs
          items={[
            { label: "Capabilities", href: "/projects" },
            { label: capability.name, href: undefined },
            { label: feature.name },
          ]}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <InlineEdit
          value={feature.name}
          onSave={handleNameSave}
          as="h1"
          className="text-2xl font-bold tracking-tight"
        />
        <button
          type="button"
          onClick={handleStatusAdvance}
          title="Avanzar status"
        >
          <StatusBadge
            status={feature.status}
            className="cursor-pointer hover:opacity-80"
          />
        </button>
      </div>

      {/* Status flow */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {statusFlow.map((s, i) => (
          <span key={s} className="flex items-center gap-1">
            <span
              className={
                s === feature.status ? "font-bold text-foreground" : ""
              }
            >
              {s.replace("_", " ")}
            </span>
            {i < statusFlow.length - 1 && <span>→</span>}
          </span>
        ))}
      </div>

      {/* Description */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Descripción
        </h3>
        <InlineEdit
          value={feature.description}
          onSave={handleDescriptionSave}
          placeholder="Agrega una descripción..."
          multiline
          as="p"
          className="text-sm"
        />
      </section>

      {/* Acceptance Criteria */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Acceptance Criteria ({feature.acceptanceCriteria.length})
        </h3>
        <AcceptanceCriteriaEditor
          featureId={feature._id}
          criteria={feature.acceptanceCriteria}
        />
      </section>

      {/* User Stories */}
      <UserStoriesSection featureId={feature._id} />

      {/* Specs */}
      <SpecsSection featureId={feature._id} />
    </div>
  );
}
