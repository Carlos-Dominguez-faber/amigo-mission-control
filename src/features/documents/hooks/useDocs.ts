"use client";

import { useState, useEffect, useCallback } from "react";
import type { Document, DocFolder } from "@/features/documents/types";
import {
  fetchFolders,
  fetchDocuments,
  createFolder as createFolderService,
  renameFolder as renameFolderService,
  deleteFolder as deleteFolderService,
  uploadDocument,
  deleteDocument as deleteDocumentService,
  renameDocument as renameDocumentService,
  fetchFolderAncestors,
} from "@/features/documents/services/docService";

export function useDocs() {
  const [folders, setFolders] = useState<DocFolder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<DocFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const loadContents = useCallback(async (folderId: string | null) => {
    try {
      const [foldersData, docsData] = await Promise.all([
        fetchFolders(folderId),
        fetchDocuments(folderId),
      ]);
      setFolders(foldersData);
      setDocuments(docsData);

      if (folderId) {
        const ancestors = await fetchFolderAncestors(folderId);
        setBreadcrumb(ancestors);
      } else {
        setBreadcrumb([]);
      }
    } catch (err) {
      console.error("[useDocs] Failed to load:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadContents(currentFolderId);
  }, [currentFolderId, loadContents]);

  function navigateToFolder(folderId: string | null) {
    setIsLoaded(false);
    setCurrentFolderId(folderId);
  }

  async function addFolder(name: string): Promise<DocFolder> {
    const folder = await createFolderService(name, currentFolderId);
    setFolders((prev) => [...prev, folder].sort((a, b) => a.name.localeCompare(b.name)));
    return folder;
  }

  async function renameFolder(id: string, name: string): Promise<void> {
    await renameFolderService(id, name);
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name } : f)).sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  async function removeFolder(id: string): Promise<void> {
    await deleteFolderService(id);
    setFolders((prev) => prev.filter((f) => f.id !== id));
  }

  async function upload(file: File): Promise<Document> {
    setIsUploading(true);
    try {
      const doc = await uploadDocument(file, currentFolderId);
      setDocuments((prev) => [doc, ...prev]);
      return doc;
    } finally {
      setIsUploading(false);
    }
  }

  async function removeDocument(doc: Document): Promise<void> {
    await deleteDocumentService(doc);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  }

  async function renameDoc(id: string, name: string): Promise<void> {
    await renameDocumentService(id, name);
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)));
  }

  return {
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
  };
}
