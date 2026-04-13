"use client";

import dynamic from "next/dynamic";
import { Suspense, useRef } from "react";
import type { MDXEditorMethods } from "@mdxeditor/editor";

// Must be dynamically imported with ssr: false — MDXEditor uses browser-only APIs
const InitializedMDXEditor = dynamic(() => import("./initialized-mdx-editor"), {
  ssr: false,
});

interface SpecMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function SpecMarkdownEditor({
  value,
  onChange,
  placeholder = "Escribe el contenido en Markdown…",
  readOnly = false,
}: SpecMarkdownEditorProps) {
  const editorRef = useRef<MDXEditorMethods | null>(null);

  return (
    <div className="rounded-md border bg-background overflow-hidden">
      <Suspense
        fallback={
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Cargando editor…
          </div>
        }
      >
        <InitializedMDXEditor
          markdown={value}
          onChange={onChange}
          editorRef={editorRef}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      </Suspense>
    </div>
  );
}
