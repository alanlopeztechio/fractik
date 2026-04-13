"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { VisionEditor } from "@/components/app/vision/vision-editor";
import { Breadcrumbs } from "@/components/app/breadcrumbs";

export default function VisionPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = useQuery(api.projects.getBySlug, { slug });

  if (project === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
        <div className="mt-6 h-96 w-full animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold">Proyecto no encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          El proyecto no existe o no pertenece a tu organización.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Proyectos", href: "/dashboard" },
          { label: project.name, href: `/projects/${slug}` },
          { label: "Vision Statement" },
        ]}
      />
      <VisionEditor project={project} />
    </div>
  );
}
