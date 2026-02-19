"use client";

import { useState } from "react";
import { FolderPlus, Upload, Home, ChevronRight } from "lucide-react";
import { useDocs } from "@/features/documents/hooks/useDocs";
import { DocumentPreviewModal } from "@/shared/components/DocumentPreviewModal";
import { FolderCard } from "./FolderCard";
import { DocCard } from "./DocCard";
import { DocUploadZone } from "./DocUploadZone";
import { NewFolderModal } from "./NewFolderModal";
import type { DocFolder, Document } from "@/features/documents/types";

type ModalState =
  | { mode: "closed" }
  | { mode: "newFolder" }
  | { mode: "renameFolder"; folder: DocFolder }
  | { mode: "renameDoc"; document: Document }
  | { mode: "preview"; url: string; fileType: string; name: string };

export default function DocsBoard() {
  const {
    folders,
    documents,
    breadcrumb,
    currentFolderId,
    isLoaded,
    isUploading,
    navigateToFolder,
    addFolder,
    renameFolder,
    removeFolder,
    upload,
    removeDocument,
    renameDoc,
  } = useDocs();

  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [showUploadZone, setShowUploadZone] = useState(false);

  const fileInputRef = useState<HTMLInputElement | null>(null);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#9aa0a6]">Loading docs...</p>
      </div>
    );
  }

  const isEmpty = folders.length === 0 && documents.length === 0;

  async function handleUpload(file: File) {
    await upload(file);
    setShowUploadZone(false);
  }

  async function handleDeleteFolder(folder: DocFolder) {
    if (!confirm(`Delete folder "${folder.name}"? Files inside will be moved to root.`)) return;
    await removeFolder(folder.id);
  }

  async function handleDeleteDoc(doc: Document) {
    if (!confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;
    await removeDocument(doc);
  }

  return (
    <section aria-label="Documents">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">Docs</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModal({ mode: "newFolder" })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16181a] border border-[#272829] text-xs font-medium text-[#9aa0a6] hover:text-white hover:border-[#7c3aed]/50 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" /> New Folder
          </button>
          <button
            type="button"
            onClick={() => setShowUploadZone((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7c3aed] text-xs font-medium text-white hover:bg-[#6d28d9] transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Upload
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav aria-label="Folder breadcrumb" className="flex items-center gap-1 mb-4 text-xs">
        <button
          type="button"
          onClick={() => navigateToFolder(null)}
          className={[
            "flex items-center gap-1 px-2 py-1 rounded-md transition-colors",
            currentFolderId === null
              ? "text-white bg-[#272829]"
              : "text-[#9aa0a6] hover:text-white hover:bg-[#272829]",
          ].join(" ")}
        >
          <Home className="w-3 h-3" /> Root
        </button>

        {breadcrumb.map((folder) => (
          <div key={folder.id} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3 text-[#64748b]" />
            <button
              type="button"
              onClick={() => navigateToFolder(folder.id)}
              className={[
                "px-2 py-1 rounded-md transition-colors",
                folder.id === currentFolderId
                  ? "text-white bg-[#272829]"
                  : "text-[#9aa0a6] hover:text-white hover:bg-[#272829]",
              ].join(" ")}
            >
              {folder.name}
            </button>
          </div>
        ))}
      </nav>

      {/* Upload zone (toggled) */}
      {showUploadZone && (
        <div className="mb-4">
          <DocUploadZone onUpload={handleUpload} isUploading={isUploading} />
        </div>
      )}

      {/* Empty state */}
      {isEmpty && !showUploadZone && (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <p className="text-sm font-medium text-white">No files yet</p>
          <p className="text-xs text-[#9aa0a6]">
            Create a folder or upload your first file.
          </p>
          <DocUploadZone onUpload={handleUpload} isUploading={isUploading} />
        </div>
      )}

      {/* Grid: folders then files */}
      {!isEmpty && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onClick={() => navigateToFolder(folder.id)}
              onRename={() => setModal({ mode: "renameFolder", folder })}
              onDelete={() => handleDeleteFolder(folder)}
            />
          ))}
          {documents.map((doc) => (
            <DocCard
              key={doc.id}
              document={doc}
              onPreview={() =>
                setModal({
                  mode: "preview",
                  url: doc.url,
                  fileType: doc.file_type,
                  name: doc.name,
                })
              }
              onRename={() => setModal({ mode: "renameDoc", document: doc })}
              onDelete={() => handleDeleteDoc(doc)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal.mode === "newFolder" && (
        <NewFolderModal
          mode="create"
          onClose={() => setModal({ mode: "closed" })}
          onSubmit={async (name) => {
            await addFolder(name);
          }}
        />
      )}

      {modal.mode === "renameFolder" && (
        <NewFolderModal
          mode="rename"
          currentName={modal.folder.name}
          onClose={() => setModal({ mode: "closed" })}
          onSubmit={async (name) => {
            await renameFolder(modal.folder.id, name);
          }}
        />
      )}

      {modal.mode === "renameDoc" && (
        <NewFolderModal
          mode="rename"
          currentName={modal.document.name}
          onClose={() => setModal({ mode: "closed" })}
          onSubmit={async (name) => {
            await renameDoc(modal.document.id, name);
          }}
        />
      )}

      {modal.mode === "preview" && (
        <DocumentPreviewModal
          url={modal.url}
          fileType={modal.fileType}
          name={modal.name}
          onClose={() => setModal({ mode: "closed" })}
        />
      )}
    </section>
  );
}
