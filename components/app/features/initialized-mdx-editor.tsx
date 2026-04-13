"use client";

import "@mdxeditor/editor/style.css";

import {
  MDXEditor,
  type MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  linkPlugin,
  linkDialogPlugin,
  toolbarPlugin,
  UndoRedo,
  Separator,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertTable,
  InsertCodeBlock,
  ListsToggle,
} from "@mdxeditor/editor";
import { type FC } from "react";

interface InitializedMDXEditorProps {
  markdown: string;
  onChange?: (value: string) => void;
  editorRef?: React.MutableRefObject<MDXEditorMethods | null>;
  placeholder?: string;
  readOnly?: boolean;
}

/**
 * Inner component loaded dynamically (no SSR).
 * Proxying the ref is necessary — Next.js dynamic imports don't support refs directly.
 */
const InitializedMDXEditor: FC<InitializedMDXEditorProps> = ({
  markdown,
  onChange,
  editorRef,
  placeholder,
  readOnly = false,
}) => {
  return (
    <MDXEditor
      ref={editorRef}
      markdown={markdown}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      contentEditableClassName="prose prose-sm dark:prose-invert max-w-none min-h-[200px] px-3 py-2 focus:outline-none"
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "ts" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            ts: "TypeScript",
            tsx: "TypeScript (React)",
            js: "JavaScript",
            jsx: "JavaScript (React)",
            css: "CSS",
            json: "JSON",
            bash: "Shell",
            sh: "Shell",
            sql: "SQL",
            mermaid: "Mermaid",
          },
        }),
        linkPlugin(),
        linkDialogPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <BoldItalicUnderlineToggles />
              <Separator />
              <ListsToggle />
              <Separator />
              <CreateLink />
              <InsertTable />
              <InsertCodeBlock />
            </>
          ),
        }),
      ]}
    />
  );
};

export default InitializedMDXEditor;
